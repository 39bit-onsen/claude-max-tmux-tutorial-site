const { initDatabase } = require('../database/db');

console.log('🔧 Initializing database...');

initDatabase();

setTimeout(() => {
  console.log('✅ Database initialization completed');
  process.exit(0);
}, 2000);