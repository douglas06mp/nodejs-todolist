//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const app = express();


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

const items = ['Wake Up', 'Shower', 'Work'];
const workItems = [];

app.get("/", function(req, res){
  const day = date.getDate();
  res.render('list', { listTitle: day, listItems: items });
});

app.post('/', function(req, res){
  const newItem = req.body.newItem;
  if(req.body.list === "Work"){
    workItems.push(newItem);
    res.redirect('/work');
  } else {
    items.push(newItem);
    res.redirect('/');
  }
});

app.get('/work', function(req, res){
  res.render('list', { listTitle: 'Work List', listItems: workItems });
});

app.post('/work', function(req, res){
  const newItem = req.body.newItem;
  workItems.push(newItem);
  res.redirect('/work');
});



app.listen(3000, function(){
  console.log("Server started");
});
