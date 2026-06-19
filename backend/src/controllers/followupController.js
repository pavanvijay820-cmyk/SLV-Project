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

// 1. Add Follow-up
exports.createFollowup = async (req, res) => {
  const { enquiry_id, followup_date, notes, status } = req.body;

  if (!enquiry_id || !followup_date) {
    return res.status(400).json({
      success: false,
      message: 'Enquiry ID and Follow-up Date are required.'
    });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verify enquiry exists
    const [enquiries] = await conn.query('SELECT * FROM enquiries WHERE id = ?', [enquiry_id]);
    if (enquiries.length === 0) {
      conn.release();
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.'
      });
    }

    const enquiry = enquiries[0];

    // Executive check
    if (req.user.role === 'booking_executive' && enquiry.assigned_staff_id !== req.user.id) {
      conn.release();
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot schedule follow-ups for enquiries assigned to others.'
      });
    }

    const followupStatus = status || 'Planned';

    // Insert followup
    const [result] = await conn.query(
      'INSERT INTO followups (enquiry_id, followup_date, notes, status, created_by) VALUES (?, ?, ?, ?, ?)',
      [enquiry_id, followup_date, notes || null, followupStatus, req.user.id]
    );

    // If a follow-up is planned or completed, auto-update the enquiry status to 'Follow-up'
    // but only if it's currently 'New' or 'Contacted' to advance it along the CRM funnel
    if (['New', 'Contacted'].includes(enquiry.status)) {
      await conn.query(
        "UPDATE enquiries SET status = 'Follow-up' WHERE id = ?",
        [enquiry_id]
      );
    }

    // Log activity
    const activityMsg = `Scheduled next follow-up on ${followup_date}. Note: ${notes || 'None'}`;
    await logActivity(conn, enquiry_id, req.user.id, 'Follow-up Scheduled', activityMsg);

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Follow-up successfully scheduled.',
      followupId: result.insertId
    });

  } catch (error) {
    await conn.rollback();
    console.error('Error creating followup:', error);
    res.status(500).json({
      success: false,
      message: 'Server error scheduling follow-up.'
    });
  } finally {
    conn.release();
  }
};

// 2. Get Follow-ups with Time Filters (today, upcoming, overdue, or all)
exports.getFollowups = async (req, res) => {
  const { type } = req.query; // 'today', 'upcoming', 'overdue', 'all'
  const userRole = req.user.role;
  const userId = req.user.id;

  try {
    let query = `
      SELECT 
        f.*, 
        e.event_type, 
        e.event_date, 
        e.venue, 
        e.status AS enquiry_status,
        c.name AS customer_name, 
        c.phone AS customer_phone, 
        c.email AS customer_email,
        u.name AS creator_name
      FROM followups f
      JOIN enquiries e ON f.enquiry_id = e.id
      JOIN customers c ON e.customer_id = c.id
      JOIN users u ON f.created_by = u.id
      WHERE 1=1
    `;

    const queryParams = [];

    // Role restrictions
    if (userRole === 'booking_executive') {
      query += ' AND e.assigned_staff_id = ?';
      queryParams.push(userId);
    }

    // Apply date range filters based on category
    // Using UTC or server-relative date formats
    const todayStr = new Date().toISOString().split('T')[0];

    if (type === 'today') {
      query += " AND f.followup_date = ? AND f.status = 'Planned'";
      queryParams.push(todayStr);
    } else if (type === 'upcoming') {
      query += " AND f.followup_date > ? AND f.status = 'Planned'";
      queryParams.push(todayStr);
    } else if (type === 'overdue') {
      query += " AND f.followup_date < ? AND f.status = 'Planned'";
      queryParams.push(todayStr);
    }

    query += ' ORDER BY f.followup_date ASC';

    const [followups] = await db.query(query, queryParams);

    res.json({
      success: true,
      followups
    });

  } catch (error) {
    console.error('Error retrieving followups:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving follow-ups.'
    });
  }
};

// 3. Complete/Update a follow-up status
exports.updateFollowup = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Follow-up status is required.'
    });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check if exists
    const [existing] = await conn.query(
      `SELECT f.*, e.assigned_staff_id 
       FROM followups f 
       JOIN enquiries e ON f.enquiry_id = e.id 
       WHERE f.id = ?`,
      [id]
    );

    if (existing.length === 0) {
      conn.release();
      return res.status(404).json({
        success: false,
        message: 'Follow-up record not found.'
      });
    }

    const followup = existing[0];

    // Executive authorization checks
    if (req.user.role === 'booking_executive' && followup.assigned_staff_id !== req.user.id) {
      conn.release();
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify follow-ups assigned to other staff.'
      });
    }

    const updatedNotes = notes || followup.notes;

    // Update follow-up record
    await conn.query(
      'UPDATE followups SET status = ?, notes = ? WHERE id = ?',
      [status, updatedNotes, id]
    );

    // If completed, let's write to activity log
    if (status === 'Completed') {
      await logActivity(
        conn, 
        followup.enquiry_id, 
        req.user.id, 
        'Follow-up Completed', 
        `Completed scheduled follow-up. Notes: ${updatedNotes || 'None'}`
      );
      
      // Auto-update enquiry status to Negotiation (leads progress)
      await conn.query(
        "UPDATE enquiries SET status = 'Negotiation' WHERE id = ? AND status = 'Follow-up'",
        [followup.enquiry_id]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: 'Follow-up updated successfully.'
    });

  } catch (error) {
    await conn.rollback();
    console.error('Error updating followup:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating follow-up.'
    });
  } finally {
    conn.release();
  }
};
