const db = require('../config/db');
const { calculatePriorityAndRecommendation } = require('../utils/aiEngine');

// Helper to log activities
async function logActivity(connection, enquiryId, userId, action, details) {
  try {
    await connection.query(
      'INSERT INTO activity_logs (enquiry_id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [enquiryId, userId, action, details]
    );
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }
}

// 1. Create Enquiry
exports.createEnquiry = async (req, res) => {
  const {
    customer_name,
    customer_phone,
    customer_email,
    rental_type,
    pickup_date,
    pickup_location,
    estimated_cost,
    rental_days,
    lead_source,
    notes,
    assigned_staff_id
  } = req.body;

  // Validate inputs
  if (!customer_name || !customer_phone || !rental_type || !pickup_date || !pickup_location || !estimated_cost || !rental_days || !lead_source) {
    return res.status(400).json({
      success: false,
      message: 'Required fields missing: customer name, phone, rental type, pickup date, pickup location, estimated cost, rental days, and lead source are required.'
    });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Find or create customer
    let customerId;
    const [existingCust] = await conn.query('SELECT id FROM customers WHERE phone = ?', [customer_phone]);
    
    if (existingCust.length > 0) {
      customerId = existingCust[0].id;
      // Update email if empty
      if (customer_email) {
        await conn.query('UPDATE customers SET email = ? WHERE id = ? AND (email IS NULL OR email = "")', [customer_email, customerId]);
      }
    } else {
      const [newCust] = await conn.query(
        'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
        [customer_name, customer_phone, customer_email || null]
      );
      customerId = newCust.insertId;
    }

    // AI priority & recommendation engine
    const { priority, recommendation } = calculatePriorityAndRecommendation({
      rental_type,
      pickup_date,
      estimated_cost,
      rental_days
    });

    const staffId = null;
    const creatorId = req.user.id;

    // Create enquiry
    const [result] = await conn.query(
      `INSERT INTO enquiries 
      (customer_id, rental_type, pickup_date, pickup_location, estimated_cost, rental_days, lead_source, notes, status, priority, recommendation, assigned_staff_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New', ?, ?, ?, ?)`,
      [
        customerId,
        rental_type,
        pickup_date,
        pickup_location,
        estimated_cost,
        rental_days,
        lead_source,
        notes || null,
        priority,
        recommendation,
        staffId,
        creatorId
      ]
    );

    const enquiryId = result.insertId;

    // Log Activity
    await logActivity(conn, enquiryId, creatorId, 'Enquiry Created', `Enquiry generated for ${rental_type} on ${pickup_date}. AI Priority: ${priority}.`);

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Enquiry created successfully.',
      enquiryId
    });

  } catch (error) {
    await conn.rollback();
    console.error('Error creating enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating enquiry.'
    });
  } finally {
    conn.release();
  }
};

// 2. Get All Enquiries (with sorting, searching, and filtering)
exports.getAllEnquiries = async (req, res) => {
  const { search, status, rental_type, start_date, end_date, sort_by } = req.query;
  const userRole = req.user.role;
  const userId = req.user.id;

  try {
    let query = `
      SELECT 
        e.*, 
        c.name AS customer_name, 
        c.phone AS customer_phone, 
        c.email AS customer_email,
        u.name AS staff_name,
        creator.name AS creator_name,
        b.booking_number,
        b.status AS booking_status,
        (SELECT MAX(followup_date) FROM followups WHERE enquiry_id = e.id) as next_followup_date
      FROM enquiries e
      JOIN customers c ON e.customer_id = c.id
      LEFT JOIN users u ON e.assigned_staff_id = u.id
      JOIN users creator ON e.created_by = creator.id
      LEFT JOIN bookings b ON b.enquiry_id = e.id
      WHERE 1=1
    `;

    const queryParams = [];

    // Role-based visibility
    if (userRole === 'booking_executive') {
      query += ' AND e.assigned_staff_id = ?';
      queryParams.push(userId);
    }

    // Search filter (name, phone, email, pickup_location)
    if (search) {
      query += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ? OR e.pickup_location LIKE ?)';
      const searchWild = `%${search}%`;
      queryParams.push(searchWild, searchWild, searchWild, searchWild);
    }

    // Status filter
    if (status) {
      query += ' AND e.status = ?';
      queryParams.push(status);
    }

    // Rental type filter
    if (rental_type) {
      query += ' AND e.rental_type = ?';
      queryParams.push(rental_type);
    }

    // Date range filters
    if (start_date) {
      query += ' AND e.pickup_date >= ?';
      queryParams.push(start_date);
    }
    if (end_date) {
      query += ' AND e.pickup_date <= ?';
      queryParams.push(end_date);
    }

    // Sorting
    if (sort_by === 'pickup_date_asc') {
      query += ' ORDER BY e.pickup_date ASC';
    } else if (sort_by === 'pickup_date_desc') {
      query += ' ORDER BY e.pickup_date DESC';
    } else if (sort_by === 'cost_desc') {
      query += ' ORDER BY e.estimated_cost DESC';
    } else {
      query += ' ORDER BY e.created_at DESC'; // default newest first
    }

    const [enquiries] = await db.query(query, queryParams);

    res.json({
      success: true,
      enquiries
    });

  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving enquiries.'
    });
  }
};

// 3. Get Enquiry Details (with Follow-ups & Activity Logs)
exports.getEnquiryById = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.role;
  const userId = req.user.id;

  try {
    // Fetch main enquiry details
    const [enquiries] = await db.query(
      `SELECT 
        e.*, 
        c.name AS customer_name, 
        c.phone AS customer_phone, 
        c.email AS customer_email,
        u.name AS staff_name,
        creator.name AS creator_name
      FROM enquiries e
      JOIN customers c ON e.customer_id = c.id
      LEFT JOIN users u ON e.assigned_staff_id = u.id
      JOIN users creator ON e.created_by = creator.id
      WHERE e.id = ?`,
      [id]
    );

    if (enquiries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.'
      });
    }

    const enquiry = enquiries[0];

    // Access control for Booking Executives
    if (userRole === 'booking_executive' && enquiry.assigned_staff_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not assigned to this enquiry.'
      });
    }

    // Fetch Bookings (if any)
    const [bookings] = await db.query(
      'SELECT id, booking_number, total_amount, advance_payment, status, created_at FROM bookings WHERE enquiry_id = ?',
      [id]
    );

    // Fetch Followups
    const [followups] = await db.query(
      `SELECT f.*, u.name AS creator_name 
       FROM followups f
       JOIN users u ON f.created_by = u.id
       WHERE f.enquiry_id = ? 
       ORDER BY f.followup_date DESC`,
      [id]
    );

    // Fetch Activity Logs
    const [activityLogs] = await db.query(
      `SELECT l.*, u.name AS user_name, u.role AS user_role
       FROM activity_logs l
       JOIN users u ON l.user_id = u.id
       WHERE l.enquiry_id = ? 
       ORDER BY l.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      enquiry,
      booking: bookings.length > 0 ? bookings[0] : null,
      followups,
      activityLogs
    });

  } catch (error) {
    console.error('Error fetching enquiry details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving enquiry details.'
    });
  }
};

// 4. Update Enquiry
exports.updateEnquiry = async (req, res) => {
  const { id } = req.params;
  const {
    rental_type,
    pickup_date,
    pickup_location,
    estimated_cost,
    rental_days,
    lead_source,
    notes,
    status,
    assigned_staff_id
  } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check if exists
    const [existing] = await conn.query('SELECT * FROM enquiries WHERE id = ?', [id]);
    if (existing.length === 0) {
      conn.release();
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.'
      });
    }

    const currentEnquiry = existing[0];

    // Executive lock check
    if (req.user.role === 'booking_executive' && currentEnquiry.assigned_staff_id !== req.user.id) {
      conn.release();
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify enquiries assigned to other staff.'
      });
    }

    // AI Engine triggers recalculation if dates/budget/guests change
    const updatedDetails = {
      rental_type: rental_type || currentEnquiry.rental_type,
      pickup_date: pickup_date || currentEnquiry.pickup_date,
      estimated_cost: estimated_cost !== undefined ? estimated_cost : currentEnquiry.estimated_cost,
      rental_days: rental_days !== undefined ? rental_days : currentEnquiry.rental_days
    };

    const { priority, recommendation } = calculatePriorityAndRecommendation(updatedDetails);

    const staffId = currentEnquiry.assigned_staff_id;

    // Execute update
    await conn.query(
      `UPDATE enquiries SET 
        rental_type = ?, 
        pickup_date = ?, 
        pickup_location = ?, 
        estimated_cost = ?, 
        rental_days = ?, 
        lead_source = ?, 
        notes = ?, 
        status = ?, 
        priority = ?, 
        recommendation = ?, 
        assigned_staff_id = ?
      WHERE id = ?`,
      [
        updatedDetails.rental_type,
        updatedDetails.pickup_date,
        pickup_location || currentEnquiry.pickup_location,
        updatedDetails.estimated_cost,
        updatedDetails.rental_days,
        lead_source || currentEnquiry.lead_source,
        notes !== undefined ? notes : currentEnquiry.notes,
        status || currentEnquiry.status,
        priority,
        recommendation,
        staffId,
        id
      ]
    );

    // Track status differences for log
    let changeDetails = [];
    if (status && status !== currentEnquiry.status) {
      changeDetails.push(`Status changed from '${currentEnquiry.status}' to '${status}'`);
    }
    if (staffId !== currentEnquiry.assigned_staff_id) {
      changeDetails.push(`Assigned staff changed`);
    }
    if (updatedDetails.estimated_cost !== currentEnquiry.estimated_cost || updatedDetails.rental_days !== currentEnquiry.rental_days) {
      changeDetails.push(`Cost/duration updated (AI Priority set to: ${priority})`);
    }

    const logDetails = changeDetails.length > 0 
      ? `Updated enquiry details: ${changeDetails.join(', ')}.` 
      : 'Updated general enquiry parameters.';

    await logActivity(conn, id, req.user.id, 'Enquiry Updated', logDetails);

    await conn.commit();

    res.json({
      success: true,
      message: 'Enquiry updated successfully.'
    });

  } catch (error) {
    await conn.rollback();
    console.error('Error updating enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating enquiry.'
    });
  } finally {
    conn.release();
  }
};

// 5. Delete Enquiry
exports.deleteEnquiry = async (req, res) => {
  const { id } = req.params;

  try {
    // Only Admin and Event Manager can delete
    if (req.user.role === 'booking_executive') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Booking Executives cannot delete enquiries.'
      });
    }

    const [existing] = await db.query('SELECT id FROM enquiries WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.'
      });
    }

    await db.query('DELETE FROM enquiries WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Enquiry deleted successfully.'
    });

  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting enquiry.'
    });
  }
};
