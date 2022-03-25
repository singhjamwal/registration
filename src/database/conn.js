const mongo = require("mongoose")
mongo.connect("mongodb://localhost:27017/userdb")
.then(()=>{
    console.log("Success..!")
}).catch((e)=>console.log(e));


