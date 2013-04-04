var express = require('express')
var https = require('https');
var oauth = require('oauth').OAuth;

var TWITTER_CONSUMER_KEY = "lx19e0cGdipZx45OmVpFdw";
var TWITTER_CONSUMER_SECRET = "MVev2e9hS049PgbPGrd5upepTQoQZsd1skHq5VqI77A";
 
var oa = new oauth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    "1.0A",
    "http://localhost:2312/auth/twitter/callback",
    "HMAC-SHA1"
  );

var token = "321928009-RHzDgTSHie4F4KzJEDfmYvZgsb3Pbvj3uSpNgFzQ";
var tokenSecret = "vRxDqVbgt0waL4k0h2Y2w78jwWqWOWyutQGeRPpP4c";

var app = express();
 
// configure Express
app.configure(function() {
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(app.router);
});

app.listen(2312);
 
app.get('/timeline', function(req, res){
  oa.get("https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=fnsea", token, tokenSecret, function (error, data, response) {
        if (error) {
          res.send("Error getting twitter timeline for screen name : fnsea ", 500);
        } else {
          // console.log(data);
          res.json(JSON.parse(data));
        }
    });
});
 
app.get('/searchapi', function(req, res){
  oa.get('https://api.twitter.com/1.1/search/tweets.json?q='+encodeURIComponent('#SEARCHTEARM'), token, tokenSecret, function (error, data, response) {
        if (error) {
          res.send("Error getting twitter timeline for screen name : ", 500);
        } else {
          //console.log(data);
          res.json(JSON.parse(data));
        }
    });
});
 
