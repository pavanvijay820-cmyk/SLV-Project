const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'slv_events_crm_jwt_secret_key_2026';

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Expecting format: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access Denied: No Authentication Token Provided.' 
    });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Should contain { id, name, email, role }
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access Denied: Invalid or Expired Token.' 
    });
  }
};

// Middleware to authorize specific user roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access Denied: User Not Authenticated.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Access restricted to roles: [${allowedRoles.join(', ')}]. Current role: [${req.user.role}]` 
      });
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };
