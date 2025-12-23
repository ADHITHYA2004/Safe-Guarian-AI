require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const dbPromise = require('./db/init');
const createDbHelpers = require('./db/helpers');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Database helpers will be initialized after database connection
let dbHelpers;
let dbInitialized = false;

// Initialize database and helpers
dbPromise.then(pool => {
  dbHelpers = createDbHelpers(pool);
  dbInitialized = true;
  console.log('Database helpers initialized');
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to verify database is ready
const checkDbReady = async (req, res, next) => {
  if (!dbInitialized || !dbHelpers) {
    // Wait for database to be ready (with timeout)
    let attempts = 0;
    while (!dbInitialized && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (!dbInitialized || !dbHelpers) {
      return res.status(503).json({ error: 'Database not ready. Please wait...' });
    }
  }
  next();
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/signup', checkDbReady, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await dbHelpers.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create user
    await dbHelpers.run('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [userId, email, passwordHash]);

    // Create default settings
    const settingsId = uuidv4();
    await dbHelpers.run('INSERT INTO user_settings (id, user_id) VALUES (?, ?)', [settingsId, userId]);

    // Generate token
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { id: userId, email } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/api/auth/signin', checkDbReady, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await dbHelpers.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { id: user.id, email: user.email } 
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', checkDbReady, authenticateToken, async (req, res) => {
  try {
    const user = await dbHelpers.get('SELECT id, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Emergency Contacts Routes
app.get('/api/emergency-contacts', checkDbReady, authenticateToken, async (req, res) => {
  try {
    const contacts = await dbHelpers.all(`
      SELECT * FROM emergency_contacts 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [req.user.id]);

    const formattedContacts = contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      relationship: contact.relationship,
      is_active: contact.is_active === 1,
      alert_methods: JSON.parse(contact.alert_methods || '[]'),
      created_at: contact.created_at,
      updated_at: contact.updated_at
    }));

    res.json(formattedContacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/emergency-contacts', checkDbReady, authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, relationship, alert_methods } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const contactId = uuidv4();
    await dbHelpers.run(`
      INSERT INTO emergency_contacts 
      (id, user_id, name, email, phone, relationship, alert_methods, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      contactId,
      req.user.id,
      name,
      email,
      phone || '',
      relationship || 'Friend',
      JSON.stringify(alert_methods || ['email'])
    ]);

    res.json({ id: contactId, message: 'Contact added successfully' });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/emergency-contacts/:id', checkDbReady, authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, relationship, alert_methods, is_active } = req.body;

    // Verify ownership
    const contact = await dbHelpers.get('SELECT user_id FROM emergency_contacts WHERE id = ?', [id]);
    if (!contact || contact.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await dbHelpers.run(`
      UPDATE emergency_contacts 
      SET name = ?, email = ?, phone = ?, relationship = ?, 
          alert_methods = ?, is_active = ?
      WHERE id = ?
    `, [
      name,
      email,
      phone || '',
      relationship || 'Friend',
      JSON.stringify(alert_methods || ['email']),
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      id
    ]);

    res.json({ message: 'Contact updated successfully' });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/emergency-contacts/:id', checkDbReady, authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const contact = await dbHelpers.get('SELECT user_id FROM emergency_contacts WHERE id = ?', [id]);
    if (!contact || contact.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await dbHelpers.run('DELETE FROM emergency_contacts WHERE id = ?', [id]);

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alerts Routes
app.get('/api/alerts', checkDbReady, authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000); // Max 1000, default 100
    // LIMIT doesn't work with prepared statement parameters, so we validate and use directly
    const limitValue = Number.isInteger(limit) && limit > 0 ? limit : 100;
    const alerts = await dbHelpers.all(`
      SELECT * FROM alerts 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ${limitValue}
    `, [req.user.id]);

    const formattedAlerts = alerts.map(alert => {
      let contacts_notified = [];
      let alert_results = [];
      
      try {
        if (typeof alert.contacts_notified === 'string') {
          contacts_notified = JSON.parse(alert.contacts_notified || '[]');
        } else if (alert.contacts_notified) {
          contacts_notified = alert.contacts_notified;
        }
      } catch (e) {
        console.warn('Error parsing contacts_notified:', e);
        contacts_notified = [];
      }
      
      try {
        if (typeof alert.alert_results === 'string') {
          alert_results = JSON.parse(alert.alert_results || '[]');
        } else if (alert.alert_results) {
          alert_results = alert.alert_results;
        }
      } catch (e) {
        console.warn('Error parsing alert_results:', e);
        alert_results = [];
      }
      
      return {
        id: alert.id,
        alert_type: alert.alert_type,
        status: alert.status,
        confidence: alert.confidence,
        description: alert.description,
        location: alert.location,
        camera_id: alert.camera_id,
        camera_name: alert.camera_name,
        action_taken: alert.action_taken,
        contacts_notified: contacts_notified,
        alert_results: alert_results,
        created_at: alert.created_at
      };
    });

    res.json(formattedAlerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/api/alerts', checkDbReady, authenticateToken, async (req, res) => {
  try {
    const {
      alert_type,
      status,
      confidence,
      description,
      location,
      camera_id,
      camera_name,
      action_taken,
      contacts_notified,
      alert_results
    } = req.body;

    if (!alert_type || !status || !description || !location || !action_taken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const alertId = uuidv4();
    await dbHelpers.run(`
      INSERT INTO alerts 
      (id, user_id, alert_type, status, confidence, description, location, 
       camera_id, camera_name, action_taken, contacts_notified, alert_results)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      alertId,
      req.user.id,
      alert_type,
      status,
      confidence || 0,
      description,
      location,
      camera_id || null,
      camera_name || null,
      action_taken,
      JSON.stringify(contacts_notified || []),
      JSON.stringify(alert_results || [])
    ]);

    res.json({ id: alertId, message: 'Alert created successfully' });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Settings Routes
app.get('/api/user-settings', checkDbReady, authenticateToken, async (req, res) => {
  try {
    let settings = await dbHelpers.get('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
    
    if (!settings) {
      // Create default settings if they don't exist
      const settingsId = uuidv4();
      await dbHelpers.run('INSERT INTO user_settings (id, user_id) VALUES (?, ?)', [settingsId, req.user.id]);
      settings = await dbHelpers.get('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
    }

    formatSettingsResponse(res, settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/user-settings', checkDbReady, authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    
    // Build update query dynamically
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'detection_sensitivity', 'confidence_threshold', 'realtime_processing',
      'video_quality', 'frame_rate', 'auto_start_detection',
      'audio_alerts', 'alert_volume', 'auto_notify_contacts',
      'quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end', 'quiet_hours_days'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (field === 'quiet_hours_days' && Array.isArray(updates[field])) {
          fields.push(`${field} = ?`);
          values.push(JSON.stringify(updates[field]));
        } else if (typeof updates[field] === 'boolean') {
          fields.push(`${field} = ?`);
          values.push(updates[field] ? 1 : 0);
        } else {
          fields.push(`${field} = ?`);
          values.push(updates[field]);
        }
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(req.user.id);
    const query = `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = ?`;
    await dbHelpers.run(query, values);

    const updated = await dbHelpers.get('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id]);
    formatSettingsResponse(res, updated);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function formatSettingsResponse(res, settings) {
  res.json({
    id: settings.id,
    user_id: settings.user_id,
    detection_sensitivity: settings.detection_sensitivity,
    confidence_threshold: settings.confidence_threshold,
    realtime_processing: settings.realtime_processing === 1,
    video_quality: settings.video_quality,
    frame_rate: settings.frame_rate,
    auto_start_detection: settings.auto_start_detection === 1,
    audio_alerts: settings.audio_alerts === 1,
    alert_volume: settings.alert_volume,
    auto_notify_contacts: settings.auto_notify_contacts === 1,
    quiet_hours_enabled: settings.quiet_hours_enabled === 1,
    quiet_hours_start: settings.quiet_hours_start,
    quiet_hours_end: settings.quiet_hours_end,
    quiet_hours_days: typeof settings.quiet_hours_days === 'string' ? JSON.parse(settings.quiet_hours_days || '[]') : (settings.quiet_hours_days || []),
    created_at: settings.created_at,
    updated_at: settings.updated_at
  });
}

// Emergency Alert Route (for sending alerts)
app.post('/api/emergency-alert', checkDbReady, authenticateToken, async (req, res) => {
  try {
    const { location, alertType, cameraId, cameraName } = req.body;

    // Get active emergency contacts
    const contacts = await dbHelpers.all(`
      SELECT * FROM emergency_contacts 
      WHERE user_id = ? AND is_active = 1
    `, [req.user.id]);

    if (contacts.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No active emergency contacts found. Please add contacts first.' 
      });
    }

    // Get user email
    const user = await dbHelpers.get('SELECT email FROM users WHERE id = ?', [req.user.id]);

    // Create alert record
    const alertId = uuidv4();
    const contactsNotified = contacts.map(c => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
      method: 'email' // Default method
    }));

    await dbHelpers.run(`
      INSERT INTO alerts 
      (id, user_id, alert_type, status, confidence, description, location, 
       camera_id, camera_name, action_taken, contacts_notified)
      VALUES (?, ?, ?, 'danger', 100, ?, ?, ?, ?, 'Emergency alert sent', ?)
    `, [
      alertId,
      req.user.id,
      alertType || 'emergency',
      `Emergency alert: ${alertType}`,
      location || 'Unknown',
      cameraId || null,
      cameraName || null,
      JSON.stringify(contactsNotified)
    ]);

    // In a real implementation, you would send emails/SMS here
    // For now, we'll just return success

    res.json({ 
      success: true, 
      message: `Emergency alert sent to ${contacts.length} contact(s)`,
      contactsNotified: contactsNotified.length
    });
  } catch (error) {
    console.error('Error sending emergency alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Database initialized and ready');
});
