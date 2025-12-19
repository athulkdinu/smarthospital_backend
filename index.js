// import the json server

const JSONServer = require('json-server')  // it return a express server

// create server for running json file

const smarthospital = JSONServer.create()      

// 3. create middleware

const middleware=JSONServer.defaults() 

//6.import db,json file

const router=JSONServer.router("db.json") 

//4.defime port to run the server

const PORT=process.env.PORT || 3000

// Add CORS headers middleware
smarthospital.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

//5.use middleware

smarthospital.use(middleware) 
//7.use router

smarthospital.use(router)

//8.tell the server to listen for the client

smarthospital.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Hospital starts at PORT number ${PORT}`);
    console.log(`Server is running and accessible from external networks`);
})


