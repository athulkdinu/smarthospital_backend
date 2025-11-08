// import the json server

const JSONServer = require('json-server')  // it return a express server
const cors = require('cors')  // CORS middleware for cross-origin requests

// create server for running json file

const smarthospital = JSONServer.create()      

// 3. create middleware

const middleware=JSONServer.defaults() 

//6.import db,json file

const router=JSONServer.router("db.json") 

//4.defime port to run the server

const PORT=process.env.PORT || 3000

// Enable CORS for all routes - allows requests from Vercel frontend
smarthospital.use(cors({
  origin: '*', // Allow all origins (you can restrict this to your Vercel domain in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

//5.use middleware

smarthospital.use(middleware) 
//7.use router

smarthospital.use(router)

//8.tell the server to listen for the client

smarthospital.listen(PORT,()=>{
    console.log(`Smart Hospital starts at PORT number ${PORT}`);
    
})


