const mongoose=require('mongoose');
// mongoose.connect('const uri = "mongodb+srv://abhishek780487:<4azGYIq9pfsNfseU>@cluster0.frvmq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";');
// 4azGYIq9pfsNfseU
mongoose.connect('mongodb+srv://abhishek780487:4azGYIq9pfsNfseU@cluster0.frvmq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
const userschema=  mongoose.Schema({
      username:String,
      name:String,
      age:Number,
      email:String,
      password:String,
      posts:[{type:mongoose.Schema.Types.ObjectId,ref:"post"}],
      comment:[{type:mongoose.Schema.Types.ObjectId,ref:"comment"}]
})


module.exports=mongoose.model("user",userschema);