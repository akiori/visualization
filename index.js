var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/bubble', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/2_hashtag.html'));
});

app.get('/two_hashtag', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/hashtag_regret.html'));
});

app.get('/stream', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/hashtag_stream.html'));
});

app.get('/liner', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/liner.html'));
});

app.get('/block', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/block.html'));
});

app.get('/wordProbability', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/wordProbability.html'));
});

app.use('/public',express.static(__dirname+'/views/public'));

app.get('/GoogleTrend', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/GoogleTrend.html'));
});

app.get('/speech', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/speech.html'));
});

app.get('/newspaper', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/newspaper.html'));
});

app.get('/freword', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/freword.html'));
});

app.get('/EditorialKeywords', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/EditorialKeywords.html'));
});

app.listen(3000);