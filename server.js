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

var shorturl = mongoose.model('shorturl', ShortURLSchema);

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
  var url = req.body.url;
  dns.lookup(url.split("://")[1], function (err, address, family) {
    if(err){
      res.json({"error":"invalid URL"});
      res.end();
    }
    shorturl.find({}).sort({_id: -1}).limit(1).then(function(item){
        var shorturlcount = 0;
        if(item.length === 0) shorturlcount = 1;
        else shorturlcount = item[0].short_url + 1;
      
        var surl = new shorturl({ original_url: url, short_url: shorturlcount });
        surl.save(function(err, data){
          if(err) {
            res.json({ "error": "unable to save" });
          }
          res.json({
            original_url: data.original_url,
            short_url: data.short_url
          });
        });
    });
  });
});

app.get("/api/shorturl/:short", function(req, res){
  var short = req.params.short;
  shorturl.find({ short_url: short }).limit(1).then(function(item){
    if(item.length === 0) res.json({ "error": "URL unavailable" });
    else res.writeHead(301, {Location: item[0].original_url});
    res.end();
  }).catch(function(e){
    res.json({ "error": "wrong Format" });
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});