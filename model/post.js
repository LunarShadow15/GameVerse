const mongoose=require('mongoose');

const postschema=  mongoose.Schema({
      heading:String,
      userinfo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
      },
      date:{
        type:Date,
        default:Date.now()
      },
      content:String,
      likes:[
        {type:mongoose.Schema.Types.ObjectId,
        ref:"user"}
      ],
      game:[{type:mongoose.Schema.Types.ObjectId,ref:"game"}],
})


module.exports=mongoose.model("post",postschema);