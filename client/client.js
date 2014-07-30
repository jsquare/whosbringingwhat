// Client-side JavaScript, bundled and sent to client.

// Define Minimongo collections to match server/publish.js.
Lists = new Meteor.Collection("lists");
Items = new Meteor.Collection("items");
Users = new Meteor.Collection("users");

Meteor.subscribe('lists');
Meteor.subscribe('users');

// ID of currently selected list
Session.setDefault('list_id', null);

Session.setDefault('user_name', null);

var currentUser = function () {
  return Users.findOne(Session.get('user_id'));
}


////////// Helpers for in-place editing //////////

// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".

var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };

  return events;
};

var activateInput = function (input) {
  input.focus();
  input.select();
};

////////// Lists //////////

Template.landing.events({
  'click #create-event': function () {
    console.log('here I am');
    var new_list_id = Lists.insert({
      name: 'My List'
    });
    Router.go('event', {_id: new_list_id});
  }
});

////////// Items //////////

Template.item_row.events({
  'click .delete': function () {
    if(this.claimers.length){
      var confirm_message = "This item has been claimed. Are you sure you want to delete it?";
      if(!confirm(confirm_message))
        return;
    }
    Items.remove(this._id);
  },
  'click .claim-box.unclaimed': function () {
    if(!currentUser()){
      alert("You'll have to enter your name before you can claim items.")
    } else {
      Items.update(this._id,
        {$set: {
          claimers: this.claimers.concat([currentUser()])
        }}
      )
    }
  },
  'click .claim-box.current-user-color': function (event, template) {
    // Remove this claimer from the item's claimer list
    var item_id = template.data._id;
    var item = Items.findOne(item_id);
    var this_index = $.inArray(this._id, item.claimers);
    item.claimers.splice(this_index, 1);
    Items.update(item_id,
      {$set: {
        claimers: item.claimers
      }}
    )
  }
});

Template.item_row.events(okCancelEvents(
  '#item-name-input',
  {
    ok: function(text, evt){
      Items.update(this._id,
        {$set: {
          name: text
        }}
      )
      evt.target.blur();
    },
    cancel: function(evt){
      evt.target.value = this.name;
      evt.target.blur();
    }
  }
));

Template.item_row.helpers({
  is_this_user: function () {
    if(!currentUser())
      return false
    return this._id == currentUser()._id;
  },
  user_name: function () {
    if(this._id){
      return Users.findOne(this._id).name;
    }
  }
});

Template.items_container.events(okCancelEvents(
  '#new-item',
  {
    ok: function(text, evt){
      Items.insert({
        name: text,
        claimers: [],
        timestamp: (new Date()).getTime(),
        list_id: Session.get('list_id')
      })
      evt.target.value = ''
    }
  }
));

Template.items_container.items = function () {
  var sel = {list_id: this._id};
  return Items.find(sel, {sort: {timestamp: 1}});
};

////////// User handling //////////
Template.user_summary.user_name = function() {
  if(currentUser()){
    return currentUser().name
  }
}

Template.user_summary.events(okCancelEvents(
  '#user-name',
  {
    ok: function(text, evt){
      var text_changed=null;
      if(text){
        if(!currentUser()) {
          // User will have to be created
          Session.set(
            'user_id',
            Users.insert({
              name: text
            })
          )
        } else if (text != currentUser().name) {
          // User exists, but needs a rename
          Users.update(
            Session.get('user_id'),
            {$set: {name: text}}
          )
        }
      }
      if(currentUser()) {
        evt.target.value = currentUser().name
      }
      evt.target.blur();
    },
    cancel: function(evt){
      evt.target.value = currentUser().name;
      evt.target.blur();
    }
  }
));

////////// Tracking selected list in URL //////////

Meteor.startup(function () {
});

Router.map(function() {
  this.route('event', {
    path: '/event/:_id',
    data:
      function() {
        Session.set('list_id', this.params._id)
        Meteor.subscribe('items', this.params._id);
        return Lists.findOne(this.params._id);
      }
  });
  this.route('landing', {
    path: '/'
  });
});
