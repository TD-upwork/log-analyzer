

if (process.argv.length === 5) {

  var conn4 = require('./app.js');

  
  const checkConnection = conn4.connected;

  checkConnection.once("open", function() {

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }


    if (process.argv[2] === "hkwl") {

       if (process.argv[3] === "access") {

          var array = [];

          conn4.newDoc.find({request_path: process.argv[4], log_type: "access"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })

          
       } else if (process.argv[3] === "error") {

          var array = [];

          conn4.newDoc.find({request_path: process.argv[4], log_type: "error"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })


       } else if (process.argv[3] === "php") {

          var array = [];

          conn4.newDoc.find({request_path: process.argv[4], log_type: "php"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })


       }

    } else if (process.argv[2] === "newsochub") {

       if (process.argv[3] === "access") {

          var array = [];

          conn4.newsochub.find({request_path: process.argv[4], log_type: "access"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })

          
       } else if (process.argv[3] === "error") {

          var array = [];

          conn4.newsochub.find({request_path: process.argv[4], log_type: "error"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })


       } else if (process.argv[3] === "php") {

          var array = [];

          conn4.newsochub.find({request_path: process.argv[4], log_type: "php"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })


       }


    } else if (process.argv[2] === "podcast") {

       if (process.argv[3] === "access") {

          var array = [];

          conn4.podcast.find({request_path: process.argv[4], log_type: "access"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })

          
       } else if (process.argv[3] === "error") {

          var array = [];

          conn4.podcast.find({request_path: process.argv[4], log_type: "error"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })


       } else if (process.argv[3] === "php") {

          var array = [];

          conn4.podcast.find({request_path: process.argv[4], log_type: "php"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })


       }


    } else if (process.argv[2] === "ithink") {

       if (process.argv[3] === "access") {

          var array = [];

          conn4.ithink.find({request_path: process.argv[4], log_type: "access"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })

          
       } else if (process.argv[3] === "error") {

          var array = [];

          conn4.ithink.find({request_path: process.argv[4], log_type: "error"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })


       } else if (process.argv[3] === "php") {

          var array = [];

          conn4.ithink.find({request_path: process.argv[4], log_type: "php"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })


       }

    } else if (process.argv[2] === "crv") {

       if (process.argv[3] === "access") {

          var array = [];

          conn4.crv.find({request_path: process.argv[4], log_type: "access"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })

          
       } else if (process.argv[3] === "error") {

          var array = [];

          conn4.crv.find({request_path: process.argv[4], log_type: "error"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })


       } else if (process.argv[3] === "php") {

          var array = [];

          conn4.crv.find({request_path: process.argv[4], log_type: "php"}, function(err, docs) {

            docs.forEach(function (ip) {
              array.push(ip.toObject().request_ip_address);
            })

            var unique = array.filter(onlyUnique);

            function printElements(ips) {
              ips.forEach(function (ip_print) {
                console.log(ip_print);
              })
              
            }

            printElements(unique);
            console.log(unique.length);

          })


       }

    }


        
  })








} else if (process.argv.length != 5){
  console.log('Your command should have 5 components, for example: node checkip.js hkwl access /robots.txt');
}
