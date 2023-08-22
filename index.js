import express, { urlencoded } from "express";
import { url } from "inspector";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose.connect("mongodb://localhost:27017",{
    dbName:"backend",
}).then(()=>console.log("Database connected"));


const userSchema = mongoose.Schema({
    name:String,
    email:String,
    password:String,
});

const User = mongoose.model("User",userSchema);

const app = express();
const users =[];

app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({ extended:true }));
app.use(cookieParser());

const isAuthenticated = async(req, res, next) => {

    const {token} = req.cookies;

    if(token){

        const decoded = jwt.verify(token,"abdifweiefasbi");
        req.user = await User.findById(decoded._id);
        next();

    }
    else{
        res.redirect("/login");
    }
};

app.get('/', isAuthenticated,(req, res) => {
    res.render("logout.ejs",{name:req.user.name});

});

app.get('/register',(req, res) => {
    res.render("register.ejs");

});

app.get('/add', async(req, res) => {

    await Msg.create({name:"Subham2",email:"subham2@gmail.com"});
    res.send("Nice");
});


app.post("/register",async(req,res)=>{
    
    const { name, email, password }= req.body;
    let user = await User.findOne({email});

    if(user){
        return res.redirect("/login");
    }

    const hashedpass= await bcrypt.hash(password,10);

    user = await User.create({
        name,
        email,
        password:hashedpass,
    });

    const token = jwt.sign({_id:user._id},"abdifweiefasbi");

    res.cookie("token",token,{
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
});


app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.post("/login", async(req, res) => {

    const {email,password} = req.body;

    let user = await User.findOne({email});
    if(!user) return res.redirect("register");

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch) return res.render("login.ejs",{email,message:"Password is incorrect"});

    const token = jwt.sign({_id:user._id},"abdifweiefasbi");

    res.cookie("token",token,{
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
})



app.get("/logout", (req,res)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
    });
    res.redirect("/");
});


app.listen(3000,()=>{
    console.log("listening on");
});