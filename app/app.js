// Set up a collection to contain article information. On the server,
// it is backed by a MongoDB collection named "articles".

Players = new Meteor.Collection("articles");


if (Meteor.isClient) {

UI.registerHelper('nullZero', function( a ) {
  a = a ? a : "0";
  return a;

});

// var Bitly = Meteor.require("bitly-oauth");
  
// var dummyUser = 'wschornmeteor';

// var b = new Bitly(dummyUser, "throwaway1");


  Template.leaderboard.articles = function () {

    return Players.find({}, {sort: {real_score: -1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var article = Players.findOne(Session.get("selected_article"));
    return article && article.name;
  };

  Template.article.selected = function () {
    return Session.equals("selected_article", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc-hide': function () {
      console.log("clicky");
      Players.update(Session.get("selected_article"), {$inc: {real_score: 5}});
    }
  });

  Template.article.events({
    'click': function () {
      Session.set("selected_article", this._id);
    }
  });
  Template.new_article.events = {
    'click input.add': function () {



      var new_article_name = document.getElementById("new_article_name").value;
      var desc = "a silly article";

      //hit the endpoint here





      Players.insert({name: new_article_name, real_score: 0});
    }
  };
}

// On server startup, create some articles if the database is empty.
if (Meteor.isServer) {



    var Bitly = Meteor.require("bitly-oauth");
      
    var dummyUser = 'wschornmeteor';

    var b = new Bitly(dummyUser, "throwaway1");





    fetchQuizFromBundle =  function(bundleUrl) {
      var newQuiz = {}
      // _wrapAsync is undocumented, but I freaking love it. Any of the bitly-oauth methods can be wrapped this way.
      b.bundleSync = Meteor._wrapAsync(b.bundle.contents);
      try {
        var result = b.bundleSync({bundle_link: bundleUrl});
        }
      catch(e) {
          console.error("fetch error: " + e);
        } 

      newMysterys = []
      console.log("adding: " + JSON.stringify(result.data.bundle));

      var links = result.data.bundle.links;

      for (var i = 0; i < links.length; i++){
        Players.insert({"title": links[i].title, "description": links[i].description});

        console.log("desc " + links[i].description);
      }

      for(var myLink in result.data.bundle.links){
        curr = result.data.bundle.links[myLink];
        console.log("bundle link: " + curr);
        ng = {"title": "funny story #" + "" + Math.floor((Math.random() * 100) + 1), "description": "a funny thing happened"};

        newMysterys.push(ng);
      }
      var rdb = result.data.bundle;
      //currently the user photo is stored in the description. this is janky, eventually we should perhaps pull the first link in the bundle?
      newQuiz = {user: rdb.bundle_owner, name: rdb.title, userPhoto: rdb.description, Mysterys: newMysterys, ts_modified: rdb.last_modified_ts};
      console.log("NQ" + newQuiz);
      return newQuiz;
     };

   





  Meteor.startup(function () {


     Meteor.methods({

        refreshFromBundle: function () {
            fetchQuizFromBundle();
        },

        bar: function () {

        // QUESTION: HOW TO CALL Meteor.methods.foo
        return 1 + foo;        

        }
    });
        



    if (Players.find().count() <= 100) {
      
    this.fetchQuizFromBundle("http://bitly.com/bundles/jennyyin/5");

      var mockup1 = [{"title": "funny story #" + "" + Math.floor((Math.random() * 100) + 1), "description": "a funny thing happened"}];

      var mockup2 = {
  "data": {
    "bundle": {
      "bundle_link": "http://bitly.com/bundles/bitlyapioauthdemo/1",
      "bundle_owner": "bitlyapioauthdemo",
      "created_ts": 1332175561,
      "description": "",
      "last_modified_ts": 1332177579,
      "links": [
        {
          "aggregate_link": "http://bit.ly/xx2UTg",
          "description": "Animated GIFs 4 Lyfe!",
          "display_order": 0,
          "link": "http://bit.ly/FWfWFP",
          "long_url": "http://bukk.it/asdf.gif",
          "title": "AAAAHHHH"
        },
        {
          "aggregate_link": "http://bit.ly/K49Ze",
          "description": "O LOOK IT'S KEYBOARD CAT",
          "display_order": 1,
          "link": "http://bit.ly/w8gWsd",
          "long_url": "http://www.youtube.com/watch?v=J---aiyznGQ",
          "title": "Keyboard Cat!"
        }
      ],
      "private": false,
      "title": "Here is a Bundle of Links!"
    }
  },
  "status_code": 200,
  "status_txt": "OK"
};





      var links = {};
      console.log("ha " + links);
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < links.length; i++){
        Players.insert({"title": links[i].title, "description": links[i].description, "real_score": 0});
        console.log("ha " + links[i]);
      }

    }
  });
}
