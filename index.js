// import the json server

const JSONServer = require('json-server')  // it return a express server

// create server for running json file

const smarthospital = JSONServer.create()      

// 3. Add CORS headers explicitly (must be before other middleware)
smarthospital.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }
  next()
})

// Create middleware with CORS support
const middleware = JSONServer.defaults({
  noCors: false,
  readOnly: false
})

//6.import db,json file

const router=JSONServer.router("db.json") 

//4.defime port to run the server

const PORT=process.env.PORT || 3000
//5.use middleware

smarthospital.use(middleware) 
//7.use router

smarthospital.use(router)

//8.tell the server to listen for the client

smarthospital.listen(PORT,()=>{
    console.log(`Smart Hospital starts at PORT number ${PORT}`);
    
})


