// import the json server
const JSONServer = require('json-server')
const path = require('path')
const fs = require('fs')

// create server for running json file
const smarthospital = JSONServer.create()

// Define port to run the server
const PORT = process.env.PORT || 3000

// Get the path to db.json (handle both local and deployed environments)
const dbPath = path.join(__dirname, 'db.json')

// Check if db.json exists
if (!fs.existsSync(dbPath)) {
  console.error('ERROR: db.json file not found at:', dbPath);
  console.error('Current working directory:', process.cwd());
  console.error('__dirname:', __dirname);
  process.exit(1);
}

// Import db.json file
const router = JSONServer.router(dbPath)

// Create middleware with CORS enabled
const middleware = JSONServer.defaults({
  noCors: false,
  readOnly: false
})

// Add explicit CORS headers middleware (before other middleware)
smarthospital.use((req, res, next) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Use middleware (includes CORS, body parser, etc.)
smarthospital.use(middleware)

// Use router (must be after middleware)
smarthospital.use(router)

// Tell the server to listen for the client
smarthospital.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Smart Hospital API Server is running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Accessible from: http://0.0.0.0:${PORT}`);
  console.log(`📁 Database file: ${dbPath}`);
  console.log(`🔗 API endpoints available at: http://0.0.0.0:${PORT}/patients, /doctors, /admins, etc.`);
})


