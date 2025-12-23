// Helper functions for database operations using MySQL
function createDbHelpers(pool) {
  return {
    run: async (sql, params = []) => {
      const [result] = await pool.execute(sql, params);
      return { 
        lastID: result.insertId || null, 
        changes: result.affectedRows || 0 
      };
    },
    
    get: async (sql, params = []) => {
      const [rows] = await pool.execute(sql, params);
      return rows[0] || null;
    },
    
    all: async (sql, params = []) => {
      const [rows] = await pool.execute(sql, params);
      return rows;
    },
    
    exec: async (sql) => {
      await pool.query(sql);
    }
  };
}

module.exports = createDbHelpers;
