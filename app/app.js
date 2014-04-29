// Set up a collection to contain article information. On the server,
// it is backed by a MongoDB collection named "articles".

Players = new Meteor.Collection("articles");



if (Meteor.isClient) {
  Template.leaderboard.articles = function () {

    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var article = Players.findOne(Session.get("selected_article"));
    return article && article.name;
  };

  Template.article.selected = function () {
    return Session.equals("selected_article", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_article"), {$inc: {score: 5}});
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
      Players.insert({name: new_article_name, score: 0});
    }
  };
}

// On server startup, create some articles if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {

    //Players.clear();

    if (Players.find().count() <= 5) {
      

      var mockup1 = [{"title": "funny story #" + Math.random(0, 100), "description": "a funny thing happened"}];
      var links = mockup1;
      console.log("ha " + links);
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < links.length; i++){
        Players.insert({"title": links[i].title, "description": links[i].description});
        console.log("ha " + links[i]);
      }

    }
  });
}
