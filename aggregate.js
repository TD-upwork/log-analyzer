var conn2 = require('./app.js');

conn2.newDoc.aggregate([{
  $group: {"_id": '$request_ip_address', "count": {"$sum": 1}}
},
  {
    $match: {"count": {"$gte": 2}}
  }], function(err, results) {

    async function aggregate() {
      for (var i=0; i<=results.length-1; i++) {
        if (i === results.length-1) {
          console.log("done");
        }
        await conn2.newDoc.findOne({request_ip_address: results[i]._id}).then(
          function(user) { // no need to pass err as request because there would not be an error if code has passed to this->
            user.ip_occurence = results[i].count; // -> stage
            user.save();


          }
        )

      }
    }

    aggregate();
})




