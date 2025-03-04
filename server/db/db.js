// db.js - Your custom database interface
const { Pool } = require('pg');
require('dotenv').config();

// Connection configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_NAME,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});

// Your custom query library
class DatabaseManager {
  // Basic query executor
  async query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  }

  // Get a single record by ID
  async findById(table, id) {
    const text = `SELECT * FROM ${table} WHERE id = $1`;
    const res = await this.query(text, [id]);
    return res.rows[0];
  }

  // Insert data
  async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.join(', ');
    
    const text = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const res = await this.query(text, values);
    return res.rows[0];
  }

  // Update data
  async update(table, id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const text = `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    
    const res = await this.query(text, [...values, id]);
    return res.rows[0];
  }
  
  // Delete record
  async delete(table, id) {
    const text = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const res = await this.query(text, [id]);
    return res.rows[0];
  }
}

module.exports = new DatabaseManager();