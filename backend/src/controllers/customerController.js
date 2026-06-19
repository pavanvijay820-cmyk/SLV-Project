const db = require('../config/db');

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const [customers] = await db.query(
      'SELECT * FROM customers ORDER BY name ASC'
    );
    res.json({
      success: true,
      customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving customers.'
    });
  }
};

// Create a new customer manually
exports.createCustomer = async (req, res) => {
  const { name, phone, email } = req.body;

  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Customer name and phone number are required.'
    });
  }

  try {
    // Check if phone or email already exists
    const [existing] = await db.query(
      'SELECT id FROM customers WHERE phone = ?',
      [phone]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A customer with this phone number already exists.',
        customerId: existing[0].id
      });
    }

    const [result] = await db.query(
      'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
      [name, phone, email || null]
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully.',
      customerId: result.insertId
    });

  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating customer.'
    });
  }
};
