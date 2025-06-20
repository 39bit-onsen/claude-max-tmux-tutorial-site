const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || './database.sqlite';

let db = null;

function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Database connection error:', err.message);
      } else {
        console.log('✅ Connected to SQLite database');
      }
    });
  }
  return db;
}

function initDatabase() {
  const db = getDatabase();
  const schemaPath = path.join(__dirname, '../database-schema.sql');
  
  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    db.exec(schema, (err) => {
      if (err) {
        console.error('❌ Database initialization error:', err.message);
      } else {
        console.log('✅ Database initialized successfully');
      }
    });
  } catch (error) {
    console.error('❌ Schema file read error:', error.message);
  }
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('❌ Database close error:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
    });
    db = null;
  }
}

module.exports = {
  getDatabase,
  initDatabase,
  runQuery,
  getQuery,
  allQuery,
  closeDatabase
};