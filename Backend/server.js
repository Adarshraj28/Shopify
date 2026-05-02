const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/shopsy")
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log("Mongo error:", err));

// USER MODEL
const User = mongoose.model("User", {
  firstName: String,
  lastName: String,
  email: String,
  password: String
});

// SIGNUP
app.post("/signup", async (req,res)=>{
  try {
    const hashed = await bcrypt.hash(req.body.password,10);

    const user = await User.create({
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      email:req.body.email,
      password:hashed
    });

    res.json({message:"Signup success"});

  } catch (error) {
    console.log(error);
    res.status(500).json({message:"Signup failed"});
  }
});

// LOGIN
app.post("/login", async (req,res)=>{
  try {
    console.log("LOGIN HIT");

    const user = await User.findOne({email:req.body.email});
    if(!user) return res.status(401).json({message:"No user"});

    const ok = await bcrypt.compare(req.body.password,user.password);
    if(!ok) return res.status(401).json({message:"Wrong password"});

    const token = jwt.sign({id:user._id},"secret");
    res.json({token});

  } catch(err) {
    console.log("ERROR:", err);
    res.status(500).send("Server error");
  }
});

app.listen(5000, () => console.log("Server running on 5000"));


//DATA MODEL
const Data = mongoose.model("Data", {
  userId: String,
  type: String, // sales / purchase / expense
  item: String,
  qty: Number,
  price: Number,
  total: Number,
  date: String
});

function auth(req, res, next) {
  try {
    const token = req.headers.authorization;

    if (!token) return res.status(401).send("No token");

    const decoded = jwt.verify(token, "secret");
    req.userId = decoded.id;

    next();
  } catch (err) {
    res.status(401).send("Invalid token");
  }
}

app.post("/add", auth, async (req, res) => {
  try {
    const data = await Data.create({
      ...req.body,
      userId: req.userId
    });

    console.log("Saved:", data); // 🔥 DEBUG
    res.json({ message: "Saved" });

  } catch (err) {
    console.log("Save error:", err);
    res.status(500).send("Save failed");
  }
});

app.get("/data", auth, async (req, res) => {
  try {
    const data = await Data.find({ userId: req.userId });

    console.log("Fetched:", data.length); // 🔥 DEBUG

    res.json(data);

  } catch (err) {
    res.status(500).send("Fetch failed");
  }
});