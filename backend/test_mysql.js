const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'slv_events_crm'
    });
    console.log('Connected to MySQL successfully!');
    const [rows] = await connection.query('SELECT * FROM bookings');
    console.log('Bookings in MySQL:', rows);
    await connection.end();
  } catch (err) {
    console.error('Failed to connect to MySQL error details:', err);
  }
}

test();
