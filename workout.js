/**
 * Created by Harshil on 6/6/2016.
 */

//require the required modules...
var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');

//initialize the MongoClient, and specify the connection url...
var MongoClient = mongodb.MongoClient;

var url = 'mongodb://Harshil:abcd1234@ds011024.mlab.com:11024/workout-tracker';

//initialize the express app...
var app = express();


var port = process.env.PORT;
app.set('port', port);

var server = http.createServer(app);

server.listen(port);


//declare the commom variables...
var  uIdentity;
var runTarget, unitTarget, pullupsTarget, pushupsTarget, dateTarget;
var ran, unit, pullups, pushups, date;
var response;
var reqRan, reqPullups, reqPushups;

//write the middleware...
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//define callback for /webhook endpoint...
app.post('/webhook', backWebhook);

// the webhook...
function backWebhook(req, res, next) {

    console.log(JSON.stringify(req.body));

    var action = req.body.result.action;
    uIdentity = req.body.result.parameters.uIdentity;

    //redirect to appropriate callbacks acc. to the request action...
    if (action == 'record')             record(req, res, next);
    else if (action == 'show_status')   show_status(req, res, next);
    else if (action == 'set_target')   set_target(req, res, next);
    // else if (action == 'get_target')   get_target(req, res);
    // else

    next();
};

//the callback for connecting to mongoDB, will be called by any of the callbacks...
function connect(operation, data, callback, extraInfo, next) {
    
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
                            if(typeof callback === 'function')  callback(err, operation, undefined, response, extraInfo, next);
                        } else {
                            console.log('Inserted a document into "workout" collection.');

                            // return result.insertedId;
                            //call the fulfillmentGen callback to prepare fulfillment and return response...
                            if(typeof callback === 'function')  callback(undefined, operation, result, response, extraInfo, next);
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
                            //or the recordUpdate callback...
                            if(typeof callback === 'function')  callback(err, operation, undefined, response, extraInfo, next);
                        } else {
                            console.log('Retrieved document '+ result._id +' from "workout" collection.');

                            // return result;
                            //call the fulfillmentGen callback to prepare fulfillment and return response...
                            //or the recordUpdate callback...
                            if(typeof callback === 'function')  callback(undefined, operation, result, response, extraInfo, next);
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
                                if(typeof callback === 'function')  callback(err, operation, undefined, response, extraInfo, next);
                            }else{
                                console.log("Successfully updated document...");

                                //call the fulfillmentGen callback to prepare fulfillment and return response...
                                if(typeof callback === 'function')  callback(undefined, operation, object, response, extraInfo, next);
                            }
                        db.close();
                        //
                        // return true;
                    });
            }
        }
    });

    next();
}

// //targetCreator for creating json target...
// function targetCreator(ran, unit, pushups, pullups) {
//
//     var targetKeys=[];
//     if(ran !='')        targetKeys.push('ran');
//     if(unit !='')       targetKeys.push('unit');
//     if(pullups !='')    targetKeys.push('pullups');
//     if(pushups !='')    targetKeys.push('pushups');
//
//     var target={};
//     for(key in targetKeys){
//         var property = targetKeys[key];
//         target[property] = eval(property);
//     }
//     return target;
// }

//record update processing callback...
function recordUpdate(err, operation, findRes, response, extraInfo, next) {

    //check if the document is found...
    if(err) fulfillmentGen(err, '', undefined, response, extraInfo, next);
    else{

        //logic for preparing data to update the document fields in mongoDB...
        // var reqRan, reqPullups, reqPushups;
        //
        // reqRan = req.result.parameters.ran;
        // reqPullups = req.result.parameters.pullups;
        // reqPushups = req.result.parameters.pushups;

        var foundRan = findRes.ran;
        // var foundUnit = findRes.unit;
        var foundPushups = findRes.pushups;
        var foundPullups = findRes.pullups;

        var ran, pullups, pushups;
        ran = foundRan - reqRan;
        pullups = foundPullups - reqPullups;
        pushups = foundPushups - reqPushups;

        var targetKeys=[];
        if(reqRan !='')        targetKeys.push('ran');
        if(reqPullups !='')    targetKeys.push('pullups');
        if(reqPushups !='')    targetKeys.push('pushups');

        var target={};
        for(key in targetKeys){
            var property = targetKeys[key];
            target[property] = eval(property);
        }

        //finally, update the document, and pass the appropriate callback for preparing the response...
        connect('update', target, fulfillmentGen, undefined, next);
    }

    next();
}

//response generation callback...
function fulfillmentGen(err, operation, result, response, extraInfo, next) {

    //check if error is generated, or we have the response...
    if(result == undefined){

        //format error response...
        var errResp = {
            speech: "Sorry, I can't find the details, give it another try...",
            displayText: "Sorry, I can't find the details, give it another try...",
            source: "Workout Tracker Service @heroku",

            status: "not found"
        };

        //send the json formatted response to api.ai...
        response.json(errResp);
    }else{

        //format fulfillment response according to the 'operation' field in the function scope (closure)...
        switch (operation){
            case 'insert':

                var insResp = {
                    speech: "Voila, now with the target set, we can concentrate on achieving it",
                    displayText: "Voila, now with the target set, we can concentrate on achieving it",
                    source: "Workout Tracker Service @heroku"
                };

                //send the json formatted response to api.ai...
                response.json(insResp);

                break;
            case 'retrieve':

                var ranRes = result.ran;
                var unitRes = result.unit;
                var pushupsRes = result.pushups;
                var pullupsRes = result.pullups;

                //Here's what you're looking for :

                var textRes = "Distance ran: " + ranRes + " " + unitRes + "\n" +
                              "Push-ups : " + pushupsRes + "\n" +
                              "Pull-ups : " + pullupsRes;

                var findResp = {
                    speech: textRes,
                    displayText: textRes,
                    source: "Workout Tracker Service @heroku",

                    status: "found"
                };

                //send the json formatted response to api.ai...
                response.json(findResp);

                break;
            case 'update':

                var updateResp = {
                    speech: "Sure, let me jot it down...",
                    displayText: "Sure, let me jot it down...",
                    source: "Workout Tracker Service @heroku"
                };

                //send the json formatted response to api.ai...
                response.json(updateResp);

                break;
        }

    }

    next();
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
    connect('insert', target, fulfillmentGen, undefined, next);

    // if(DBResult == undefined)  console.log('----------Error in either MongoDB connection, or operations----------');
    // else                       console.log(DBResult + ' @set_target');

    next();
}

// get workout target as provided by the user...
function show_status(req, res, next) {
    var target = {uIdentity: uIdentity};

    response =res;

    //call connect() with appropriate arguements...
    // var DBResult = connect('retrieve', target);
    connect('retrieve', target, fulfillmentGen, undefined, next);

    // if(DBResult == undefined)  console.log('----------Error in either MongoDB connection, or operations----------');
    // else                       console.log(DBResult + ' @show_status');

    next();
}

function record(req, res, next) {


    reqRan = req.body.result.parameters.ran;
    reqPullups = req.body.result.parameters.pullups;
    reqPushups = req.body.result.parameters.pushups;


    // ran = req.body.result.parameters.ran;
    // unit = req.body.result.parameters.unit;
    // pullups = req.body.result.parameters.pullups;
    // pushups = req.body.result.parameters.pushups;
    // date = req.body.result.parameters.date;
    //
    // targetCreator(ran, unit, pushups, pullups);
    //
    // var targetKeys=[];
    // if(ran !='')        targetKeys.push('ran');
    // if(unit !='')       targetKeys.push('unit');
    // if(pullups !='')    targetKeys.push('pullups');
    // if(pushups !='')    targetKeys.push('pushups');
    //
    // var target={};
    // for(key in targetKeys){
    //     var property = targetKeys[key];
    //     target[property] = eval(property);
    // }

    response =res;


    //call connect() with appropriate arguements...
    // var DBResult = connect('update', target);
    var retTarget = {uIdentity: uIdentity};

    connect('retrieve', retTarget, recordUpdate, target, next);

    // if(DBResult == undefined)  console.log('----------Error in either MongoDB connection, or operations----------');
    // else                       console.log(DBResult + ' @record');

    next();
}