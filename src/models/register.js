const validator = require("validator")
const mongo = require("mongoose")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const res = require("express/lib/response");

const myschema = new mongo.Schema({
    fname:{
        type:String,
        required: true,
    },
    lname:{
        type:String,
    },
    email:{
        type:String,
        required: true,
        unique: [true,"Email Already Exists..!"],
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is Invalid 🚫");
            }
        },
    },
    phone:{
        type:Number,
        required: true,
        unique: [true,"Number Already Exists..!"],
        min:10,
    },
    gender:{
        type:String,
        required: true,
    },
    country:{
        type:String,
        required: true,
    },
    password:{
        type: String,
        required: true,

    },
    cpassword:{
        type: String,
        //required: true,
    },
    tokens:[{
        token:{
            type:String,
            required:true,
        },
    }]
});

myschema.methods.generatetoken = async function(){
    try{
        const token = jwt.sign({_id:this._id.toString()},process.env.S_Key); 
        this.tokens = this.tokens.concat({token});   //concate the tokens->token with the token created. we can use other 
                                                //than token but in that case object destructuring is not possible i.e. we have to use concate({token:varname});
        await this.save();
        return token;
        //console.log(token);                                
    }
    catch(e){
        res.send("error is" + e);
        console.log("error is" + e);
    }
}

myschema.pre("save", async function(next){   // 1st - method before which pre perform function, 2nd is the function.
    if(this.isModified("password"))
    {
        //console.log(this.password);    // this will show the password entered
        this.password = await bcrypt.hash(this.password,10);
        //console.log(this.password);    this will show the hash pasword
        this.cpassword = undefined;   // this will not allow confirm password to get save in the database.
       // this.cpassword = await bcrypt.hash(this.password,10);
    }
    next(); // next is a keyword which make to go ahead the functionality.
})

const Mycollection = new mongo.model("Mycollection", myschema);


module.exports = Mycollection;
