require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const usermodel = require('./model/user');
const postmodel =require("./model/post");
const game=require("./model/game")
const cookieParser = require('cookie-parser');
const Comment = require('./model/comment');
const Post = require('./model/post');
const dbURI = process.env.MONGODB_URI;
const mongoose = require('mongoose');
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
  res.render('index'); 
}
)
app.get('/create', (req, res) => {
  res.render('create');
}
)

app.get("/profile",isLoggedIn,async (req,res) => {
  let user=await usermodel.findOne({email:req.user.email}).populate("posts")
  let gamer=await game.find();
  let post=await postmodel.find();
  let comment=await Comment.find();

  res.render('profile',{user,gamer,post,comment}); 
}
) 
 
app.get('/logout', async (req, res) => {
  res.cookie("Token", "");
  res.redirect('/');
}
)

app.get('/home',async (req,res) => {
  let gamer=await game.find();
  let post=await postmodel.find()

  res.render('home',{gamer,post});
}
)

app.get('/createPost',isLoggedIn,async (req,res)=>{
  let gamelist = await game.find();
  res.render('createpost',{gamelist})
})
app.post('/createPost',isLoggedIn,async (req,res) => {
  let user=await usermodel.findOne({email:req.user.email});
  let {heading,content,gamename}=req.body;
  let post=await postmodel.create({
    userinfo:user._id,
    heading,
    content,
    gamename
  })

  user.posts.push(post._id)
  await user.save();
  res.redirect('/profile');
}
)

app.get('/trendingpage',async (req,res) => {
  let gamer=await game.find();
  res.render('trendingpage',{gamer});
}
)

app.get('/gamepage/:gameid',async (req,res) => {
  let games = await game.findOne({_id:req.params.gameid});
  res.render('gamepage',{games});
}
)

app.get('/gamepage/:gameid/generaldiscussion',async (req,res) => {

  let games = await game.findOne({_id:req.params.gameid});
  let post =await postmodel.find();
  res.render('generaldiscussion',{games,post});

}
)
app.get('/post/:postid', isLoggedIn, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postid });
    const comments = await Comment.find({ post: req.params.postid })
      .sort({ postedAt: 1 });
    
    // Function to organize comments into a nested structure
    const organizeComments = (comments) => {
      let commentMap = new Map();
      let roots = [];

      // Create a map of comments by their IDs
      comments.forEach(comment => commentMap.set(comment._id.toString(), { ...comment._doc, children: [] }));

      // Organize comments into a nested structure
      comments.forEach(comment => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId.toString());
          if (parent) parent.children.push(commentMap.get(comment._id.toString()));
        } else {
          roots.push(commentMap.get(comment._id.toString()));
        }
      });

      return roots;
    };

    const organizedComments = organizeComments(comments);

    res.render('post', { post, comments: organizedComments });
  } catch (error) {
    res.status(500).send("Error retrieving post or comments");
  }
});


// Route to create a comment on a post
app.post('/post/:postid/comment', isLoggedIn, async (req, res) => {
  try {
    const { comment, parentId } = req.body;
    let user=await usermodel.findOne({email:req.user.email});
      console.log("Step 1 is completed")
      const newComment = new Comment({
          username:user.name,
          userinfo:user._id, // Assuming req.user is set after user authentication
          post: req.params.postid,
          comment: comment,
          parentId: parentId || null,
      });
      console.log("Step 2 is completed")
      // If the comment is a reply, set the rootId
      if (parentId) {
        console.log("step 3")
          const parentComment = await Comment.findOne({_id:parentId});
          console.log("Step 4 is completed")
          console.log()
          newComment.rootId = parentComment.rootId || parentComment._id;
          console.log("step 5");
      }      
      await newComment.save();
      res.redirect(`/post/${req.params.postid}`);
  } catch (error) {
      res.status(500).send("Error creating comment");
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


app.get('/creategame',isLoggedIn,async (req,res) => {
  res.render('creategame');
}
)


app.post('/creategame',isLoggedIn,async (req,res) => {
  let {content,name,img}=req.body;
  let makegame=await game.create({
      img,
      name,
      description:content
  })
   
  res.redirect('/profile');
}
)

app.post('/create', async (req, res) => {
  let { username, email, age, password } = req.body;

  let user = await usermodel.findOne({ email });
  if (user) {
    
    res.send('<span>This Email Is already registered Log In Instead... <a href="/">Log In</a></span>');

  }
  else{

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        const newuserdata = await usermodel.create({
          username,
          name: username,
          age,
          email,
          password: hash
        })
        let token = jwt.sign({ email: email }, "shhh");
        res.cookie("Token", token);
        res.redirect('/profile');
      }
      )
    }
    ) 
  }
 

}
)

app.get("/like/:id",isLoggedIn,async (req,res) => {
  let post=await postmodel.findOne({_id:req.params.id}).populate("userinfo");
  if(post.likes.indexOf(req.user.userid) === -1){
    post.likes.push(req.user.userid);
  }
  else{
    post.likes.splice(post.likes.indexOf(req.user.userid),1);
  }
  await post.save();
  res.redirect('/profile');
}
)



app.post('/login', async (req, res) => {
  let { email, password } = req.body;
  let user = await usermodel.findOne({ email });
  if (user) {
    let verify = bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        let token = jwt.sign({ email: email }, "shhh");
        res.cookie("Token", token);
        res.redirect('/profile')
      }
      else{
        res.send("Incorrect Credintials. Verify your email and password")
      }

    }
    );
  }
  else{
    res.send('<span>No such User Exists Create one ? .. <a href="/create">Create</a></span>')
  }
}
)

function isLoggedIn(req,res,next){
  if(req.cookies.Token===""){
    res.send('<span>You must be logged in first .. <a href="/">Log In</a></span>'); 
  }
  else{
    let data=jwt.verify(req.cookies.Token, "shhh")
    req.user=data;
    next();
  }
}
 
app.listen(5001);