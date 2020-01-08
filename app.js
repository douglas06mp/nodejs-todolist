//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + '/date.js');
const { password } = require(__dirname + '/password.js');
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));


mongoose.connect(`mongodb+srv://douglas06mp:${password}@todolist-1gqnz.mongodb.net/todolistDB`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: 'Welcome to your todolist'
});

const item2 = new Item({
  name: 'Hit the + button to add new item'
});

const item3 = new Item({
  name: '<-- Hit this button to delete'
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){
  const day = date.getDate();
  Item.find({}, (err, items) => {
    if(items.length === 0){
      Item.insertMany(defaultItems, err => {
        err ? console.log(err) : console.log('add item')
      });
      res.redirect("/");
    } else {
      res.render('list', { listTitle: 'Today', listItems: items });
    }
  });
});

app.post('/', function(req, res){
  const listName = req.body.listName;
  const newItem = req.body.newItem;
  const item = new Item({
    name: newItem
  });
  if(listName === 'Today'){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err,list) => {
      list.items.push(item);
      list.save();
      res.redirect(`/${listName}`);
    });
  }

});

app.post("/delete", function(req, res){
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === 'Today'){
    Item.findByIdAndRemove(id, err => {
      if(!err) res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:id}}}, (err, list) => {
      if(!err) res.redirect(`/${listName}`);
    });
  }
});

app.get("/:listName", function(req, res){
  const listName = _.capitalize(req.params.listName);
  List.findOne({name: listName}, (err,list) => {
    if(!err){
      if(!list){
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect(`/${listName}`);
      } else {
        res.render("list", {listTitle: list.name, listItems: list.items});
      }
    }
  });

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function(){
  console.log("Server started");
});
