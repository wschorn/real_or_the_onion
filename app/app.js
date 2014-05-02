// Set up a collection to contain article information. On the server,
// it is backed by a MongoDB collection named "articles".

Players = new Meteor.Collection("articles");


if (Meteor.isClient) {

 Meteor.startup(function () {
  Session.setDefault("voted", []);
  Session.set("vote_count", 0);
});

 voteInSession = function ( votingID ){
  var vTemp = Session.get("voted");

  var vCount = Session.get("vote_count");
  vCount++;
  Session.set("vote_count", vCount);

  console.log("WTF VOTES " + vTemp);

  if(vTemp.indexOf(votingID) >= 0){
    console.log("WTF ALREADY VOTED ");

  }else{
    vTemp.push(votingID);



  }

  Session.set("voted", vTemp);

}


Template.leaderboard.articles = function () {

  return Players.find({}, {sort: {real_score: -1, name: 1}});
};


Template.leaderboard.bestReal = function () {




};
Template.leaderboard.searchString = function () {
  return Session.get("searching");
}

Template.leaderboard.searchResults = function () {
  var s = Session.get("searching");
  if(s != null){

    return Players.find({long_url: s}, {sort: {long_url: -1}});


  }

}

Template.leaderboard.bestOfType = function () {


  if(Session.equals("selected_type", "real")){
    return Players.find({}, {sort: {real_score: -1, name: 1}});

  }

  if(Session.equals("selected_type", "onion")){
    return Players.find({}, {sort: {onion_score: -1, name: 1}});
  }

  return Players.find({}, {sort: {ts: -1}});


};

  getPlayer = function(id) {
    var p = Players.findOne({_id: id});
    if(p != null){
      console.log("p" + p);
    }else{
      console.error("NO P:" + id);
    }
    return p;
}

  getIsOnion = function(id) {
    var p = Players.findOne({_id: id});
    return (p.long_url.indexOf(".theonion.com") > -1);
}

Template.leaderboard.currentScoreVotes = function () {
  return Session.get("vote_count");
};

Template.leaderboard.currentScore = function () {
  var pTemp;
  var s = 0;
  if(Session.equals("selected_type", "real")){
     pTemp = Players.find({}, {sort: {real_score: -1, name: 1}});

  }else if(Session.equals("selected_type", "onion")){
     pTemp = Players.find({}, {sort: {onion_score: -1, name: 1}});
  }else{

   pTemp = Players.find({}, {sort: {ts: -1}});
  }
  pTemp.forEach(function(player){
    
    var isOnion = getIsOnion(player._id);
    var didVoteOnion = Session.equals("vote_" + player._id, "ONION");
    var didVoteReal = Session.equals("vote_" + player._id, "REAL");

  console.log("isOnion "+ isOnion);
   console.log("isOnion "+ didVoteOnion);
   console.log("didvotereal " + didVoteReal);
    if(didVoteReal || didVoteOnion){
      console.log("voted " + player._id);
      //we did vote
      if(   (isOnion && didVoteOnion) || (!isOnion && didVoteReal)   ){
        s++;
      }
    }
  });

  return s;

};



Template.leaderboard.selected_name = function () {
  var article = Players.findOne(Session.get("selected_article"));
  return article && article.name;
};

Template.article.selected = function () {
  return Session.equals("selected_article", this._id) ? "selected" : '';
};

Template.article.voted = function (){
  if(Session.get("voted") == null) return false;

  return Session.get("voted").indexOf(this._id) >= 0;
};
Template.article.ts_ago = function (){
  return moment((this.ts * 1000)).fromNow()
};

Template.article.sessionVote = function (){
  return Session.get("vote_" + this._id)
};

Template.article.articleType = function (){
  if(this.long_url.indexOf(".theonion.com") >= 0)
    return "ONION"
  return "REAL"
};

Template.article.votedOnion = function (){
  return Session.equals("vote_" + this._id, "ONION")
};

Template.article.votedReal = function (){
  return Session.equals("vote_" + this._id, "REAL")
};


Template.article.votedRight = function (){
  return (Session.equals("vote_" + this._id, "ONION") && (this.long_url.indexOf(".theonion.com") >= 0)) || (Session.equals("vote_" + this._id, "REAL") && !(this.long_url.indexOf(".theonion.com") >= 0));
};

Template.article.votedWrong = function (){
  return (Session.equals("vote_" + this._id, "ONION") && !(this.long_url.indexOf(".theonion.com") >= 0)) || (Session.equals("vote_" + this._id, "REAL") && (this.long_url.indexOf(".theonion.com") >= 0));
};

Template.article.votedRightOnion = function (){
  return Session.equals("vote_" + this._id, "ONION") && (this.long_url.indexOf(".theonion.com") >= 0);
};

Template.article.votedRightReal = function (){
  return Session.equals("vote_" + this._id, "REAL") && !(this.long_url.indexOf(".theonion.com") >= 0);
};

Template.article.votedWrongOnion = function (){
  return Session.equals("vote_" + this._id, "ONION") && !(this.long_url.indexOf(".theonion.com") >= 0);
};

Template.article.votedWrongReal = function (){
  return Session.equals("vote_" + this._id, "REAL") && (this.long_url.indexOf(".theonion.com") >= 0);
};

Template.type_tabs.selectedOnion = function () {
  return Session.equals("selected_type", "onion") ? "selected" : '';
};

Template.type_tabs.selectedReal = function () {
  return Session.equals("selected_type", "real") ? "selected" : '';
};



Template.type_tabs.selectedLeader = function () {
  return Session.equals("selected_type", "leader") ? "selected" : '';
};




Template.leaderboard.events({
  'click input.inc-real': function () {
    Players.update(Session.get("selected_article"), {$inc: {real_score: 1}});
    voteInSession(this._id);
    Session.set("vote_" + this._id, "REAL")

  },
  'click input.inc-onion': function () {
    Players.update(Session.get("selected_article"), {$inc: {onion_score: 1}});
    voteInSession(this._id);
    Session.set("vote_" + this._id, "ONION")

  }
});

Template.type_tabs.events({
  'click input.tab_real': function () {
    Session.set("selected_type", "real");
  },
  'click input.tab_onion': function () {
    Session.set("selected_type", "onion");
  },
  'click input.tab_leader': function () {
    Session.set("selected_type", "leader");
  },
});

Template.article.shortlink

Template.article.events({
  'click .remove': function () {
    console.log(this + "\n oooooo \n " + this._id + this.short_url);
    Meteor.call('removeFromBundle', this._id, this.short_url);
    Players.remove
  },
    'click': function () {
    Session.set("selected_article", this._id);
  }
});
Template.new_article.events = {
  'click input.clear': function () {
      console.log("CLEAR");
        Session.set("searching", "");
  },
  'click input.add': function () {

    var new_article_name = document.getElementById("new_article_name").value;
    var desc = "a silly article";
    var longLink = new_article_name;
    console.log("making" + longLink);
    var title;
    Session.set("searching", longLink)


    Meteor.call('fetchFromService', longLink, function(err, respJson) {
      console.log("new_article_resp " + respJson);
    });

      //hit the endpoint here


    }
  };
}

// On server startup, create some articles if the database is empty.
if (Meteor.isServer) {



  var Bitly = Meteor.require("bitly-oauth");

  var dummyUser = 'wschornmeteor';

  var b = new Bitly(dummyUser, "throwaway1");

      b.bundleSync = Meteor._wrapAsync(b.bundle.contents);
     // b.getPreview = Meteor._wrapAsync(b.link.info);
     b.getPreviewHTML = Meteor._wrapAsync(b.link.content);
     b.getLinkInfo = Meteor._wrapAsync(b.info);

     b.addToBundle = Meteor._wrapAsync(b.bundle.link_add);
     b.removeFromBundle = Meteor._wrapAsync(b.bundle.link_remove);



  fetchQuizFromBundle =  function(bundleUrl) {
    var newQuiz = {}
      // _wrapAsync is undocumented, but I freaking love it. Any of the bitly-oauth methods can be wrapped this way.


     try {
      var result = b.bundleSync({bundle_link: bundleUrl});

    }
    catch(e) {
      console.error("fetch error: " + e);
    }

    newMysterys = [];

    var links = result.data.bundle.links;
    var previewHTML = "";
    for (var i = 0; i < links.length; i++){
      insertFromLink(links[i]);

    }

    for(var myLink in result.data.bundle.links){
      curr = result.data.bundle.links[myLink];
      ng = {"title": "funny story #" + "" + Math.floor((Math.random() * 100) + 1), "description": "a funny thing happened"};

      newMysterys.push(ng);
    }
    var rdb = result.data.bundle;
      //currently the user photo is stored in the description. this is janky, eventually we should perhaps pull the first link in the bundle?
      newQuiz = {user: rdb.bundle_owner, name: rdb.title, userPhoto: rdb.description, Mysterys: newMysterys, ts_modified: rdb.last_modified_ts};
      return newQuiz;
    };


    insertFromLink = function (linkObject) {
      console.log("inserting: " + JSON.stringify(linkObject));

      try {
        var previewHTML;
        var preview = b.getPreviewHTML({"link": linkObject.link});

        if(preview.status_code == 200){
          previewHTML = preview.data.content;
        }else{
          console.error("preview error: " + JSON.stringify(linkObject) + "\n gives \n" + preview.status_txt);
        }

       // console.log("\n HTML" + previewHTML);



      }
      catch(e){
        console.error("preview2 error: " + e);
      }


      var ts_info;
      try {
       var ts;

        var ts_data = b.getLinkInfo({"shortUrl": linkObject.link});
        var temp = JSON.stringify(ts_data);
        console.log("link info data for call: " + JSON.stringify(linkObject) + " was " + temp);
        if(ts_data.status_code == 200){
        ts_info = ts_data.data.info[0];
        console.log("link info data ii " + ts_info);

        ts = ts_info.created_at;
        var title = ts_info.title;
        if(title == null){
          title = "Untitled Story Happens";
        }
         title = title.replace("| The Onion - America's Finest News Source","");

    }

      }
      catch(e){
        console.error("link info error: " + e);
      }



      var newArticleObj = {"title": title, "real_score": 0, "onion_score": 0, "previewHTML": previewHTML, "ts": ts, long_url: linkObject.long_url, short_url: linkObject.link};
      console.log(newArticleObj);
      Players.insert(newArticleObj);
    }


    Meteor.startup(function () {

      var b1 = "https://bitly.com/bundles/wschornmeteor/1"

      Meteor.methods({


        refreshFromBundle: function () {
          Players.remove({});
          fetchQuizFromBundle();
        },

        bar: function () {

        // QUESTION: HOW TO CALL Meteor.methods.foo
        return 1 + foo;

      },
      removeFromBundle: function(id, shortlink) {

        var result = b.removeFromBundle({"bundle_link": b1, link: shortlink});
        console.log("INPUT: " + b1 + " " + shortlink);
        console.log(JSON.stringify(result));
        Players.remove({_id: id});

      },
      fetchFromService: function(longLink) {
        //var url = "http://api-ssl.bitly.com/v3/bundle/link_add?bundle_link=http%3A%2F%2Fbitly.com%2Fbundles%2Fjennyyin%2F5&access_token=a97cd736e88d60e46cc10eb0edd154fda1675b02&link=" + longLink;
        //synchronous GET

        var result = b.addToBundle({"link": longLink, "bundle_link": b1});


          if(result.status_code == 200){
            var newLink = result.data.bundle.links.pop().link;
            insertFromLink({link: newLink, long_url: longLink});
            console.log("Should be showing newly inserted link");
          }else{

            console.error("fetchFromService error: " + JSON.stringify(result));
          }

      }
    });


    if (Players.find().count() < 20){
      Players.remove({});
    this.fetchQuizFromBundle(b1);

    }
  });

}
