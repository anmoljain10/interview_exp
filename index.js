var express=require('express');

var app=express();
var mongo=require('mongodb').MongoClient;
var assert=require('assert');
var bodyParser = require('body-parser');
var url='mongodb://localhost:27017/node-demo';
var urlencodedParser=bodyParser.urlencoded({extended:true});
images = [{image:"/abc.jpg"}];
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('search',{image:images});
});
/*app.get('/index1', function(req, res){
    res.render('index1',{page:'Home', menuId:'home'});
});
*/
app.post("/adduser",urlencodedParser, function(req, res){
var item={
Username:req.body.usrname,
Email:req.body.email,
Password:req.body.psw,
Interests:req.body.interests

};
mongo.connect(url,function(err,db)
{
assert.equal(null,err);
db.collection('user-data').insertOne(item,function(err,result){
assert.equal(null,err);
console.log('vhd');
db.close();
});
});
res.send('done');

 });
app.get('/getdata',urlencodedParser, function(req, res){
var resultArray=[];
mongo.connect(url,function(err,db)
{
assert.equal(null,err);
var cursor=db.collection('user-data').find();
cursor.forEach(function(doc,err){
assert.equal(null,err);
resultArray.push(doc);
},function()
{
db.close();
res.render('index1',{items:resultArray});
});
});
});


app.listen(3000);
