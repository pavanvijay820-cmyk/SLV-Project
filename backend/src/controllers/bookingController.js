const db = require('../config/db');

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

// 1. Convert Enquiry to Booking
exports.createBooking = async (req, res) => {
  const { 
    enquiry_id, 
    total_amount, 
    advance_payment, 
    status, 
    vehicle_assigned,
    drop_location,
    return_date,
    payment_status,
    driver_required
  } = req.body;

  if (!enquiry_id || !total_amount) {
    return res.status(400).json({
      success: false,
      message: 'Enquiry ID and Total Amount are required.'
    });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Check if enquiry exists and isn't already booked
    const [enquiries] = await conn.query('SELECT * FROM enquiries WHERE id = ?', [enquiry_id]);
    if (enquiries.length === 0) {
      conn.release();
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.'
      });
    }

    const [existingBookings] = await conn.query('SELECT id FROM bookings WHERE enquiry_id = ?', [enquiry_id]);
    if (existingBookings.length > 0) {
      conn.release();
      return res.status(400).json({
        success: false,
        message: 'A booking already exists for this enquiry.'
      });
    }

    // 2. Generate a unique booking number (Format: BKXXX)
    const [countResult] = await conn.query('SELECT COUNT(*) AS total FROM bookings');
    const bookingCount = countResult[0].total + 1;
    const bookingNumber = `BK${String(bookingCount).padStart(3, '0')}`;

    // 3. Create booking
    const advPay = advance_payment ? parseFloat(advance_payment) : 0;
    const totAmt = parseFloat(total_amount);
    const bookingStatus = status || 'Confirmed'; // default status

    const [bookingResult] = await conn.query(
      `INSERT INTO bookings (booking_number, enquiry_id, total_amount, advance_payment, drop_location, return_date, payment_status, driver_required, status, vehicle_assigned)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingNumber, 
        enquiry_id, 
        totAmt, 
        advPay, 
        drop_location || null, 
        return_date || null, 
        payment_status || 'Unpaid', 
        driver_required || 'No', 
        bookingStatus, 
        vehicle_assigned || null
      ]
    );

    // 4. Update enquiry status to 'Confirmed'
    await conn.query(
      "UPDATE enquiries SET status = 'Confirmed' WHERE id = ?",
      [enquiry_id]
    );

    // 5. Log Activity
    await logActivity(
      conn,
      enquiry_id,
      req.user.id,
      'Convert to Booking',
      `Enquiry converted to booking successfully. Booking No: ${bookingNumber}. Vehicle: ${vehicle_assigned || 'None'}. Total Amount: ${totAmt} INR, Advance: ${advPay} INR.`
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Enquiry converted to booking successfully.',
      bookingId: bookingResult.insertId,
      bookingNumber
    });

  } catch (error) {
    await conn.rollback();
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error converting booking.'
    });
  } finally {
    conn.release();
  }
};

// 2. Get All Bookings
exports.getAllBookings = async (req, res) => {
  const { search, status } = req.query;
  const userRole = req.user.role;
  const userId = req.user.id;

  try {
    let query = `
      SELECT 
        b.*, 
        e.rental_type, 
        e.pickup_date, 
        e.pickup_location, 
        e.estimated_cost,
        e.rental_days,
        e.assigned_staff_id,
        c.name AS customer_name, 
        c.phone AS customer_phone, 
        c.email AS customer_email,
        u.name AS staff_name
      FROM bookings b
      JOIN enquiries e ON b.enquiry_id = e.id
      JOIN customers c ON e.customer_id = c.id
      LEFT JOIN users u ON e.assigned_staff_id = u.id
      WHERE 1=1
    `;

    const queryParams = [];

    // Role-based visibility: Booking executives see bookings assigned to their enquiries
    if (userRole === 'booking_executive') {
      query += ' AND e.assigned_staff_id = ?';
      queryParams.push(userId);
    }

    if (status) {
      query += ' AND b.status = ?';
      queryParams.push(status);
    }

    if (search) {
      query += ' AND (b.booking_number LIKE ? OR c.name LIKE ? OR c.phone LIKE ? OR e.pickup_location LIKE ? OR b.vehicle_assigned LIKE ?)';
      const searchWild = `%${search}%`;
      queryParams.push(searchWild, searchWild, searchWild, searchWild, searchWild);
    }

    query += ' ORDER BY b.created_at DESC';

    const [bookings] = await db.query(query, queryParams);

    res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving bookings.'
    });
  }
};

// 3. Update Booking Payment / Status
exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const { 
    total_amount, 
    advance_payment, 
    status, 
    vehicle_assigned,
    drop_location,
    return_date,
    payment_status,
    driver_required
  } = req.body;

  try {
    // Check if exists
    const [existing] = await db.query(
      'SELECT b.*, e.id AS enquiry_id FROM bookings b JOIN enquiries e ON b.enquiry_id = e.id WHERE b.id = ?', 
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    const booking = existing[0];

    // Check authorization: Booking Executive check
    if (req.user.role === 'booking_executive' && booking.assigned_staff_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify bookings assigned to other staff.'
      });
    }

    const updatedTotal = total_amount !== undefined ? parseFloat(total_amount) : booking.total_amount;
    const updatedAdvance = advance_payment !== undefined ? parseFloat(advance_payment) : booking.advance_payment;
    const updatedStatus = status || booking.status;
    const updatedVehicle = vehicle_assigned !== undefined ? vehicle_assigned : booking.vehicle_assigned;
    const updatedDropLocation = drop_location !== undefined ? drop_location : booking.drop_location;
    const updatedReturnDate = return_date !== undefined ? return_date : booking.return_date;
    const updatedPaymentStatus = payment_status !== undefined ? payment_status : booking.payment_status;
    const updatedDriverRequired = driver_required !== undefined ? driver_required : booking.driver_required;

    await db.query(
      'UPDATE bookings SET total_amount = ?, advance_payment = ?, status = ?, vehicle_assigned = ?, drop_location = ?, return_date = ?, payment_status = ?, driver_required = ? WHERE id = ?',
      [
        updatedTotal, 
        updatedAdvance, 
        updatedStatus, 
        updatedVehicle, 
        updatedDropLocation, 
        updatedReturnDate, 
        updatedPaymentStatus, 
        updatedDriverRequired, 
        id
      ]
    );

    // Insert activity log
    await logActivity(
      db, 
      booking.enquiry_id, 
      req.user.id, 
      'Booking Updated', 
      `Booking parameters updated. Status: ${updatedStatus}. Vehicle: ${updatedVehicle || 'None'}. Total: ${updatedTotal} INR. Paid: ${updatedAdvance} INR.`
    );

    res.json({
      success: true,
      message: 'Booking updated successfully.'
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating booking.'
    });
  }
};

// 4. Get Booking Details by ID
exports.getBookingById = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.role;
  const userId = req.user.id;

  try {
    const query = `
      SELECT 
        b.*, 
        e.rental_type, 
        e.pickup_date, 
        e.pickup_location, 
        e.estimated_cost,
        e.rental_days,
        e.assigned_staff_id,
        e.notes AS enquiry_notes,
        c.name AS customer_name, 
        c.phone AS customer_phone, 
        c.email AS customer_email,
        u.name AS staff_name
      FROM bookings b
      JOIN enquiries e ON b.enquiry_id = e.id
      JOIN customers c ON e.customer_id = c.id
      LEFT JOIN users u ON e.assigned_staff_id = u.id
      WHERE b.id = ?
    `;

    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    const booking = rows[0];

    // Authorization check
    if (userRole === 'booking_executive' && booking.assigned_staff_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot view bookings assigned to other staff.'
      });
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving booking details.'
    });
  }
};
