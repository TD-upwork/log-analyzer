var conn3 = require('./app.js');

conn3.newDoc.aggregate([{
  $group: {"_id": '$request_path', "count": {"$sum": 1}}
},
  {
    $match: {"count": {"$gte": 40}}
  }], function(err, results) {

      console.log(results);

    }

)

