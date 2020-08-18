'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var bodyParser = require('body-parser');

var cors = require('cors');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true });

var Schema = mongoose.Schema;

var ShortURLSchema = new Schema({
  original_url: String,
  short_url: Number
});

var ShortURL = mongoose.model('ShortURL', ShortURLSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", function(req, res){
  let url = req.body.url;
  dns.lookup(url.split("://")[1], function (err, address, family) {
    if(err){
      res.json({"error":"invalid URL"});
      res.end();
    }
    ShortURL.find({}).sort({_id: -1}).limit(1).then((item) => {
        console.log(item[0])
    })
    res.end();
    /*let surl = new ShortURL({ 
      original_url: url,
      short_url: 1
    });*/
  });
});

app.get("/api/shorturl/:short", function(req, res){
  
  res.writeHead(301, {Location: '/'});
  res.end();
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});