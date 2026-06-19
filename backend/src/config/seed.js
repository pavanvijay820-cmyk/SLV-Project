const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seedDatabase() {
  console.log('Starting database seeding...');

  // Create connection without database first to ensure database is created
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : ''
    });
    console.log('Connected to MySQL host.');
  } catch (error) {
    console.error('Error connecting to MySQL for seeding:', error.message);
    process.exit(1);
  }

  try {
    // 1. Create Database
    const dbName = process.env.DB_NAME || 'slv_events_crm';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database "${dbName}" checked/created.`);
    await connection.query(`USE \`${dbName}\``);

    // 2. Read and execute schema
    const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL by semicolon but be careful about comments/newlines
    // A simple split by semicolon will work for standard DDL statements
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('Database tables created successfully.');

    // 3. Clear existing data to avoid duplicates (optional, but good for reset seed)
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE activity_logs');
    await connection.query('TRUNCATE TABLE followups');
    await connection.query('TRUNCATE TABLE bookings');
    await connection.query('TRUNCATE TABLE enquiries');
    await connection.query('TRUNCATE TABLE customers');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Existing tables cleared.');

    // 4. Seed Users
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('admin123', salt);
    const execHash = bcrypt.hashSync('exec123', salt);
    const managerHash = bcrypt.hashSync('manager123', salt);

    const usersList = [
      ['Admin User', 'admin@slvevents.com', adminHash, 'admin'],
      ['Booking Executive', 'exec@slvevents.com', execHash, 'booking_executive'],
      ['Event Manager', 'manager@slvevents.com', managerHash, 'event_manager']
    ];

    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES ?',
      [usersList]
    );
    const userIdStart = userResult.insertId;
    console.log('Seed users inserted.');

    // 5. Seed Customers
    const customersList = [
      ['John Doe', '9876543210', 'john.doe@example.com'],
      ['Jane Smith', '8765432109', 'jane.smith@example.com'],
      ['Robert Brown', '7654321098', 'robert.brown@example.com'],
      ['Alice Davis', '6543210987', 'alice.davis@example.com'],
      ['Rahul Sharma', '9876543210', 'rahul.sharma@example.com'],
      ['Priya Reddy', '9123456780', 'priya.reddy@example.com'],
      ['Arjun Kumar', '9988776655', 'arjun.kumar@example.com'],
      ['Amit Verma', '9876543211', 'amit.verma@example.com'],
      ['Sneha Rao', '9876543212', 'sneha.rao@example.com'],
      ['Vikram Singh', '9876543213', 'vikram.singh@example.com'],
      ['Neha Gupta', '9876543214', 'neha.gupta@example.com'],
      ['Rohan Das', '9876543215', 'rohan.das@example.com'],
      ['Pooja Patel', '9876543216', 'pooja.patel@example.com'],
      ['Manoj Kumar', '9876543217', 'manoj.kumar@example.com']
    ];

    const [customerResult] = await connection.query(
      'INSERT INTO customers (name, phone, email) VALUES ?',
      [customersList]
    );
    const custIdStart = customerResult.insertId;
    console.log('Seed customers inserted.');

    // 6. Seed Enquiries
    // Calculate relative dates for testing convenience (e.g. today + 10 days, today + 45 days)
    const getFutureDate = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const enquiriesList = [
      [
        custIdStart, // John Doe
        'Self-Drive',
        getFutureDate(5),
        'Indiranagar, Bangalore',
        35000.00,
        3,
        'Website',
        'Prefers Porsche 911 Carrera or luxury sports car.',
        'New',
        'High',
        'Verify client\'s driving license validity, national identity card (Aadhar), and credit security authorization.',
        userIdStart + 1, // exec
        userIdStart // admin
      ],
      [
        custIdStart + 1, // Jane Smith
        'Chauffeur Drive',
        getFutureDate(2),
        'Kempegowda International Airport',
        8000.00,
        1,
        'WhatsApp',
        'Need professional chauffeur and Mercedes C-Class AMG.',
        'Contacted',
        'Urgent',
        'Short notice pick-up request. Check vehicle fleet availability and lock booking immediately.',
        userIdStart + 2, // manager
        userIdStart + 1 // exec
      ],
      [
        custIdStart + 2, // Robert Brown
        'Outstation Tour',
        getFutureDate(10),
        'Jayanagar, Bangalore',
        48000.00,
        6,
        'Instagram',
        'Outstation trip to Ooty. Prefers a spacious SUV like Ford Bronco.',
        'Follow-up',
        'High',
        'Verify inter-state vehicle permits, driver tax clearances, and execute safety check.',
        userIdStart + 1, // exec
        userIdStart + 1 // exec
      ],
      [
        custIdStart + 3, // Alice Davis
        'Self-Drive',
        getFutureDate(8),
        'Whitefield, Bangalore',
        60000.00,
        4,
        'Referral',
        'Wants Tesla Model 3. Needs home delivery.',
        'Confirmed',
        'Normal',
        'Verify client\'s driving license validity, national identity card (Aadhar), and credit security authorization.',
        userIdStart + 1, // exec
        userIdStart // admin
      ],
      [
        custIdStart + 4, // Rahul Sharma
        'Self-Drive',
        '2026-06-18',
        'Hyderabad Airport',
        12000.00,
        2,
        'Website',
        'Driver required.',
        'Confirmed',
        'Normal',
        'Self-drive with driver required.',
        userIdStart + 1, // exec
        userIdStart // admin
      ],
      [
        custIdStart + 5, // Priya Reddy
        'Self-Drive',
        '2026-06-19',
        'Bangalore',
        15000.00,
        2,
        'Website',
        'No driver.',
        'Confirmed',
        'Normal',
        'Self-drive without driver.',
        userIdStart + 1, // exec
        userIdStart // admin
      ],
      [
        custIdStart + 6, // Arjun Kumar
        'Chauffeur Drive',
        '2026-06-20',
        'Chennai Airport',
        10000.00,
        2,
        'WhatsApp',
        'Driver required.',
        'Confirmed',
        'Normal',
        'Chauffeur drive.',
        userIdStart + 1, // exec
        userIdStart // admin
      ],
      [
        custIdStart + 7, // Amit Verma
        'Self-Drive',
        '2026-06-21',
        'Delhi Airport',
        8000.00,
        2,
        'Website',
        'Self drive.',
        'Confirmed',
        'Normal',
        'Self drive.',
        userIdStart + 1, // exec
        userIdStart // admin
      ],
      [
        custIdStart + 8, // Sneha Rao
        'Self-Drive',
        '2026-06-22',
        'Bangalore Airport',
        5000.00,
        2,
        'Phone Call',
        'Self drive.',
        'Confirmed',
        'Normal',
        'Self drive.',
        userIdStart + 1, // exec
        userIdStart // admin
      ],
      [
        custIdStart + 9, // Vikram Singh
        'Chauffeur Drive',
        '2026-06-23',
        'Mumbai Airport',
        25000.00,
        2,
        'Website',
        'Chauffeur required.',
        'Confirmed',
        'High',
        'Premium SUV.',
        userIdStart + 1, // exec
        userIdStart // admin
      ],
      [
        custIdStart + 10, // Neha Gupta
        'Self-Drive',
        '2026-06-24',
        'Chandigarh',
        7000.00,
        2,
        'Instagram',
        'Self drive.',
        'Confirmed',
        'Normal',
        'Self drive.',
        userIdStart + 1, // exec
        userIdStart // admin
      ],
      [
        custIdStart + 11, // Rohan Das
        'Chauffeur Drive',
        '2026-06-25',
        'Kolkata',
        12000.00,
        2,
        'Website',
        'Chauffeur required.',
        'Confirmed',
        'Normal',
        'Chauffeur required.',
        userIdStart + 1, // exec
        userIdStart // admin
      ],
      [
        custIdStart + 12, // Pooja Patel
        'Chauffeur Drive',
        '2026-06-26',
        'Ahmedabad',
        30000.00,
        2,
        'Referral',
        'Premium sedan.',
        'Confirmed',
        'High',
        'Premium sedan.',
        userIdStart + 1, // exec
        userIdStart // admin
      ],
      [
        custIdStart + 13, // Manoj Kumar
        'Self-Drive',
        '2026-06-27',
        'Hyderabad',
        9000.00,
        2,
        'Walk-in',
        'Self drive nexon.',
        'Confirmed',
        'Normal',
        'Self drive.',
        userIdStart + 1, // exec
        userIdStart // admin
      ]
    ];

    const insertedEnquiries = [];
    for (const enq of enquiriesList) {
      const [res] = await connection.query(
        `INSERT INTO enquiries 
        (customer_id, rental_type, pickup_date, pickup_location, estimated_cost, rental_days, lead_source, notes, status, priority, recommendation, assigned_staff_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        enq
      );
      insertedEnquiries.push(res.insertId);
    }
    console.log('Seed enquiries inserted.');

    // 7. Seed Booking for confirmed Reception (Alice Davis)
    // 7. Seed Bookings
    const bookingsList = [
      ['BK000', insertedEnquiries[3], 'Tesla Model 3', 70000.00, 5000.00, 'Whitefield', getFutureDate(12), 'Partial', 'No', 'Confirmed', '2026-06-16 12:00:00'],
      ['BK001', insertedEnquiries[4], 'Toyota Innova Crysta', 12000.00, 5000.00, 'Vijayawada', '2026-06-20', 'Paid', 'Yes', 'Confirmed', '2026-05-15 12:00:00'],
      ['BK002', insertedEnquiries[5], 'Mahindra XUV700', 15000.00, 7000.00, 'Mysore', '2026-06-21', 'Partial', 'No', 'Confirmed', '2026-05-15 12:00:00'],
      ['BK003', insertedEnquiries[6], 'Hyundai Creta', 10000.00, 5000.00, 'Pondicherry', '2026-06-22', 'Paid', 'Yes', 'Confirmed', '2026-05-15 12:00:00'],
      ['BK004', insertedEnquiries[7], 'Honda City', 8000.00, 8000.00, 'Gurgaon', '2026-06-23', 'Paid', 'No', 'Confirmed', '2026-05-15 12:00:00'],
      ['BK005', insertedEnquiries[8], 'Maruti Swift', 5000.00, 0.00, 'Whitefield', '2026-06-24', 'Unpaid', 'No', 'Confirmed', '2026-05-15 12:00:00'],
      ['BK006', insertedEnquiries[9], 'Toyota Fortuner', 25000.00, 10000.00, 'Pune', '2026-06-25', 'Partial', 'Yes', 'Confirmed', '2026-05-15 12:00:00'],
      ['BK007', insertedEnquiries[10], 'Hyundai i20', 7000.00, 7000.00, 'Shimla', '2026-06-26', 'Paid', 'No', 'Confirmed', '2026-05-15 12:00:00'],
      ['BK008', insertedEnquiries[11], 'Kia Seltos', 12000.00, 6000.00, 'Digha', '2026-06-27', 'Partial', 'Yes', 'Confirmed', '2026-05-15 12:00:00'],
      ['BK009', insertedEnquiries[12], 'Audi A4', 30000.00, 15000.00, 'Baroda', '2026-06-28', 'Partial', 'Yes', 'Confirmed', '2026-05-15 12:00:00'],
      ['BK010', insertedEnquiries[13], 'Tata Nexon', 9000.00, 9000.00, 'Secunderabad', '2026-06-29', 'Paid', 'No', 'Confirmed', '2026-05-15 12:00:00']
    ];

    for (const b of bookingsList) {
      await connection.query(
        `INSERT INTO bookings (booking_number, enquiry_id, vehicle_assigned, total_amount, advance_payment, drop_location, return_date, payment_status, driver_required, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        b
      );
    }
    console.log('Seed bookings inserted.');

    // 8. Seed Followups
    // Jane Smith (Corporate) - completed followup yesterday, planned for today
    const getRelativeDateString = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const followupsList = [
      [insertedEnquiries[1], getRelativeDateString(-1), 'First call made. Customer requested menu details.', 'Completed', userIdStart + 2],
      [insertedEnquiries[1], getRelativeDateString(0), 'Send menus and follow up on proposal status.', 'Planned', userIdStart + 2],
      [insertedEnquiries[2], getRelativeDateString(1), 'Call to check venue availability and budget limits.', 'Planned', userIdStart + 1],
      [insertedEnquiries[0], getRelativeDateString(-2), 'Awaiting response on WhatsApp intro message.', 'Overdue', userIdStart + 1]
    ];

    await connection.query(
      'INSERT INTO followups (enquiry_id, followup_date, notes, status, created_by) VALUES ?',
      [followupsList]
    );
    console.log('Seed follow-ups inserted.');

    // 9. Seed Activity Logs
    const activityList = [
      [insertedEnquiries[0], userIdStart, 'Enquiry Created', 'Admin created a new self-drive enquiry for John Doe.'],
      [insertedEnquiries[1], userIdStart + 1, 'Enquiry Created', 'Booking Executive created a chauffeur-drive enquiry for Jane Smith.'],
      [insertedEnquiries[1], userIdStart + 2, 'Follow-up Logged', 'Logged completed call: Timings checked.'],
      [insertedEnquiries[3], userIdStart, 'Enquiry Confirmed', 'Admin confirmed the self-drive booking for Alice Davis.'],
      [insertedEnquiries[3], userIdStart, 'Booking Created', `Booking generated automatically: BK000. Total: 70,000 INR.`]
    ];

    await connection.query(
      'INSERT INTO activity_logs (enquiry_id, user_id, action, details) VALUES ?',
      [activityList]
    );
    console.log('Seed activity logs inserted.');

    console.log('Database successfully seeded!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    await connection.end();
  }
}

// Check if run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
