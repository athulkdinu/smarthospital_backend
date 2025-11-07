// import the json server

const JSONServer = require('json-server')  // it return a express server

// create server for running json file

const rBuilder = JSONServer.create()      

// 3. create middleware

const middleware=JSONServer.defaults() 

//6.import db,json file

const router=JSONServer.router("db.json") 

//4.defime port to run the server

const PORT=3000 || process.env.PORT
//5.use middleware

rBuilder.use(middleware) 
//7.use router

rBuilder.use(router)

//8.tell the server to listen for the client

rBuilder.listen(PORT,()=>{
    console.log(`resume builder starts at PORT number ${PORT}`);
    
})


