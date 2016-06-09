/**
 * Created by Harshil on 6/6/2016.
 */

//require the required modules...
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');

//initialize the MongoClient, and specify the connection url...
var MongoClient = mongodb.MongoClient;

var url = 'mongodb://Harshil:abcd1234@ds011024.mlab.com:11024/workout-tracker';

//initialize the express app...
var app = express();

//declare the commom variables...
var  uIdentity;
var runTarget, unitTarget, pullupsTarget, pushupsTarget, dateTarget;
var ran, unit, pullups, pushups, date;

//write the middleware...
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//define callback for /webhook endpoint...
app.post('/webhook', webhook);

// the webhook...
var webhook = function(req, res, next) {

    var action = req.body.result.action;
    uIdentity = req.body.result.parameters.uIdentity;

    //redirect to appropriate callbacks acc. to the request action...
    if (action == 'record')             record(req, res);
    else if (action == 'show_status')   show_status(req, res);
    else if (action == 'set_target')   set_target(req, res);
    else if (action == 'get_target')   get_target(req, res);
    // else

    next();
};

//the callback for connecting to mongoDB, will be called by any of the callbacks...
var connect = function (operation, data) {
    
    MongoClient.connect(url, function (err, db) {
        if (err){
            console.log("Error connecting to database : ",err);

            return true;
        }else{
            console.log("Successfully connected to database...");

            var collection = db.collection('workout');

            // var user1 = {name: 'modulus admin', age: 42, roles: ['admin', 'moderator', 'user']};
            // var user2 = {name: 'modulus user', age: 22, roles: ['user']};
            // var user3 = {name: 'modulus super admin', age: 92, roles: ['super-admin', 'admin', 'moderator', 'user']};

            switch (operation) {
                case 'insert' :
                    collection.insertOne(data, function (err, result) {
                        if (err) {
                            console.log('______insertion error______');
                            console.log(err);
                        } else {
                            console.log('Inserted a document into "workour" collection.');
//                            return result.length;
                        }
                        db.close();

                        return true;
                    });
                case 'retrieve' :
                    var cursor = collection.find({uIdentity : data.uIdentity});
//
                    collection.find(data, function (err, result) {
                        if (err) {
                            console.log('______retrieval error______');
                            console.log(err);
                        } else {
                            console.log('Inserted %d documents into "users" collection. The documents inserted with "_id" are:', result.length, result);
                        }
                        db.close();

                        return true;
                    });
                case 'update' :
                    collection.updateOne({uIdentity : data.uIdentity}, {$set: data}, function (err, numUpdated) {
                        if (err){
                            console.log('______retrieval error______');
                            console.log(err);
                        }else if(numUpdated){
                            console.log("Updated successfullt %d documents...", numUpdated);
                        }else{
                            console.log('No documents found with "find" criteria...');
                        }
                        db.close();

                        return true;
                    });
            }
        }
    });
};

// set workout target as provided by the user...
var set_target = function(req, res, next) {
    runTarget = req.body.result.parameters.run;
    unitTarget = req.body.result.parameters.unit;
    pullupsTarget = req.body.result.parameters.pullups;
    pushupsTarget = req.body.result.parameters.pushups;
    date = req.body.result.parameters.date;
    dateTarget = req.body.result.parameters.dateTarget;
    
    var target = {uIdentity: uIdentity, runTarget: runTarget, unitTarget: unitTarget, pullupsTarget: pullupsTarget, pushupsTarget: pushupsTarget, dateTarget: dateTarget};

    // MongoClient.connect()
    if(!connect('insert', target))  console.log('----------Error in either MongoDB connection, or operations----------');
};

// get workout target as provided by the user...
var get_target = function(req, res, next) {
    var target = {uIdentity: uIdentity};

    if(!connect('retrieve', target))  console.log('----------Error in either MongoDB connection, or operations----------');
};

var record = function (req, res) {
    ran = req.body.result.parameters.ran;
    unit = req.body.result.parameters.unit;
    pullups = req.body.result.parameters.pullups;
    pushups = req.body.result.parameters.pushups;
    date = req.body.result.parameters.date;

    // if(ran == '')

}
// catch 404 and forward to error handler
var show_status = function(req, res, next) {

};