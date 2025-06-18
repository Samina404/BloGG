const express = require("express");

const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



const cookieParser = require("cookie-parser");
const path = require("path");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());



app.get("/", (req, res) => {
  res.render("index");
});
app.post('/register', async (req, res) => {
  let { username, email, password, age } = req.body;
  let user= await userModel.findOne({email});
  if(user) return res.status(500).send('User already registered')

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        email,
        password: hash,
        age,
      });
      let token = jwt.sign({ email }, "ssssssssshhhhhhhhh");
      res.cookie("token", token);

      res.send("register");
    });
  });
});
app.get("/register", (req, res) => {
  res.render("index"); // or whatever your EJS file is named
});


app.post("/login", async function (req, res) {
  let{email,password}=req.body;
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) return res.send("something is wrong");
  console.log(user.password);
  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      
      let token = jwt.sign({email:user.email }, "ssssssssshhhhhhhhh");
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    } 
    else res.redirect("/login");
  });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/logout", function (req, res) {
  res.cookie("token", "");
  res.redirect("/login");
});

app.get("/profile",isLoggedIn,async (req, res)=> {
  let user= await userModel.findOne({email: req.user.email}).populate("posts");
 

res.render("profile",{user});

  })
  app.post("/post",isLoggedIn,async (req, res)=> {
  let user= await userModel.findOne({email: req.user.email});
  let{content}=req.body;
  let post = await postModel.create({
  user:user._id,
  content:content
})
user.posts.push(post._id)
await user.save();
res.redirect("/profile")

  })
  app.post('/post/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const postId = req.params.id;
    const user = await userModel.findOne({ email: req.user.email });

    if (!user.posts.includes(postId)) {
      return res.status(403).send("You don't have permission to delete this post");
    }

    await postModel.findByIdAndDelete(postId);

    user.posts = user.posts.filter(p => p.toString() !== postId);
    await user.save();

    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting post");
  }
});

app.get("/profile", (req, res) => {
  const user = req.user; // or however you're fetching it
  res.render("profile", { username});

   // <-- make sure 'user' is passed
});


function isLoggedIn(req, res, next){
  if(req.cookies.token === "") res.redirect("/login")
    else{
  let data=jwt.verify(req.cookies.token,"ssssssssshhhhhhhhh")
  req.user= data;
    }
    next();
  }
const PORT=process.env.PORT || 3000;
app.listen(PORT,()=> console.log(`Server Running`))
