var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var createError = require('http-errors');
var mongoose = require('mongoose');
var expressSession = require('express-session');
var async = require('async');
var logger = require('morgan');
const bodyParser = require('body-parser');
let formidable = require('formidable');
let fs = require('fs');
const { exec } = require('child_process');
const fileUpload = require('express-fileupload');
const jsftp = require("jsftp");
var ftpClient = require("ftp");

require('./requests.js');

var User = mongoose.model('User'); // the users collection in this project is equivalent to a hkwl collection
var Newsochub = mongoose.model('Newsochub');
var Podcast = mongoose.model('Podcast');
var iThink = mongoose.model('iThink');
var crv = mongoose.model('CRV');

var app = express();

const newConnection = async () => {
    try {
        await mongoose.connect("mongodb+srv://ideait:bqyIXcjDIVQtyJwB@cluster0.nesnv4c.mongodb.net/logAnalyzer?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
        // if (mongoose.connection.readyState !== 1) {
        //     app = null;
        // }
    } catch (error) {
        // if (mongoose.connection.readyState !== 1) {
        //     app = null;
        // }
        console.error("Error with mongoose connection");
    }
};

newConnection();

module.exports.mongoose = mongoose;

module.exports.newDoc = mongoose.model('User');
module.exports.newsochub = mongoose.model('Newsochub');
module.exports.podcast = mongoose.model('Podcast');
module.exports.ithink = mongoose.model('iThink');
module.exports.crv = mongoose.model('CRV');

const connection = mongoose.connection;

module.exports.connected = mongoose.connection;

connection.once("open", function() {
    console.log(mongoose.connection.readyState)
    console.log("MongoDB database connection established successfully");
});

app.set('port', 3000);

var server = require('http').createServer(app);

server.listen(3000);

global.httpServer = server;


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressSession({
    secret: "p2ijwermfwpokqweqwem34182937nadtwercxqqelmlqwe"
}));
app.use(fileUpload({
   useTempFiles : true,
   tempFileDir : '/tmp/'
}));


app.get('/', function (req, res, next) {

  res.render('index.ejs', {uniquePaths: 0, uploadFinished: false, deleteFinished: false, hyperlink: "no link"});
})

app.post('/server-action', function (req, res, next) {
  
  var pathArray = [];
  var visitsArray = [];
  var ipArray = [];
  var ipCount = [];
  var allIp = [];

  var count = 0;
  var uniqueLength = 0;

  function isArrayInArray(arr, item){
    var item_as_string = JSON.stringify(item);

    var contains = arr.some(function(ele){
      return JSON.stringify(ele) === item_as_string;
    });
    return contains;
  }

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  function sortFirstColumn(a, b) {
       if (a[0] === b[0]) {
           return 0;
       }
       else {
           return (a[0] > b[0]) ? -1 : 1;
       }
   }

  function sortFourthColumn(a, b) {
       if (a[3] === b[3]) {
           return 0;
       }
       else {
           return (a[3] > b[3]) ? -1 : 1;
       }
   }


  function sortFifthColumn(a, b) {
       if (a[4] === b[4]) {
           return 0;
       }
       else {
           return (a[4] > b[4]) ? -1 : 1;
       }
   }


  var serverRequest = req.body.sendData; 
  var projectType = req.body.project;
  var logType = req.body.logType;
  var sortBy = req.body.sort;

  console.log(serverRequest);
  console.log(projectType);
  console.log(logType);
  console.log(sortBy);

  if (typeof serverRequest === "undefined") {


     let sampleFile = req.files.upload;

     console.log(sampleFile);

     var local = sampleFile.tempFilePath;
     console.log(local);

     fs.readFile(local, function(err, buffer) {
        if(err) {
            console.error(err);
            callback(err);
        }
        else {
           var c = new ftpClient();
           c.on('ready', function() {
             c.put(buffer, '/files/' + sampleFile.name, function(err) {
               if (err) {
                  throw err;
               } else {



               }
               c.end();

             });
           });

           c.on('end', function () {
               var text = fs.readFileSync('/home/user1/ftp/files/' + sampleFile.name,'utf8')
               
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
               var d = 1;
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
                 json[d] = tempjson;
                 d++
               }); // the original log file is converted to a json object
               
               console.log(json);
               
               var logLength = Object.keys(json).length;

               console.log(logLength);

               if (projectType === "hkwl") {

                  if (logType === "access") {

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



                           let newUser = new User ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "access"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });
                           



                      }

                        
                    }

                    asyncAnalyze();

                    


                     
                  } else if (logType === "error") {

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



                           let newUser = new User ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "error"
                             
                           })
                             
                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });
                             



                      }

                        
                    }

                    
                    asyncAnalyze();

                     
                  } else if (logType === "php") {

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



                           let newUser = new User ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "php"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });
                             



                      }

                        
                    }

                    
                    asyncAnalyze();


                  }


                  
               } else if (projectType === "newsochub") {

                  if (logType === "access") {

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



                           let newUser = new Newsochub ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "access"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });
                             



                      }

                        
                    }

                    
                    asyncAnalyze();


                     
                  } else if (logType === "error") {

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



                           let newUser = new Newsochub ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "error"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });
                             





                      }

                        
                    }

                    
                    asyncAnalyze();

                     
                  } else if (logType === "php") {

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



                           let newUser = new Newsochub ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "php"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });




                      }

                        
                    }

                    
                    asyncAnalyze();


                  }




               } else if (projectType === "podcast") {

                  if (logType === "access") {

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



                           let newUser = new Podcast ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "access"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });




                      }

                        
                    }

                    
                    asyncAnalyze();


                     
                  } else if (logType === "error") {

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



                           let newUser = new Podcast ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "error"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });




                      }

                        
                    }

                    
                    asyncAnalyze();

                     
                  } else if (logType === "php") {

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



                           let newUser = new Podcast ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "php"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });




                      }

                        
                    }

                    
                    asyncAnalyze();


                  }




               } else if (projectType === "ithink") {

                  if (logType === "access") {

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



                           let newUser = new iThink ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "access"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });




                      }

                        
                    }

                    
                    asyncAnalyze();


                     
                  } else if (logType === "error") {

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



                           let newUser = new iThink ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "error"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });




                      }

                        
                    }

                    
                    asyncAnalyze();

                     
                  } else if (logType === "php") {

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



                           let newUser = new iThink ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "php"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });




                      }

                        
                    }

                    
                    asyncAnalyze();


                  }




               } else if (projectType === "crv") {

                  if (logType === "access") {

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



                           let newUser = new crv ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "access"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });




                      }

                        
                    }

                    
                    asyncAnalyze();


                     
                  } else if (logType === "error") {

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



                           let newUser = new crv ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "error"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });




                      }

                        
                    }

                    
                    asyncAnalyze();

                     
                  } else if (logType === "php") {

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



                           let newUser = new crv ({
                             request_type: req_type2,
                             request_time: time5,
                             date: time7,
                             request_path: path,
                             request_ip_address: ip,
                             response_code: res_code,
                             appserver_code: server_code,
                             log_type: "php"
                             
                           })

                             await newUser.save().then(savedDoc => {
                               if (i === logLength) {
                                 console.log("done");
                                 exec('/deleteLog.sh', function(err3, stdout, stderr) {
                                          
                                          if (err3) {
                                             console.log(err3);
                                          }
                                          if (stderr) {
                                             console.log(stderr);
                                          }
                                          if (stdout) {
                                             //var finished = true;


                                          }
                                      })
                                  res.render('index.ejs', {uploadFinished: true, uniquePaths: 0, deleteFinished: false});


                                 
                               }



                             });




                      }

                        
                    }

                    
                    asyncAnalyze();
                  }


               }
               

           })

           c.on('close', function () {

           })
           

           c.connect({host: "159.65.160.252", port: 21, user: "user1", password: "bqyIXcjDIVQtyJwB", debug: console.log});



        }

    });






     // Use the mv() method to place the file somewhere on your server
     //sampleFile.mv('', function(err) {
     //  if (err)
     //    return res.status(500).send(err);

     //  res.send('File uploaded!');
     //  console.log("uploaded");
     //});

     console.log("made it here");


  } else if (serverRequest === "Generate Report") {

    if (projectType === "hkwl") {

      if (logType === "access") {

        User.find({log_type: "access"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await User.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "access"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);
                        
                        pathArray[i][0] = decodeURI(pathArray[i][0]);


                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "hkwl"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      } else if (logType === "error") {

        User.find({log_type: "error"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await User.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "error"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);

                        pathArray[i][0] = decodeURI(pathArray[i][0]);



                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "hkwl"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      } else if (logType === "php") {

        User.find({log_type: "php"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await User.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "php"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);

                        pathArray[i][0] = decodeURI(pathArray[i][0]);



                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "hkwl"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      }


    } else if (projectType === "newsochub") {

      if (logType === "access") {

        Newsochub.find({log_type: "access"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await Newsochub.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "access"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);


                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "newsochub"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      } else if (logType === "error") {

        Newsochub.find({log_type: "error"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await Newsochub.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "error"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);


                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "newsochub"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      } else if (logType === "php") {

        Newsochub.find({log_type: "php"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await Newsochub.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "php"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);


                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "newsochub"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      }




    } else if (projectType === "podcast") {

      if (logType === "access") {

        Podcast.find({log_type: "access"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await Podcast.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "access"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);


                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "podcast"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      } else if (logType === "error") {

        Podcast.find({log_type: "error"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await Podcast.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "error"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);


                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "podcast"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      } else if (logType === "php") {

        Podcast.find({log_type: "php"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await Podcast.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "php"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);


                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "podcast"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      }


    } else if (projectType === "ithink") {

      if (logType === "access") {

        iThink.find({log_type: "access"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await iThink.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "access"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);


                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "ithink"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      } else if (logType === "error") {

        iThink.find({log_type: "error"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await iThink.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "error"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);


                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "ithink"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      } else if (logType === "php") {

        iThink.find({log_type: "php"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await iThink.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "php"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);


                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "ithink"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      }


    } else if (projectType === "crv") {

      if (logType === "access") {

        crv.find({log_type: "access"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await crv.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "access"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);


                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "crv"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      } else if (logType === "error") {

        crv.find({log_type: "error"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await crv.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "error"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);


                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "crv"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      } else if (logType === "php") {

        crv.find({log_type: "php"}, function (err, docs) {
          if (err) {
            return next(err);
          }

          docs.forEach(function (doc) {
            let tempArray = [doc.toObject().request_path, doc.toObject().request_type, doc.toObject().response_code];

            if (ipArray.includes(doc.toObject().request_ip_address)) {
              // do nothing
            } else {
              ipArray.push(doc.toObject().request_ip_address);
              
            }




            if (isArrayInArray(pathArray, tempArray)) {
              //do nothing
            } else {
              pathArray.push(tempArray);
            }

          })

          console.log(pathArray.length);

          const startLoop = async ()=> {
            

            for (const pathway of pathArray) {

                await crv.find({request_path: pathway[0], request_type: pathway[1], response_code: pathway[2], log_type: "php"}, function(err, docs) {
                  visitsArray.push(docs.length);
                  //console.log(visitsArray)
                  let tempCount = 0;
                  var tempArray2 = [];


                  docs.forEach(function (checkIp) {

                    tempCount++;

                    tempArray2.push(checkIp.toObject().request_ip_address)

                    if (tempCount === docs.length) {
                      var unique = tempArray2.filter(onlyUnique);
                      //console.log(unique.length === tempArray2.length);
                      uniqueLength = unique.length;
                      ipCount.push(uniqueLength);

                    }
                  })

                  count++;

                  if (count === pathArray.length) {

                     for (var i=0; i<pathArray.length; i++) {

                        pathArray[i].push(visitsArray[i]);
                        pathArray[i].push(ipCount[i]);


                     }

                     if (sortBy === "hit") {

                        pathArray.sort(sortFourthColumn);
                        

                     } else if (sortBy === "ipHit") {
                        
                        pathArray.sort(sortFifthColumn);

                     } else if (sortBy === "pathSort") {

                        pathArray.sort(sortFirstColumn);

                     }

                    //console.log(ipCount)
                    //console.log(visitsArray)

                    res.render('index.ejs', {path: pathArray, hitCount: visitsArray, ip: ipCount, uniquePaths: pathArray.length, uploadFinished: false, deleteFinished: false, hyperlink: "crv"});


                  }
                   
                }).clone()



            }


          }

          startLoop();




        })


      }


    }

  } else if (serverRequest === "Clear log data") {

    if (projectType === "hkwl") {

      if (logType === "access") {


         User.deleteMany({log_type: "access"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })



      } else if (logType === "error") {

         User.deleteMany({log_type: "error"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })


      } else if (logType === "php") {

         User.deleteMany({log_type: "php"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })


      }


    } else if (projectType === "newsochub") {

      if (logType === "access") {


         Newsochub.deleteMany({log_type: "access"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })



      } else if (logType === "error") {


         Newsochub.deleteMany({log_type: "error"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })


      } else if (logType === "php") {

         Newsochub.deleteMany({log_type: "php"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })


      }




    } else if (projectType === "podcast") {

      if (logType === "access") {


         Podcast.deleteMany({log_type: "access"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })



      } else if (logType === "error") {

         Podcast.deleteMany({log_type: "error"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })


      } else if (logType === "php") {

         Podcast.deleteMany({log_type: "php"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })


      }


    } else if (projectType === "ithink") {

      if (logType === "access") {


         iThink.deleteMany({log_type: "access"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })



      } else if (logType === "error") {

         iThink.deleteMany({log_type: "error"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })


      } else if (logType === "php") {

         iThink.deleteMany({log_type: "php"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })


      }


    } else if (projectType === "crv") {

      if (logType === "access") {


         crv.deleteMany({log_type: "access"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })



      } else if (logType === "error") {

         crv.deleteMany({log_type: "error"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })


      } else if (logType === "php") {

         crv.deleteMany({log_type: "php"}, function (err, success) {
           res.render('index.ejs', {uploadFinished: false, uniquePaths: 0, deleteFinished: true});



         })


      }


    }
     

  } 








  

})





