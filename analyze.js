const fs = require('fs');

var conn = require('./app.js');
//var mongoose = require('mongoose');
//require('./requests.js');

//var User = mongoose.model('User');


if (process.argv.length === 2) {
  console.error("You need to use 3 arguments! (1.log file name 2.project type, in lower case 3.log type, in lower case)");
  process.exit(1);
} else if (process.argv.length > 5){
  console.error("Only use 3 argument! (1.log file name 2.project type, in lower case 3.log type, in lower case)")
  process.exit(1);
} else if (process.argv.length === 5) {

  const checkConnection = conn.connected;

  
  checkConnection.once("open", function() {
      console.log(conn.connected.readyState)
      console.log("MongoDB database connection established successfully");
      var text = fs.readFileSync('/home/user1/ftp/files/' + process.argv[2],'utf8')
      
      // /Applications/www.hkwl.org.access.log-20230115-web01.log 
      
      array = text.split("\n")
      var dataArray = [];
      for(var i=0; i<array.length; i++){
        if(array[i] == ''){continue}
        let tempArray = []
        tempArray = array[i].split(",");
        dataArray.push(tempArray)
      };

      json = {};
      var c = 1;
      dataArray.forEach( (e1) =>{
        isdate = true;
        var tempjson = {};
        e1.forEach( (e2) =>{
          var key;
          if(isdate )  {
              key = 'data';
              tempjson[key] = e2;
              isdate = false;
          }
          else if(e2.includes("batteryCurrent")){
              key = "batteryCurrent";
              tempjson[key]= e2.split("batteryCurrent=")[1]
          }
          else{
              var arr = e2.split("=");
              key  = arr[0].trim();
              tempjson[key] = arr[1];
          }
        })
        json[c] = tempjson;
        c++
      }); // the original log file is converted to a json object
      
      console.log(json);
      
      var logLength = Object.keys(json).length;

      console.log(logLength);

      if (process.argv[3] === "hkwl") {

         if (process.argv[4] === "access") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.newDoc ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "access"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                     process.exit();
                   }


             }

               
           }

           
           asyncAnalyze();


            
         } else if (process.argv[4] === "error") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.newDoc ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "error"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();

            
         } else if (process.argv[4] === "php") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.newDoc ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "php"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();


         }


         
      } else if (process.argv[3] === "newsochub") {

         if (process.argv[4] === "access") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.newsochub ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "access"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();


            
         } else if (process.argv[4] === "error") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.newsochub ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "error"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();

            
         } else if (process.argv[4] === "php") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.newsochub ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "php"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();


         }




      } else if (process.argv[3] === "podcast") {

         if (process.argv[4] === "access") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.podcast ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "access"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();


            
         } else if (process.argv[4] === "error") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.podcast ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "error"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();

            
         } else if (process.argv[4] === "php") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.podcast ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "php"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();


         }




      } else if (process.argv[3] === "ithink") {

         if (process.argv[4] === "access") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.ithink ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "access"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();


            
         } else if (process.argv[4] === "error") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.ithink ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "error"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();

            
         } else if (process.argv[4] === "php") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.ithink ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "php"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();


         }




      } else if (process.argv[3] === "crv") {

         if (process.argv[4] === "access") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.crv ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "access"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();


            
         } else if (process.argv[4] === "error") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.crv ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "error"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();

            
         } else if (process.argv[4] === "php") {

            const asyncAnalyze = async ()=> {

               for (var i=1; i<logLength+1; i++) {
                //iterate through the newly created json object
                   var parts = json[i].data.split(" ");
                   var ip = parts[0]; // should give ip address

                   var time = parts[3] + parts[4];
                   var time2 = time.split('[');
                   var time3 = time2[1];
                   var time4 = time3.split(']');
                   var time5 = time4[0]; // should give the time
                   var time6 = time5.split(':');
                   var time7 = time6[0]; // simplified time
                   var req_type = parts[5].split('"');
                   var req_type2 = req_type[1]; //should give request type
                   var path = parts[6]; // should give path
                   var res_code = parts[8]; // should give response code
                   var server_code = parts[10]; //should give app server code



                  let newUser = new conn.crv ({
                    request_type: req_type2,
                    request_time: time5,
                    date: time7,
                    request_path: path,
                    request_ip_address: ip,
                    response_code: res_code,
                    appserver_code: server_code,
                    log_type: "php"
                    
                  })

                    await newUser.save();
                  

                   if (i === logLength) {
                     console.log("done");
                   }


             }

               
           }

           
           asyncAnalyze();
         }


      }









      //conn.newDoc.aggregate([{
      //  $group: {"_id": '$request_ip_address', "count": {"$sum": 1}}
      //},
      //  {
      //    $match: {"count": {"$gte": 2}}
      //  }], function(err, results) {

      //    async function aggregate() {
      //      for (var i=0; i<results.length-1; i++) {
      //        await conn2.newDoc.findOne({request_ip_address: results[i]._id}).then(
      //          function(user) { // no need to pass err as request because there would not be an error if code has passed to this->
      //            user.ip_occurence = results[i].count; // -> stage
      //            user.save();


      //          }
      //        )

      //      }
      //    }

      //    aggregate();
      //})

        
  }); 
  


} else {
  console.error("Something went wrong!");
  process.exit(1);
}


