require("dotenv").config()
const express = require("express")
require("./database/conn")
const path = require("path")
const app = express();
const hbs = require("hbs")
const Register = require("./models/register")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const port = process.env.PORT || 3000;

app.use(express.json());  //  this is good if we are passing pure json format form the api  ( like from postman)
app.use(express.urlencoded({extended : false,})); // when data is passed from a form submit method.


const st_path = path.join(__dirname, "../Public");  //join is a inbuilt fn of path and _dirname is a default parameter
const v_path = path.join(__dirname, "../templates/views");
const p_path = path.join(__dirname, "../templates/partials");

app.use(express.static(st_path));    // it will use the static page that is given in the path.
//in order to use hbs files
app.set("view engine","hbs");   // you can type anything here as two parameters
app.set("views", v_path);        // instead of root. search the views in template
hbs.registerPartials(p_path);    // used to acccess the partials

console.log(process.env.S_Key);

app.get("/",(req,res)=>{
    //res.send("We are at the homepage");       when we use view engine, we need to use res.render t get the hbs page we want to display.
    res.render("index");     // this is index.hbs which is in the view folder.
})

app.get("/registration",(req,res)=>{
    //res.send("We are at the homepage");       when we use view engine, we need to use res.render t get the hbs page we want to display.
    res.render("registration");     // this is index.hbs which is in the view folder.
})

app.get("/registers", async(req,res)=>{
        try{
            const registerlist = await Register.find();   //json formatter extension is installed to get the record in pretty format.
            res.send(registerlist);
        }
        catch(e){
            res.send(e);
        }
    })

app.get("/login",(req,res)=>{
    //res.send("We are at the homepage");       when we use view engine, we need to use res.render t get the hbs page we want to display.
    res.render("login");     // this is index.hbs which is in the view folder.
})


app.post("/registration", async (req,res)=>{
        try{
            const pw = req.body.password;
            const cpw = req.body.cpassword;
            if(pw === cpw)
            {
                const registrations = new Register({
                    fname:req.body.fname,
                    lname:req.body.lname,
                    email:req.body.email,
                    phone:req.body.phone,
                    gender:req.body.gender,
                    country:req.body.country,
                    password:pw,
                    cpassword:cpw
                })

                const token = await registrations.generatetoken();


                const result = await registrations.save();
                res.status(201).render("index");
            }
            else{
                res.send("password not matching");
                //console.log("password not matching");
            }
            //console.log(req.body.fname);
        }
        catch(e){
            res.status(400).send(e);
        }
    })

    app.post("/login", async (req,res)=>{
        try{
            const em = req.body.email;
            const pw = req.body.password;

            const result = await Register.findOne({email:em});  //it will get the document of that email.
             
            const ismatch = await bcrypt.compare(pw, result.password);  //will compare the entered password with hash.
            
            const token = await result.generatetoken();
            console.log("token is :" + token);

            console.log(ismatch);
            // if(result.password === pw)   // simple compare will not work for hash password values
            // {
            //     res.status(201).send(result);
            // }
            if(ismatch){
                res.status(201).send(result);
            }
            else{
                res.send("🚫  Invalid Details  🚫");
            }
            //res.send(result);
            //console.log(resulcct);
            //console.log(`${em} and pass : ${pw}`);
        }
        catch(e){
            res.status(400).send("🚫  Invalid Details  🚫");
        }
    })

app.listen(port,()=>{
    console.log(`port is ${port}`)
})