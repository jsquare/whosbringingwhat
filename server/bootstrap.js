// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
  if (Lists.find().count() === 0) {
    var data = [
      {
        name: "List 1",
        contents: [
          ["Tent", "Jaime", "Jason"],
          ["Quadcopter", "Aaron"],
          ["Casserole"],
        ]
      }
    ];

    var timestamp = (new Date()).getTime();
    for (var i = 0; i < data.length; i++) {
      var list = Lists.insert({name: data[i].name});
      for (var j = 0; j < data[i].contents.length; j++) {
        var info = data[i].contents[j];
        Items.insert({list_id: list,
                      timestamp: timestamp,
                      name: info[0],
                      claimers: info.slice(1)});
        timestamp += 1; // ensure unique timestamp.
      }
    }
  }
});
