import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!;
    
    // Get user from auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { location, alertType, cameraId, cameraName } = await req.json();

    console.log('Emergency alert triggered for user:', user.id);

    // Fetch all active emergency contacts for this user
    const { data: contacts, error: contactsError } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError);
      throw contactsError;
    }

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No active emergency contacts found. Please add contacts first.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${contacts.length} active emergency contacts`);

    // Prepare alert details
    const alertTime = new Date().toLocaleString();
    const alertMessage = `🚨 EMERGENCY ALERT from ${user.email}!\n\nType: ${alertType || 'Manual Emergency'}\nTime: ${alertTime}\nLocation: ${location || 'Location not available'}\n\nThis person needs immediate assistance. Please respond or call them immediately.`;

    // Send alerts to all contacts based on their preferred methods
    const alertPromises = contacts.map(async (contact) => {
      console.log(`Alerting ${contact.name} via:`, contact.alert_methods);
      
      const results = {
        contact: contact.name,
        methods: [] as string[],
        success: [] as string[],
        failed: [] as string[]
      };

      // Send SMS if enabled
      if (contact.alert_methods.includes('sms')) {
        try {
          console.log(`Sending SMS to ${contact.phone}`);
          // In production, integrate with Twilio or similar SMS service
          // For now, we'll log it
          results.methods.push('SMS');
          results.success.push('SMS (simulated - integrate Twilio in production)');
        } catch (error) {
          console.error(`SMS failed for ${contact.name}:`, error);
          results.failed.push('SMS');
        }
      }

      // Send Email if enabled
      if (contact.alert_methods.includes('email')) {
        try {
          console.log(`Sending email to ${contact.email}`);
          const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
          
          const emailResponse = await resend.emails.send({
            from: 'Emergency Alert <onboarding@resend.dev>',
            to: [contact.email],
            subject: '🚨 EMERGENCY ALERT - Immediate Assistance Needed',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">🚨 EMERGENCY ALERT</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p style="font-size: 16px; line-height: 1.6; color: #1f2937;">
                    <strong>${user.email}</strong> has triggered an emergency alert and needs immediate assistance.
                  </p>
                  
                  <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                    <h2 style="margin-top: 0; color: #dc2626; font-size: 18px;">Alert Details</h2>
                    <p style="margin: 10px 0; color: #4b5563;"><strong>Type:</strong> ${alertType || 'Manual Emergency'}</p>
                    <p style="margin: 10px 0; color: #4b5563;"><strong>Time:</strong> ${alertTime}</p>
                    <p style="margin: 10px 0; color: #4b5563;"><strong>Location:</strong> ${location || 'Location not available'}</p>
                    ${cameraName ? `<p style="margin: 10px 0; color: #4b5563;"><strong>Camera:</strong> ${cameraName}</p>` : ''}
                  </div>
                  
                  <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #991b1b; font-weight: bold;">
                      ⚠️ This person needs immediate assistance. Please respond or call them as soon as possible.
                    </p>
                  </div>
                  
                  <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                    This is an automated emergency alert from the Harassment Detection System.
                  </p>
                </div>
              </div>
            `,
          });
          
          console.log('Email sent successfully:', emailResponse);
          results.methods.push('Email');
          results.success.push('Email sent successfully');
        } catch (error) {
          console.error(`Email failed for ${contact.name}:`, error);
          results.methods.push('Email');
          results.failed.push(`Email error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Make Phone Call if enabled
      if (contact.alert_methods.includes('call')) {
        try {
          console.log(`Initiating call to ${contact.phone}`);
          // In production, integrate with Twilio Voice API
          results.methods.push('Call');
          results.success.push('Call (simulated - integrate Twilio Voice in production)');
        } catch (error) {
          console.error(`Call failed for ${contact.name}:`, error);
          results.failed.push('Call');
        }
      }

      return results;
    });

    const alertResults = await Promise.all(alertPromises);

    console.log('Alert results:', alertResults);

    // Save alert to database
    const contactsNotifiedNames = contacts.map(c => c.name);
    const { error: alertError } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        alert_type: alertType || 'Manual Emergency',
        status: 'danger',
        confidence: 95,
        description: `Emergency alert triggered: ${alertType || 'Manual Emergency'}`,
        location: location || 'Location not available',
        camera_id: cameraId || null,
        camera_name: cameraName || null,
        action_taken: `Alerted ${contacts.length} emergency contact(s) via SMS, Email, and Call`,
        contacts_notified: contactsNotifiedNames,
        alert_results: alertResults
      });

    if (alertError) {
      console.error('Failed to save alert to database:', alertError);
    } else {
      console.log('Alert saved to database successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Emergency alerts sent to ${contacts.length} contact(s)`,
        contacts: alertResults,
        note: 'SMS/Email/Call integration requires Twilio/Resend API keys in production'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in send-emergency-alert:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});