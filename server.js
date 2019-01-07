var express=require('express');
var mongoose=require('mongoose');
var app=express();
var mongo=require('mongodb').MongoClient;
var assert=require('assert');
var bodyParser = require('body-parser');
var url='mongodb://localhost:27017/mydatabase';
const user=require('../project/models/user');
const post=require('../project/models/post');
var urlencodedParser=bodyParser.urlencoded({extended:true});
var cookieParser=require('cookie-parser');
var session=require('express-session');
const randomstring=require('randomstring');
var flash=require('express-flash');
var sessionStore = new session.MemoryStore;


const nodemailer=require('nodemailer');

const transporter = nodemailer.createTransport({
service:'Gmail',
auth: {
user :'anmoljain2040@gmail.com',
pass :'anmoljain070'
}
});






app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
secret:'guessit',
saveUninitialized:false,
resave:false,
cookie: {
        expires: 600000
    }
}));
app.use(cookieParser('guessit'));
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.email) {
        res.clearCookie('user_sid');        
    }
    next();
});
var sessionChecker = (req, res, next) => {
    if (req.session.email && req.cookies.user_sid) {
        res.redirect('index1');
    } else {
        next();
    }    
};
app.use(flash());
app.use(function(req, res, next){
    // if there's a flash message in the session request, make it available in the response, then delete it
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
});

app.set('view engine', 'ejs');
app.get('/', function(req, res){
    res.render('search');
});

mongoose.connect('mongodb://localhost:27017/mydatabase');
                           //for inserting user info
app.post("/adduser",urlencodedParser, function(req, res){
var array=(req.body.interests).split(',');
var secrettoken=randomstring.generate();
console.log(array);
new user({
username:req.body.usrname,
_id:req.body.email,
password:req.body.psw,
interest:array,
postcount:0,
replycount:0,
active:false,
secrettoken:secrettoken
}).save(function(err,doc)
{mongoose.connection.close();
if(err)
{res.redirect('/',{message:'user already exists'});
}
else
{req.session.username=doc.username;
var mailOptions = {
  from: 'anmoljain2040@gmail.com',
  to: doc._id,
  subject: 'Verify WitSpace account',
  text: 'copy and paste this unique code to verify your account: '+doc.secrettoken
};
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
}); 
res.render('verify');


}
});
});




//login authentication...
var sess;
app.get(sessionChecker, (req, res) => {
       res.redirect('search');
    }).post("/login",urlencodedParser,function(req,res)
{
mongo.connect(url ,function(err,db)
{
assert.equal(null,err);
db.collection('user-infos').findOne({_id:req.body.email,password:req.body.psw},function(err,result)
{

if(err)
{
  
}

if(result!=null && result.length!=0)
{
sess=req.session;

sess.username=result.username;
res.render('home',{user:result,success:true,posted:false});

}




else
{
res.redirect('/');
}


db.close();

});
});
});


//search results.
app.get('/getdata',urlencodedParser, function(req, res){
var resultArray=[];
mongo.connect(url,function(err,db)
{
assert.equal(null,err);
var cursor=db.collection('post').find({_id:req.body.sear});
cursor.forEach(function(doc,err){
assert.equal(null,err);
resultArray.push(doc);
},function()
{
db.close();
res.render('home',{items:resultArray,success:false,posted:false});
});
});
});

app.post('/verify',function(req,res){
if(req.session.username)
{console.log(req.session.username);
mongo.connect(url ,function(err,db)
{
assert.equal(null,err);
db.collection('user-infos').findOne({username:req.session.username,secrettoken:req.body.secret_token},function(err,result){
assert.equal(null,err);
console.log(result.secrettoken);
console.log(req.body.secret_token);
if(err)
{
}
else if(result!=null && result.length!=0)
{
res.render('home',{user:result});

}
else
{
res.redirect('/');
}
db.close();
});
});
}
});
//about us page
app.get('/about',function(req,res)
{
res.render('about');
});
app.get('/about/#h1',function(req,res)
{
res.redirect('about/#h1');
});
//saving the post
app.post('/postexp',urlencodedParser,function(req,res){
var date=new Date();
new post({
_id:req.body.title,
username:req.session.username,
category:req.body.tags,
post:req.body.postit,
upvote:0,
downvote:0,
date:date
}).save(function(err,doc){
if(err)
{res.send(err);
}
else
{
res.redirect('home',{success:true,post:doc,posted:true});
}
});
});


app.get('/postq',function(req,res){
if (req.session.username) {
        res.render('postq');
    } else {
        res.redirect('/');
    }

});


app.get('/logout',function(req,res){
req.session.destroy(function(err) {
  if(err) {
    console.log(err);
  } else {
    res.redirect('/');
  }
});
});
app.get('/home',function(req,res){
var resultArray=[];
mongo.connect(url,function(err,db)
{
assert.equal(null,err);
var cursor=db.collection('post').find();
cursor.forEach(function(doc,err){
assert.equal(null,err);
resultArray.push(doc);
},function()
{
db.close();
if(!req.session.username)
res.render('home',{success:false,items:resultArray,posted:false});
else
res.render('home',{success:true,items:resultArray,posted:false});
});
});
});




app.get('/profile',function(req,res){
if(req.session.username)
{mongo.connect(url ,function(err,db)
{
assert.equal(null,err);
db.collection('user-infos').findOne({username:req.session.username},function(err,result){
assert.equal(null,err);
res.render('profile',{items:result,user:result});
db.close();
});
});
}
});
app.listen(3000);
