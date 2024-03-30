var mongoose = require('mongoose');

var UserSchema = mongoose.model( "User", new mongoose.Schema({
    request_type: {type: String},
    request_time: {type: String},
    date: {type: String},
    request_path: {type: String},
    request_ip_address: {type: String},
    response_code: {type: String},
    ip_occurence: {type: Number, default: 1},
    appserver_code: {type: String},
    log_type: {type: String}

}))

var newsochubSchema = mongoose.model( "Newsochub", new mongoose.Schema({
    request_type: {type: String},
    request_time: {type: String},
    date: {type: String},
    request_path: {type: String},
    request_ip_address: {type: String},
    response_code: {type: String},
    ip_occurence: {type: Number, default: 1},
    appserver_code: {type: String},
    log_type: {type: String}

}))

var podcastSchema = mongoose.model( "Podcast", new mongoose.Schema({
    request_type: {type: String},
    request_time: {type: String},
    date: {type: String},
    request_path: {type: String},
    request_ip_address: {type: String},
    response_code: {type: String},
    ip_occurence: {type: Number, default: 1},
    appserver_code: {type: String},
    log_type: {type: String}

}))

var ithinkSchema= mongoose.model( "iThink", new mongoose.Schema({
    request_type: {type: String},
    request_time: {type: String},
    date: {type: String},
    request_path: {type: String},
    request_ip_address: {type: String},
    response_code: {type: String},
    ip_occurence: {type: Number, default: 1},
    appserver_code: {type: String},
    log_type: {type: String}

}))

var crvSchema = mongoose.model( "CRV", new mongoose.Schema({
    request_type: {type: String},
    request_time: {type: String},
    date: {type: String},
    request_path: {type: String},
    request_ip_address: {type: String},
    response_code: {type: String},
    ip_occurence: {type: Number, default: 1},
    appserver_code: {type: String},
    log_type: {type: String}

}))






