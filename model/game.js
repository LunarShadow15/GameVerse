const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://abhishek780487:4azGYIq9pfsNfseU@cluster0.frvmq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
// mongoose.connect('mongodb+srv://abhishek780487:4azGYIq9pfsNfseU@cluster0.frvmq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
const gameschema=  mongoose.Schema({

      img:String,
      name:String,
      description:String,
      posts:[{type:mongoose.Schema.Types.ObjectId,ref:"post"}],
      likes:[
        {type:mongoose.Schema.Types.ObjectId,
        ref:"user"}
      ]
})

module.exports=mongoose.model("game",gameschema);