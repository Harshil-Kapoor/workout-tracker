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
var response;

//write the middleware...
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//define callback for /webhook endpoint...
app.post('/webhook', webhook);

// the webhook...
function webhook(req, res, next) {

    var action = req.body.result.action;
    uIdentity = req.body.result.parameters.uIdentity;

    //redirect to appropriate callbacks acc. to the request action...
    if (action == 'record')             record(req, res);
    else if (action == 'show_status')   show_status(req, res);
    else if (action == 'set_target')   set_target(req, res);
    // else if (action == 'get_target')   get_target(req, res);
    // else

    next();
};

//the callback for connecting to mongoDB, will be called by any of the callbacks...
function connect(operation, data, callback) {
    
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

            //switch to perform mongoDB operations, according to request 'operation' field...
            switch (operation) {

                //mongoDB logic for document insertion...
                case 'insert' :
                    collection.insertOne(data, function (err, result) {
                        if (err) {
                            console.log('______insertion error______');
                            console.log(err);

                            // return undefined
                            //call the fulfillmentGen callback to prepare fulfillment and return response...
                            if(typeof callback === 'function')  callback(err, operation, undefined, response);
                        } else {
                            console.log('Inserted a document into "workout" collection.');

                            // return result.insertedId;
                            //call the fulfillmentGen callback to prepare fulfillment and return response...
                            if(typeof callback === 'function')  callback(undefined, operation, result, response);
                        }
                        db.close();
                    });

                //mongoDB logic for document retrieval...
                case 'retrieve' :
//                     var result = collection.findOne({uIdentity : data.uIdentity});
//
                    collection.findOne({uIdentity : data.uIdentity}, function (err, result) {
                        if (err) {
                            console.log('______retrieval error______');
                            console.log(err);

                            // result = undefined;
                            //call the fulfillmentGen callback to prepare fulfillment and return response...
                            if(typeof callback === 'function')  callback(err, operation, undefined, response);
                        } else {
                            console.log('Retrieved document '+ result._id +' from "workout" collection.');

                            // return result;
                            //call the fulfillmentGen callback to prepare fulfillment and return response...
                            if(typeof callback === 'function')  callback(undefined, operation, result, response);
                        }
                        db.close();
                    });

                //mongoDB logic for updating document...
                case 'update' :
                    collection.findAndModify(
                        {uIdentity : data.uIdentity},
                        {$set: data},
                        function (err, object) {
                            if (err){
                                console.log('______retrieval error______');
                                console.log(err);

                                //call the fulfillmentGen callback to prepare fulfillment and return response...
                                if(typeof callback === 'function')  callback(err, operation, undefined, response);
                            }else{
                                console.log("Successfully updated document...");

                                //call the fulfillmentGen callback to prepare fulfillment and return response...
                                if(typeof callback === 'function')  callback(undefined, operation, object, response);
                            }
                        db.close();

                        return true;
                    });
            }
        }
    });
}

//response generation callback...
function fulfillmentGen(err, operation, result, response) {

    //check if error is generated, or we have the response...
    if(err == undefined){
        //format error response...

    }else{
        //format fulfillment response according to the 'operation' field in the function scope (closure)...
        switch (operation){
            case 'insert':

                break;
            case 'retrieve':

                break;
            case 'update':

                break;
        }

    }
}

// set workout target as provided by the user...
function set_target(req, res, next) {
    runTarget = req.body.result.parameters.run;
    unitTarget = req.body.result.parameters.unit;
    pullupsTarget = req.body.result.parameters.pullups;
    pushupsTarget = req.body.result.parameters.pushups;
    date = req.body.result.parameters.date;
    dateTarget = req.body.result.parameters.dateTarget;
    
    var target = {uIdentity: uIdentity, runTarget: runTarget, unitTarget: unitTarget, pullupsTarget: pullupsTarget, pushupsTarget: pushupsTarget, dateTarget: dateTarget};

    response =res;

    //call connect() with appropriate arguements...
    // var DBResult = connect('insert', target);
    connect('insert', target, fulfillmentGen);

    // if(DBResult == undefined)  console.log('----------Error in either MongoDB connection, or operations----------');
    // else                       console.log(DBResult + ' @set_target');
}

// get workout target as provided by the user...
function show_status(req, res, next) {
    var target = {uIdentity: uIdentity};

    response =res;

    //call connect() with appropriate arguements...
    // var DBResult = connect('retrieve', target);
    connect('retrieve', target, fulfillmentGen);

    // if(DBResult == undefined)  console.log('----------Error in either MongoDB connection, or operations----------');
    // else                       console.log(DBResult + ' @show_status');
}

function record(req, res) {
    ran = req.body.result.parameters.ran;
    unit = req.body.result.parameters.unit;
    pullups = req.body.result.parameters.pullups;
    pushups = req.body.result.parameters.pushups;
    date = req.body.result.parameters.date;

    var targetKeys=[];
    if(ran !='')        targetKeys.push('ran');
    if(unit !='')       targetKeys.push('unit');
    if(pullups !='')    targetKeys.push('pullups');
    if(pushups !='')    targetKeys.push('pushups');

    var target={};
    for(key in targetKeys){
        var property = targetKeys[key];
        target[property] = eval(property);
    }

    response =res;

    //call connect() with appropriate arguements...
    // var DBResult = connect('update', target);
    connect('update', target, fulfillmentGen);

    // if(DBResult == undefined)  console.log('----------Error in either MongoDB connection, or operations----------');
    // else                       console.log(DBResult + ' @record');
}