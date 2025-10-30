const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const cors = require('cors'); 

const app = express();
const port = 3000;

// --- 1. Middleware ---
app.use(bodyParser.json());
app.use(cors()); // Allow browser requests

// --- 2. Custom Middleware: Request Logger (Global) ---
// This middleware will run for EVERY request
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.originalUrl}`);
  next(); // Pass control to the next middleware
};

app.use(requestLogger); // Apply the logger globally

// --- 3. Custom Middleware: Bearer Token Auth ---
// This middleware will be applied ONLY to protected routes
const checkBearerToken = (req, res, next) => {
  const expectedToken = 'mysecrettoken';
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // Check for 'Bearer <token>' format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid Authorization header format. Use: Bearer <token>' });
  }

  const token = parts[1];
  
  // Check if the token matches
  if (token === expectedToken) {
    next(); // Token is valid, proceed to the route
  } else {
    return res.status(403).json({ message: 'Invalid or incorrect token' });
  }
};

// --- 4. API Routes ---

/**
 * [PUBLIC ROUTE] GET /public
 * Anyone can access this.
 */
app.get('/public', (req, res) => {
  res.status(200).json({ message: 'This is a public route. Anyone can see this!' });
});

/**
 * [PROTECTED ROUTE] GET /protected
 * This route uses the 'checkBearerToken' middleware.
 */
app.get('/protected', checkBearerToken, (req, res) => {
  // This code only runs if checkBearerToken() calls next()
  res.status(200).json({ 
    message: 'Access Granted: You have provided the correct Bearer token!',
    secret: 'The eagle flies at midnight.'
  });
});

// --- 5. Frontend HTML Route ---
/**
 * ROOT ROUTE
 * Path: GET /
 * Serves the index.html file from the same 'src' folder
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 6. Start Server ---
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Use the ByteXL 'Preview' button for port 3000.`);
});
