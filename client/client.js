// Client-side JavaScript, bundled and sent to client.

// Define Minimongo collections to match server/publish.js.
Lists = new Meteor.Collection("lists");
Items = new Meteor.Collection("items");

// ID of currently selected list
Session.setDefault('list_id', null);

// Subscribe to 'lists' collection on startup.
// Select a list once data has arrived.
var listsHandle = Meteor.subscribe('lists', function () {
  if (!Session.get('list_id')) {
    var list = Lists.findOne({}, {sort: {name: 1}});
    if (list) {
      Router.setList(list._id);
    }
  }
});

var itemsHandle = null;
// Always be subscribed to the items for the selected list.
Deps.autorun(function () {
  var list_id = Session.get('list_id');
  if (list_id)
    itemsHandle = Meteor.subscribe('items', list_id);
  else
    itemsHandle = null;
});


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

// No code here yet

////////// Items //////////

Template.item_row.events({
  'click .delete': function () {
    Items.remove(this._id);
  }
//okCancelEvents(
//  '#new-item',
//  {
//    ok: function (text, evt) {
//      Items.insert({
//        text: text,
//        list_id: Session.get('list_id'),
//        timestamp: (new Date()).getTime(),
//        claimers: []
//      });
//      evt.target.value = '';
//    }
//  }
//)
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
  // Determine which items to display in main pane,
  // selected based on list_id.

  var list_id = Session.get('list_id');
  if (!list_id)
    return; // TODO: pull request

  var sel = {list_id: list_id};

  return Items.find(sel, {sort: {timestamp: 1}});
};

////////// Tracking selected list in URL //////////

var WhosBringingWhatRouter = Backbone.Router.extend({
  routes: {
    ":list_id": "main"
  },
  main: function (list_id) {
    var oldList = Session.get("list_id");
    if (oldList !== list_id) {
      Session.set("list_id", list_id);
    }
  },
  setList: function (list_id) {
    this.navigate(list_id, true);
  }
});

Router = new WhosBringingWhatRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});
