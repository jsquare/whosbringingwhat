// Lists -- {name: String}
Lists = new Meteor.Collection("lists");

// Items -- {name: String,
//           claimers: [String, ...],
//           list_id: String,
//           timestamp: Number}
Items = new Meteor.Collection("items");
