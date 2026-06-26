const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let useMock = false;
let pool = null;

// Seed Mock Data in memory
const mockData = {
  users: [
    { id: 1, name: 'Admin User', email: 'admin@slvevents.com', password: '', role: 'admin' },
    { id: 2, name: 'Booking Executive', email: 'exec@slvevents.com', password: '', role: 'booking_executive' },
    { id: 3, name: 'Event Manager', email: 'manager@slvevents.com', password: '', role: 'event_manager' }
  ],
  customers: [
    { id: 1, name: 'John Doe', phone: '9876543210', email: 'john.doe@example.com' },
    { id: 2, name: 'Jane Smith', phone: '8765432109', email: 'jane.smith@example.com' },
    { id: 3, name: 'Robert Brown', phone: '7654321098', email: 'robert.brown@example.com' },
    { id: 4, name: 'Alice Davis', phone: '6543210987', email: 'alice.davis@example.com' },
    { id: 5, name: 'Rahul Sharma', phone: '9876543210', email: 'rahul.sharma@example.com' },
    { id: 6, name: 'Priya Reddy', phone: '9123456780', email: 'priya.reddy@example.com' },
    { id: 7, name: 'Arjun Kumar', phone: '9988776655', email: 'arjun.kumar@example.com' },
    { id: 8, name: 'Amit Verma', phone: '9876543211', email: 'amit.verma@example.com' },
    { id: 9, name: 'Sneha Rao', phone: '9876543212', email: 'sneha.rao@example.com' },
    { id: 10, name: 'Vikram Singh', phone: '9876543213', email: 'vikram.singh@example.com' },
    { id: 11, name: 'Neha Gupta', phone: '9876543214', email: 'neha.gupta@example.com' },
    { id: 12, name: 'Rohan Das', phone: '9876543215', email: 'rohan.das@example.com' },
    { id: 13, name: 'Pooja Patel', phone: '9876543216', email: 'pooja.patel@example.com' },
    { id: 14, name: 'Manoj Kumar', phone: '9876543217', email: 'manoj.kumar@example.com' }
  ],
  enquiries: [],
  bookings: [],
  followups: [],
  activity_logs: []
};

// Pre-hash mock user passwords
const salt = bcrypt.genSaltSync(10);
mockData.users.forEach(u => {
  let rawPass = u.role + '123';
  if (u.role === 'booking_executive') rawPass = 'exec123';
  if (u.role === 'event_manager') rawPass = 'manager123';
  u.password = bcrypt.hashSync(rawPass, salt);
});

const getFutureDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

mockData.enquiries = [
  {
    id: 1, customer_id: 1, rental_type: 'Self-Drive', pickup_date: getFutureDate(5),
    pickup_location: 'Indiranagar, Bangalore', estimated_cost: 35000.00, rental_days: 3,
    lead_source: 'Website', notes: 'Prefers Porsche 911 Carrera or luxury sports car.', status: 'New',
    priority: 'High', recommendation: 'Verify client\'s driving license validity, national identity card (Aadhar), and credit security authorization.',
    assigned_staff_id: 2, created_by: 1, created_at: new Date()
  },
  {
    id: 2, customer_id: 2, rental_type: 'Chauffeur Drive', pickup_date: getFutureDate(2),
    pickup_location: 'Kempegowda International Airport', estimated_cost: 8000.00, rental_days: 1,
    lead_source: 'WhatsApp', notes: 'Need professional chauffeur and Mercedes C-Class AMG.', status: 'Contacted',
    priority: 'Urgent', recommendation: 'Short notice pick-up request. Check vehicle fleet availability and lock booking immediately.',
    assigned_staff_id: 3, created_by: 2, created_at: new Date()
  },
  {
    id: 3, customer_id: 3, rental_type: 'Outstation Tour', pickup_date: getFutureDate(10),
    pickup_location: 'Jayanagar, Bangalore', estimated_cost: 48000.00, rental_days: 6,
    lead_source: 'Instagram', notes: 'Outstation trip to Ooty. Prefers a spacious SUV like Ford Bronco.', status: 'Follow-up',
    priority: 'High', recommendation: 'Verify inter-state vehicle permits, driver tax clearances, and execute safety check.',
    assigned_staff_id: 2, created_by: 2, created_at: new Date()
  },
  {
    id: 4, customer_id: 4, rental_type: 'Self-Drive', pickup_date: getFutureDate(8),
    pickup_location: 'Whitefield, Bangalore', estimated_cost: 60000.00, rental_days: 4,
    lead_source: 'Referral', notes: 'Wants Tesla Model 3. Needs home delivery.', status: 'Confirmed',
    priority: 'Normal', recommendation: 'Verify client\'s driving license validity, national identity card (Aadhar), and credit security authorization.',
    assigned_staff_id: 2, created_by: 1, created_at: new Date()
  },
  {
    id: 5, customer_id: 5, rental_type: 'Self-Drive', pickup_date: '2026-06-18',
    pickup_location: 'Hyderabad Airport', estimated_cost: 12000.00, rental_days: 2,
    lead_source: 'Website', notes: 'Driver required.', status: 'Confirmed',
    priority: 'Normal', recommendation: 'Self-drive with driver required.',
    assigned_staff_id: 2, created_by: 1, created_at: new Date()
  },
  {
    id: 6, customer_id: 6, rental_type: 'Self-Drive', pickup_date: '2026-06-19',
    pickup_location: 'Bangalore', estimated_cost: 15000.00, rental_days: 2,
    lead_source: 'Website', notes: 'No driver.', status: 'Confirmed',
    priority: 'Normal', recommendation: 'Self-drive without driver.',
    assigned_staff_id: 2, created_by: 1, created_at: new Date()
  },
  {
    id: 7, customer_id: 7, rental_type: 'Chauffeur Drive', pickup_date: '2026-06-20',
    pickup_location: 'Chennai Airport', estimated_cost: 10000.00, rental_days: 2,
    lead_source: 'WhatsApp', notes: 'Driver required.', status: 'Confirmed',
    priority: 'Normal', recommendation: 'Chauffeur drive.',
    assigned_staff_id: 2, created_by: 1, created_at: new Date()
  },
  {
    id: 8, customer_id: 8, rental_type: 'Self-Drive', pickup_date: '2026-06-21',
    pickup_location: 'Delhi Airport', estimated_cost: 8000.00, rental_days: 2,
    lead_source: 'Website', notes: 'Self drive.', status: 'Confirmed',
    priority: 'Normal', recommendation: 'Self drive.',
    assigned_staff_id: 2, created_by: 1, created_at: new Date()
  },
  {
    id: 9, customer_id: 9, rental_type: 'Self-Drive', pickup_date: '2026-06-22',
    pickup_location: 'Bangalore Airport', estimated_cost: 5000.00, rental_days: 2,
    lead_source: 'Phone Call', notes: 'Self drive.', status: 'Confirmed',
    priority: 'Normal', recommendation: 'Self drive.',
    assigned_staff_id: 2, created_by: 1, created_at: new Date()
  },
  {
    id: 10, customer_id: 10, rental_type: 'Chauffeur Drive', pickup_date: '2026-06-23',
    pickup_location: 'Mumbai Airport', estimated_cost: 25000.00, rental_days: 2,
    lead_source: 'Website', notes: 'Chauffeur required.', status: 'Confirmed',
    priority: 'High', recommendation: 'Premium SUV.',
    assigned_staff_id: 2, created_by: 1, created_at: new Date()
  },
  {
    id: 11, customer_id: 11, rental_type: 'Self-Drive', pickup_date: '2026-06-24',
    pickup_location: 'Chandigarh', estimated_cost: 7000.00, rental_days: 2,
    lead_source: 'Instagram', notes: 'Self drive.', status: 'Confirmed',
    priority: 'Normal', recommendation: 'Self drive.',
    assigned_staff_id: 2, created_by: 1, created_at: new Date()
  },
  {
    id: 12, customer_id: 12, rental_type: 'Chauffeur Drive', pickup_date: '2026-06-25',
    pickup_location: 'Kolkata', estimated_cost: 12000.00, rental_days: 2,
    lead_source: 'Website', notes: 'Chauffeur required.', status: 'Confirmed',
    priority: 'Normal', recommendation: 'Chauffeur required.',
    assigned_staff_id: 2, created_by: 1, created_at: new Date()
  },
  {
    id: 13, customer_id: 13, rental_type: 'Chauffeur Drive', pickup_date: '2026-06-26',
    pickup_location: 'Ahmedabad', estimated_cost: 30000.00, rental_days: 2,
    lead_source: 'Referral', notes: 'Premium sedan with chauffeur.', status: 'Confirmed',
    priority: 'High', recommendation: 'Premium sedan.',
    assigned_staff_id: 2, created_by: 1, created_at: new Date()
  },
  {
    id: 14, customer_id: 14, rental_type: 'Self-Drive', pickup_date: '2026-06-27',
    pickup_location: 'Hyderabad', estimated_cost: 9000.00, rental_days: 2,
    lead_source: 'Walk-in', notes: 'Self drive nexon.', status: 'Confirmed',
    priority: 'Normal', recommendation: 'Self drive.',
    assigned_staff_id: 2, created_by: 1, created_at: new Date()
  }
];

mockData.bookings = [
  { id: 1, booking_number: 'BK000', enquiry_id: 4, vehicle_assigned: 'Tesla Model 3', total_amount: 70000.00, advance_payment: 5000.00, status: 'Confirmed', created_at: new Date(), drop_location: 'Whitefield', return_date: getFutureDate(12), payment_status: 'Partial', driver_required: 'No' },
  { id: 2, booking_number: 'BK001', enquiry_id: 5, vehicle_assigned: 'Toyota Innova Crysta', total_amount: 12000.00, advance_payment: 5000.00, status: 'Confirmed', created_at: new Date('2026-05-15'), drop_location: 'Vijayawada', return_date: '2026-06-20', payment_status: 'Paid', driver_required: 'Yes' },
  { id: 3, booking_number: 'BK002', enquiry_id: 6, vehicle_assigned: 'Mahindra XUV700', total_amount: 15000.00, advance_payment: 7000.00, status: 'Confirmed', created_at: new Date('2026-05-15'), drop_location: 'Mysore', return_date: '2026-06-21', payment_status: 'Partial', driver_required: 'No' },
  { id: 4, booking_number: 'BK003', enquiry_id: 7, vehicle_assigned: 'Hyundai Creta', total_amount: 10000.00, advance_payment: 5000.00, status: 'Confirmed', created_at: new Date('2026-05-15'), drop_location: 'Pondicherry', return_date: '2026-06-22', payment_status: 'Paid', driver_required: 'Yes' },
  { id: 5, booking_number: 'BK004', enquiry_id: 8, vehicle_assigned: 'Honda City', total_amount: 8000.00, advance_payment: 8000.00, status: 'Confirmed', created_at: new Date('2026-05-15'), drop_location: 'Gurgaon', return_date: '2026-06-23', payment_status: 'Paid', driver_required: 'No' },
  { id: 6, booking_number: 'BK005', enquiry_id: 9, vehicle_assigned: 'Maruti Swift', total_amount: 5000.00, advance_payment: 0.00, status: 'Confirmed', created_at: new Date('2026-05-15'), drop_location: 'Whitefield', return_date: '2026-06-24', payment_status: 'Unpaid', driver_required: 'No' },
  { id: 7, booking_number: 'BK006', enquiry_id: 10, vehicle_assigned: 'Toyota Fortuner', total_amount: 25000.00, advance_payment: 10000.00, status: 'Confirmed', created_at: new Date('2026-05-15'), drop_location: 'Pune', return_date: '2026-06-25', payment_status: 'Partial', driver_required: 'Yes' },
  { id: 8, booking_number: 'BK007', enquiry_id: 11, vehicle_assigned: 'Hyundai i20', total_amount: 7000.00, advance_payment: 7000.00, status: 'Confirmed', created_at: new Date('2026-05-15'), drop_location: 'Shimla', return_date: '2026-06-26', payment_status: 'Paid', driver_required: 'No' },
  { id: 9, booking_number: 'BK008', enquiry_id: 12, vehicle_assigned: 'Kia Seltos', total_amount: 12000.00, advance_payment: 6000.00, status: 'Confirmed', created_at: new Date('2026-05-15'), drop_location: 'Digha', return_date: '2026-06-27', payment_status: 'Partial', driver_required: 'Yes' },
  { id: 10, booking_number: 'BK009', enquiry_id: 13, vehicle_assigned: 'Audi A4', total_amount: 30000.00, advance_payment: 15000.00, status: 'Confirmed', created_at: new Date('2026-05-15'), drop_location: 'Baroda', return_date: '2026-06-28', payment_status: 'Partial', driver_required: 'Yes' },
  { id: 11, booking_number: 'BK010', enquiry_id: 14, vehicle_assigned: 'Tata Nexon', total_amount: 9000.00, advance_payment: 9000.00, status: 'Confirmed', created_at: new Date('2026-05-15'), drop_location: 'Secunderabad', return_date: '2026-06-29', payment_status: 'Paid', driver_required: 'No' }
];

mockData.followups = [
  { id: 1, enquiry_id: 2, followup_date: getFutureDate(-1), notes: 'First call made. Customer verified flight arrival timings.', status: 'Completed', created_by: 3 },
  { id: 2, enquiry_id: 2, followup_date: getFutureDate(0), notes: 'Confirm chauffeur details and dispatch details.', status: 'Planned', created_by: 3 },
  { id: 3, enquiry_id: 3, followup_date: getFutureDate(1), notes: 'Check SUV availability and discuss package discounts.', status: 'Planned', created_by: 2 },
  { id: 4, enquiry_id: 1, followup_date: getFutureDate(-2), notes: 'Awaiting driving license upload from customer.', status: 'Overdue', created_by: 2 }
];

mockData.activity_logs = [
  { id: 1, enquiry_id: 1, user_id: 1, action: 'Enquiry Created', details: 'Admin created a new self-drive enquiry for John Doe.', created_at: getFutureDate(-5) },
  { id: 2, enquiry_id: 2, user_id: 2, action: 'Enquiry Created', details: 'Booking Executive created a chauffeur-drive enquiry for Jane Smith.', created_at: getFutureDate(-4) },
  { id: 3, enquiry_id: 2, user_id: 3, action: 'Follow-up Logged', details: 'Logged completed call: Timings checked.', created_at: getFutureDate(-1) },
  { id: 4, enquiry_id: 4, user_id: 1, action: 'Enquiry Confirmed', details: 'Admin confirmed the self-drive booking for Alice Davis.', created_at: getFutureDate(-3) }
];

class MockPool {
  async query(sql, params = []) {
    const queryLower = sql.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Count/Sum aggregations for dashboard
    if (queryLower.includes('select count(*) as count from enquiries')) {
      let filtered = mockData.enquiries;
      if (queryLower.includes('assigned_staff_id = ?')) {
        const staffId = params[params.length - 1];
        filtered = filtered.filter(e => e.assigned_staff_id === staffId);
      }
      if (queryLower.includes("status = 'new'")) {
        filtered = filtered.filter(e => e.status === 'New');
      }
      if (queryLower.includes("date(created_at) = current_date()")) {
        const todayStr = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(e => {
          const cDate = e.created_at instanceof Date ? e.created_at : new Date(e.created_at);
          return cDate.toISOString().split('T')[0] === todayStr;
        });
      }
      return [[{ count: filtered.length }]];
    }

    if (queryLower.includes('select count(*) as count from followups')) {
      let filtered = mockData.followups;
      if (queryLower.includes("f.status = 'planned'")) {
        filtered = filtered.filter(f => f.status === 'Planned');
      }
      if (queryLower.includes('assigned_staff_id = ?') || queryLower.includes('e.assigned_staff_id = ?')) {
        const staffId = params[params.length - 1];
        filtered = filtered.filter(f => {
          const enq = mockData.enquiries.find(e => e.id === f.enquiry_id);
          return enq && enq.assigned_staff_id === staffId;
        });
      }
      return [[{ count: filtered.length }]];
    }

    if (queryLower.includes('select count(*) as count from bookings')) {
      let filtered = mockData.bookings;
      if (queryLower.includes("b.status = 'confirmed'")) {
        filtered = filtered.filter(b => b.status === 'Confirmed');
      }
      if (queryLower.includes('assigned_staff_id = ?') || queryLower.includes('e.assigned_staff_id = ?')) {
        const staffId = params[params.length - 1];
        filtered = filtered.filter(b => {
          const enq = mockData.enquiries.find(e => e.id === b.enquiry_id);
          return enq && enq.assigned_staff_id === staffId;
        });
      }
      return [[{ count: filtered.length }]];
    }

    if (queryLower.includes('select coalesce(sum(b.total_amount), 0) as revenue')) {
      let filtered = mockData.bookings;
      if (queryLower.includes("b.status != 'cancelled'")) {
        filtered = filtered.filter(b => b.status !== 'Cancelled');
      }
      if (queryLower.includes('month(b.created_at) = month(current_date())') || queryLower.includes('month(b.created_at) =')) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        filtered = filtered.filter(b => {
          const bDate = b.created_at instanceof Date ? b.created_at : new Date(b.created_at);
          return bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear;
        });
      }
      if (queryLower.includes('assigned_staff_id = ?') || queryLower.includes('e.assigned_staff_id = ?')) {
        const staffId = params[params.length - 1];
        filtered = filtered.filter(b => {
          const enq = mockData.enquiries.find(e => e.id === b.enquiry_id);
          return enq && enq.assigned_staff_id === staffId;
        });
      }
      const sum = filtered.reduce((acc, curr) => acc + curr.total_amount, 0);
      return [[{ revenue: sum }]];
    }

    if (queryLower.includes('select count(*) as total from bookings')) {
      return [[{ total: mockData.bookings.length }]];
    }

    // 1. Auth check
    if (queryLower.includes('insert into users')) {
      const id = mockData.users.length + 1;
      mockData.users.push({
        id,
        name: params[0],
        email: params[1],
        password: params[2],
        role: params[3] || 'booking_executive'
      });
      return [{ insertId: id }];
    }
    if (queryLower.includes('from users') && queryLower.includes('email =')) {
      const email = params[0];
      const match = mockData.users.filter(u => u.email === email);
      return [match];
    }
    if (queryLower.includes('from users') && queryLower.includes('id =')) {
      const id = parseInt(params[0]);
      const match = mockData.users.filter(u => u.id === id);
      return [match];
    }
    if (queryLower.includes('from users') && !queryLower.includes('where')) {
      return [mockData.users];
    }

    // 2. Customers
    if (queryLower.includes('from customers') && !queryLower.includes('where')) {
      return [mockData.customers];
    }
    if (queryLower.includes('from customers') && queryLower.includes('phone =')) {
      const phone = params[0];
      const match = mockData.customers.filter(c => c.phone === phone);
      return [match];
    }
    if (queryLower.includes('insert into customers')) {
      const id = mockData.customers.length + 1;
      mockData.customers.push({ id, name: params[0], phone: params[1], email: params[2] });
      return [{ insertId: id }];
    }
    if (queryLower.includes('update customers set') && queryLower.includes('email =')) {
      const email = params[0];
      const id = parseInt(params[1]);
      const idx = mockData.customers.findIndex(c => c.id === id);
      if (idx !== -1) mockData.customers[idx].email = email;
      return [{ affectedRows: 1 }];
    }

    // 3. Enquiries
    if (queryLower.includes('insert into enquiries')) {
      const id = mockData.enquiries.length + 1;
      mockData.enquiries.push({
        id,
        customer_id: params[0],
        rental_type: params[1],
        pickup_date: params[2],
        pickup_location: params[3],
        estimated_cost: parseFloat(params[4]),
        rental_days: parseInt(params[5]),
        lead_source: params[6],
        notes: params[7],
        status: 'New',
        priority: params[8],
        recommendation: params[9],
        assigned_staff_id: params[10],
        created_by: params[11],
        created_at: new Date()
      });
      return [{ insertId: id }];
    }
    if (queryLower.includes('update enquiries set')) {
      const id = parseInt(params[params.length - 1]);
      const idx = mockData.enquiries.findIndex(e => e.id === id);
      if (idx !== -1) {
        if (params.length === 12) {
          mockData.enquiries[idx].rental_type = params[0];
          mockData.enquiries[idx].pickup_date = params[1];
          mockData.enquiries[idx].pickup_location = params[2];
          mockData.enquiries[idx].estimated_cost = parseFloat(params[3]);
          mockData.enquiries[idx].rental_days = parseInt(params[4]);
          mockData.enquiries[idx].lead_source = params[5];
          mockData.enquiries[idx].notes = params[6];
          mockData.enquiries[idx].status = params[7];
          mockData.enquiries[idx].priority = params[8];
          mockData.enquiries[idx].recommendation = params[9];
          mockData.enquiries[idx].assigned_staff_id = params[10];
        } else if (params.length === 2) {
          if (queryLower.includes('status = ?')) {
            mockData.enquiries[idx].status = params[0];
          } else if (queryLower.includes('assigned_staff_id = ?')) {
            mockData.enquiries[idx].assigned_staff_id = params[0] ? parseInt(params[0]) : null;
          }
        }
      }
      return [{ affectedRows: 1 }];
    }
    if (queryLower.includes('delete from enquiries')) {
      const id = parseInt(params[0]);
      mockData.enquiries = mockData.enquiries.filter(e => e.id !== id);
      return [{ affectedRows: 1 }];
    }
    if (queryLower.includes('from enquiries') && queryLower.includes('e.id = ?')) {
      const id = parseInt(params[0]);
      const enq = mockData.enquiries.find(e => e.id === id);
      if (!enq) return [[]];
      const cust = mockData.customers.find(c => c.id === enq.customer_id) || {};
      const staff = mockData.users.find(u => u.id === enq.assigned_staff_id) || {};
      const creator = mockData.users.find(u => u.id === enq.created_by) || {};
      return [[{
        ...enq,
        customer_name: cust.name,
        customer_phone: cust.phone,
        customer_email: cust.email,
        staff_name: staff.name || null,
        creator_name: creator.name
      }]];
    }
    if (queryLower.includes('from enquiries')) {
      const list = mockData.enquiries.map(enq => {
        const cust = mockData.customers.find(c => c.id === enq.customer_id) || {};
        const staff = mockData.users.find(u => u.id === enq.assigned_staff_id) || {};
        const creator = mockData.users.find(u => u.id === enq.created_by) || {};
        const bk = mockData.bookings.find(b => b.enquiry_id === enq.id) || {};
        const folls = mockData.followups.filter(f => f.enquiry_id === enq.id && f.status === 'Planned');
        const next_followup_date = folls.length > 0 ? folls[0].followup_date : null;
        return {
          ...enq,
          customer_name: cust.name,
          customer_phone: cust.phone,
          customer_email: cust.email,
          staff_name: staff.name || null,
          creator_name: creator.name,
          booking_number: bk.booking_number || null,
          booking_status: bk.status || null,
          next_followup_date
        };
      });
      return [list];
    }

    // 4. Bookings
    if (queryLower.includes('insert into bookings')) {
      const id = mockData.bookings.length + 1;
      if (params.length >= 10) {
        mockData.bookings.push({
          id,
          booking_number: params[0],
          enquiry_id: parseInt(params[1]),
          total_amount: parseFloat(params[2]),
          advance_payment: parseFloat(params[3]),
          drop_location: params[4],
          return_date: params[5],
          payment_status: params[6],
          driver_required: params[7],
          status: params[8],
          vehicle_assigned: params[9] || null,
          created_at: new Date()
        });
      } else {
        mockData.bookings.push({
          id,
          booking_number: params[0],
          enquiry_id: parseInt(params[1]),
          total_amount: parseFloat(params[2]),
          advance_payment: parseFloat(params[3]),
          status: params[4],
          vehicle_assigned: params[5] || null,
          drop_location: null,
          return_date: null,
          payment_status: 'Unpaid',
          driver_required: 'No',
          created_at: new Date()
        });
      }
      return [{ insertId: id }];
    }
    if (queryLower.includes('from bookings') && queryLower.includes('enquiry_id = ?')) {
      const enquiryId = parseInt(params[0]);
      const match = mockData.bookings.filter(b => b.enquiry_id === enquiryId);
      return [match];
    }
    if (queryLower.includes('from bookings') && (queryLower.includes('b.id = ?') || queryLower.includes('id = ?')) && !queryLower.includes('enquiry_id = ?')) {
      const id = parseInt(params[0]);
      const b = mockData.bookings.find(x => x.id === id);
      if (!b) return [[]];
      const enq = mockData.enquiries.find(e => e.id === b.enquiry_id) || {};
      const cust = mockData.customers.find(c => c.id === enq.customer_id) || {};
      const staff = mockData.users.find(u => u.id === enq.assigned_staff_id) || {};
      return [[{
        ...b,
        rental_type: enq.rental_type,
        pickup_date: enq.pickup_date,
        pickup_location: enq.pickup_location,
        estimated_cost: enq.estimated_cost,
        rental_days: enq.rental_days,
        assigned_staff_id: enq.assigned_staff_id,
        customer_name: cust.name,
        customer_phone: cust.phone,
        customer_email: cust.email,
        staff_name: staff.name || null
      }]];
    }
    if (queryLower.includes('from bookings') && !queryLower.includes('enquiry_id = ?')) {
      const list = mockData.bookings.map(b => {
        const enq = mockData.enquiries.find(e => e.id === b.enquiry_id) || {};
        const cust = mockData.customers.find(c => c.id === enq.customer_id) || {};
        const staff = mockData.users.find(u => u.id === enq.assigned_staff_id) || {};
        return {
          ...b,
          rental_type: enq.rental_type,
          pickup_date: enq.pickup_date,
          pickup_location: enq.pickup_location,
          estimated_cost: enq.estimated_cost,
          rental_days: enq.rental_days,
          assigned_staff_id: enq.assigned_staff_id,
          customer_name: cust.name,
          customer_phone: cust.phone,
          customer_email: cust.email,
          staff_name: staff.name || null
        };
      });
      return [list];
    }
    if (queryLower.includes('update bookings set')) {
      const id = parseInt(params[params.length - 1]);
      const idx = mockData.bookings.findIndex(b => b.id === id);
      if (idx !== -1) {
        if (params.length >= 8) {
          mockData.bookings[idx].total_amount = parseFloat(params[0]);
          mockData.bookings[idx].advance_payment = parseFloat(params[1]);
          mockData.bookings[idx].status = params[2];
          mockData.bookings[idx].vehicle_assigned = params[3];
          mockData.bookings[idx].drop_location = params[4];
          mockData.bookings[idx].return_date = params[5];
          mockData.bookings[idx].payment_status = params[6];
          mockData.bookings[idx].driver_required = params[7];
        } else if (queryLower.includes('vehicle_assigned = ?')) {
          mockData.bookings[idx].total_amount = parseFloat(params[0]);
          mockData.bookings[idx].advance_payment = parseFloat(params[1]);
          mockData.bookings[idx].status = params[2];
          mockData.bookings[idx].vehicle_assigned = params[3];
        } else {
          mockData.bookings[idx].total_amount = parseFloat(params[0]);
          mockData.bookings[idx].advance_payment = parseFloat(params[1]);
          mockData.bookings[idx].status = params[2];
        }
      }
      return [{ affectedRows: 1 }];
    }

    // 5. Followups
    if (queryLower.includes('insert into followups')) {
      const id = mockData.followups.length + 1;
      mockData.followups.push({
        id,
        enquiry_id: params[0],
        followup_date: params[1],
        notes: params[2],
        status: params[3],
        created_by: params[4],
        created_at: new Date()
      });
      return [{ insertId: id }];
    }
    if (queryLower.includes('from followups') && queryLower.includes('enquiry_id = ?')) {
      const enquiryId = parseInt(params[0]);
      const list = mockData.followups.filter(f => f.enquiry_id === enquiryId).map(f => {
        const creator = mockData.users.find(u => u.id === f.created_by) || {};
        return { ...f, creator_name: creator.name };
      });
      return [list];
    }
    if (queryLower.includes('from followups')) {
      const list = mockData.followups.map(f => {
        const enq = mockData.enquiries.find(e => e.id === f.enquiry_id) || {};
        const cust = mockData.customers.find(c => c.id === enq.customer_id) || {};
        const creator = mockData.users.find(u => u.id === f.created_by) || {};
        return {
          ...f,
          rental_type: enq.rental_type,
          pickup_date: enq.pickup_date,
          pickup_location: enq.pickup_location,
          enquiry_status: enq.status,
          customer_name: cust.name,
          customer_phone: cust.phone,
          customer_email: cust.email,
          creator_name: creator.name
        };
      });
      return [list];
    }
    if (queryLower.includes('update followups set')) {
      const id = parseInt(params[params.length - 1]);
      const idx = mockData.followups.findIndex(f => f.id === id);
      if (idx !== -1) {
        mockData.followups[idx].status = params[0];
        mockData.followups[idx].notes = params[1];
      }
      return [{ affectedRows: 1 }];
    }

    // 6. Activity logs
    if (queryLower.includes('insert into activity_logs')) {
      const id = mockData.activity_logs.length + 1;
      mockData.activity_logs.push({
        id,
        enquiry_id: params[0],
        user_id: params[1],
        action: params[2],
        details: params[3],
        created_at: new Date()
      });
      return [{ insertId: id }];
    }
    if (queryLower.includes('from activity_logs') && queryLower.includes('enquiry_id = ?')) {
      const enquiryId = parseInt(params[0]);
      const list = mockData.activity_logs.filter(l => l.enquiry_id === enquiryId).map(l => {
        const u = mockData.users.find(usr => usr.id === l.user_id) || {};
        return { ...l, user_name: u.name, user_role: u.role };
      });
      return [list];
    }

    return [[]];
  }

  async getConnection() {
    return {
      query: async (sql, params = []) => this.query(sql, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {}
    };
  }
}

const mockPool = new MockPool();

(async () => {
  // Check if we are running on Vercel without DB settings, or if USE_MOCK is explicitly requested
  if ((process.env.VERCEL === '1' && !process.env.DB_HOST) || process.env.USE_MOCK === 'true') {
    console.warn('\n========================================');
    console.warn('Vercel environment detected without DB host config. FALLING BACK TO MEMORY MOCK MODE.');
    console.warn('The application is fully operational in-memory!');
    console.warn('========================================\n');
    useMock = true;
    return;
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
      database: process.env.DB_NAME || 'slv_events_crm',
      connectTimeout: 2000 // Timeout in 2s if DB is unreachable
    });
    console.log('Successfully connected to MySQL database: ' + (process.env.DB_NAME || 'slv_events_crm'));
    connection.end();
    
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
      database: process.env.DB_NAME || 'slv_events_crm',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 2000 // Timeout in 2s if DB is unreachable
    });
  } catch (error) {
    console.warn('\n========================================');
    console.warn('MySQL database connection failed. FALLING BACK TO MEMORY MOCK MODE.');
    console.warn('The application is fully operational in-memory!');
    console.warn('========================================\n');
    useMock = true;
  }
})();

module.exports = {
  query: async (sql, params) => {
    if (useMock || !pool) {
      return mockPool.query(sql, params);
    }
    return pool.query(sql, params);
  },
  getConnection: async () => {
    if (useMock || !pool) {
      return mockPool.getConnection();
    }
    return pool.getConnection();
  }
};

