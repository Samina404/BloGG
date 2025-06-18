require('dotenv').config();
const mongoose= require('mongoose');
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const userSchema= mongoose.Schema({
username:String,
email:String,
password:String,
age:Number,
posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post'
  }]


})
module.exports=mongoose.model("user",userSchema);

