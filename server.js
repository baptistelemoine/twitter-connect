var sys = require('sys');
var express = require('express')
  , passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy
var https = require('https');
var oauth = require('oauth').OAuth;

var TWITTER_CONSUMER_KEY = "LJgg";
var TWITTER_CONSUMER_SECRET = "0Q7vE";
 
var oa = new oauth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    "1.0A",
    "http://localhost:82/auth/twitter/callback",
    "HMAC-SHA1"
  );

var app = express();
 
// configure Express
app.configure(function() {
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});
 
 
app.get('/', function(req, res){
  res.render('index', {});
});
 
app.get('/sessions/connect', function(req, res){
  oa.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      res.send("Error getting OAuth request token : " + error.toString(), 500);
    } else {
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://twitter.com/oauth/authenticate?oauth_token="+req.session.oauthRequestToken);
    }
  });
});
 
app.get('/auth/twitter/callback', function(req, res){
  sys.puts(">>"+req.session.oauthRequestToken);
  sys.puts(">>"+req.session.oauthRequestTokenSecret);
  sys.puts(">>"+req.query.oauth_verifier);
  oa.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth access token : " + sys.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
    } else {
      console.log(results);
      req.session.user_id = results.id;
      req.session.screen_name = results.screen_name;
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
      
      var hash = crypto.createHash('sha1');
      hash.update(oauthAccessToken);
      client.set(hash.digest('hex'), oauthAccessToken.toString(), redis.print); // session storage
 
      var hash = crypto.createHash('sha1');
      hash.update(oauthAccessTokenSecret);
      client.set(hash.digest('hex'), oauthAccessTokenSecret.toString(), redis.print); // session storage
      // Right here is where we would write out some nice user stuff
      oa.get("https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=daemonfire", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
        if (error) {
          res.send("Error getting twitter screen name : " + sys.inspect(error), 500);
        } else {
          //console.log(data);
          req.session.twitterScreenName = data["screen_name"];
          res.json(data);
        }
      });
    }
  });
});
 
app.get('/timeline', function(req, res){
  oa.get("https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=daemonfire", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
        if (error) {
          res.send("Error getting twitter timeline for screen name : daemonfire " + sys.inspect(error), 500);
        } else {
          //console.log(data);
          req.session.twitterScreenName = data["screen_name"];
          res.json(JSON.parse(data));
        }
    });
});
 
app.get('/searchapi', function(req, res){
  oa.get('https://api.twitter.com/1.1/search/tweets.json?q='+encodeURIComponent('#SEARCHTEARM'), req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
        if (error) {
          res.send("Error getting twitter timeline for screen name : " + sys.inspect(error), 500);
        } else {
          //console.log(data);
          res.json(JSON.parse(data));
        }
    });
});
 
app.post('/post/status', function(req, res){
  var matches = true;
  if(matches !== null){
    oa.post(
      "http://api.twitter.com/1.1/statuses/update.json",
      req.session.oauthAccessToken, req.session.oauthAccessTokenSecret,
      { "status": req.body.status },
      function(error, data) {
        if(error)
          console.log(require('sys').inspect(error));
        else
          console.log(data);
      }
    );
  }
});