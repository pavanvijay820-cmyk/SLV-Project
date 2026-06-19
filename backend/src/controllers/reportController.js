const db = require('../config/db');

// 1. Get Dashboard Summary & Chart Data
exports.getDashboardData = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;

  try {
    const isExec = userRole === 'booking_executive';
    const staffFilter = isExec ? 'AND assigned_staff_id = ?' : '';
    const followStaffFilter = isExec ? 'AND e.assigned_staff_id = ?' : '';
    const params = isExec ? [userId] : [];

    // Query 1: Total Enquiries
    const [totalEnq] = await db.query(
      `SELECT COUNT(*) AS count FROM enquiries WHERE 1=1 ${staffFilter}`, 
      params
    );

    // Query 2: New Enquiries
    const [newEnq] = await db.query(
      `SELECT COUNT(*) AS count FROM enquiries WHERE status = 'New' ${staffFilter}`, 
      params
    );

    // Query 3: Today's Enquiries
    const [todayEnq] = await db.query(
      `SELECT COUNT(*) AS count FROM enquiries WHERE DATE(created_at) = CURRENT_DATE() ${staffFilter}`,
      params
    );

    // Query 4: Pending Follow-ups (Planned follow-ups)
    const [pendingFoll] = await db.query(
      `SELECT COUNT(*) AS count 
       FROM followups f 
       JOIN enquiries e ON f.enquiry_id = e.id 
       WHERE f.status = 'Planned' ${followStaffFilter}`,
      params
    );

    // Query 5: Confirmed Bookings
    const [confirmedBookings] = await db.query(
      `SELECT COUNT(*) AS count 
       FROM bookings b 
       JOIN enquiries e ON b.enquiry_id = e.id 
       WHERE b.status = 'Confirmed' ${followStaffFilter}`,
      params
    );

    // Query 6: Monthly Revenue (Sum of total booking amounts in current month only)
    const [monthlyRev] = await db.query(
      `SELECT COALESCE(SUM(b.total_amount), 0) AS revenue 
       FROM bookings b 
       JOIN enquiries e ON b.enquiry_id = e.id 
       WHERE b.status != 'Cancelled' 
         AND MONTH(b.created_at) = MONTH(CURRENT_DATE()) 
         AND YEAR(b.created_at) = YEAR(CURRENT_DATE())
         ${followStaffFilter}`,
      params
    );

    // Query 7: Monthly Enquiries Chart Data (Past 6 Months)
    const [monthlyChart] = await db.query(
      `SELECT DATE_FORMAT(created_at, '%b %Y') AS name, COUNT(*) AS enquiries 
       FROM enquiries 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) ${staffFilter}
       GROUP BY name
       ORDER BY MIN(created_at) ASC`,
      params
    );

    // Query 8: Rental Type Chart Data (Split of rental types)
    const [eventTypeChart] = await db.query(
      `SELECT rental_type AS name, COUNT(*) AS value 
       FROM enquiries 
       WHERE 1=1 ${staffFilter}
       GROUP BY rental_type`,
      params
    );

    // Query 9: Booking Status Chart Data
    const [bookingStatusChart] = await db.query(
      `SELECT b.status AS name, COUNT(*) AS value 
       FROM bookings b
       JOIN enquiries e ON b.enquiry_id = e.id
       WHERE 1=1 ${followStaffFilter}
       GROUP BY b.status`,
      params
    );

    res.json({
      success: true,
      summary: {
        totalEnquiries: totalEnq[0].count,
        newEnquiries: newEnq[0].count,
        todaysEnquiries: todayEnq[0].count,
        pendingFollowups: pendingFoll[0].count,
        confirmedBookings: confirmedBookings[0].count,
        revenue: parseFloat(monthlyRev[0].revenue)
      },
      charts: {
        monthlyTrend: monthlyChart,
        eventTypes: eventTypeChart,
        bookingStatus: bookingStatusChart
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard report details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard reports.'
    });
  }
};

// 2. Get Advanced Filtered Reports (Daily, Weekly, Monthly, Revenue, Booking)
exports.getReports = async (req, res) => {
  const { report_type } = req.query; // 'daily', 'weekly', 'monthly', 'revenue', 'bookings'
  const userRole = req.user.role;
  const userId = req.user.id;

  try {
    const isExec = userRole === 'booking_executive';
    let query = '';
    const queryParams = [];

    const staffFilter = isExec ? 'AND e.assigned_staff_id = ?' : '';
    const staffParams = isExec ? [userId] : [];

    switch (report_type) {
      case 'daily':
        query = `
          SELECT e.id, c.name AS customer_name, c.phone, e.rental_type, e.pickup_date, e.estimated_cost, e.status, e.priority, u.name AS staff_name
          FROM enquiries e
          JOIN customers c ON e.customer_id = c.id
          LEFT JOIN users u ON e.assigned_staff_id = u.id
          WHERE DATE(e.created_at) = CURRENT_DATE() ${staffFilter}
          ORDER BY e.created_at DESC
        `;
        queryParams.push(...staffParams);
        break;

      case 'weekly':
        query = `
          SELECT e.id, c.name AS customer_name, c.phone, e.rental_type, e.pickup_date, e.estimated_cost, e.status, e.priority, u.name AS staff_name
          FROM enquiries e
          JOIN customers c ON e.customer_id = c.id
          LEFT JOIN users u ON e.assigned_staff_id = u.id
          WHERE e.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) ${staffFilter}
          ORDER BY e.created_at DESC
        `;
        queryParams.push(...staffParams);
        break;

      case 'monthly':
        query = `
          SELECT e.id, c.name AS customer_name, c.phone, e.rental_type, e.pickup_date, e.estimated_cost, e.status, e.priority, u.name AS staff_name
          FROM enquiries e
          JOIN customers c ON e.customer_id = c.id
          LEFT JOIN users u ON e.assigned_staff_id = u.id
          WHERE e.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) ${staffFilter}
          ORDER BY e.created_at DESC
        `;
        queryParams.push(...staffParams);
        break;

      case 'revenue':
        query = `
          SELECT b.booking_number, c.name AS customer_name, e.rental_type, e.pickup_date, b.vehicle_assigned, b.total_amount, b.advance_payment, (b.total_amount - b.advance_payment) AS balance, b.status
          FROM bookings b
          JOIN enquiries e ON b.enquiry_id = e.id
          JOIN customers c ON e.customer_id = c.id
          WHERE 1=1 ${staffFilter}
          ORDER BY b.created_at DESC
        `;
        queryParams.push(...staffParams);
        break;

      case 'bookings':
        query = `
          SELECT b.booking_number, c.name AS customer_name, c.phone, c.email, e.rental_type, e.pickup_date, e.pickup_location, b.vehicle_assigned, b.total_amount, b.status, u.name AS staff_name
          FROM bookings b
          JOIN enquiries e ON b.enquiry_id = e.id
          JOIN customers c ON e.customer_id = c.id
          LEFT JOIN users u ON e.assigned_staff_id = u.id
          WHERE 1=1 ${staffFilter}
          ORDER BY b.created_at DESC
        `;
        queryParams.push(...staffParams);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type specified. Use daily, weekly, monthly, revenue, or bookings.'
        });
    }

    const [rows] = await db.query(query, queryParams);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating reports.'
    });
  }
};
