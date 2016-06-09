/**
 * Created by Harshil on 6/8/2016.
 */
var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

var url = 'mongodb://Harshil:abcd1234@ds011024.mlab.com:11024/workout-tracker';

MongoClient.connect(url, function (err, db) {
    if (err){
        console.log("Error connecting to database : ",err);
    }else{
        console.log("Successfully connected to database...");

        var collection = db.collection('users');

        var user1 = {name: 'modulus admin', age: 42, roles: ['admin', 'moderator', 'user']};
        var user2 = {name: 'modulus user', age: 22, roles: ['user']};
        var user3 = {name: 'modulus super admin', age: 92, roles: ['super-admin', 'admin', 'moderator', 'user']};

        // collection.insert([user1, user2, user3], function (err, result) {
        //     if(err){
        //         console.log(err);
        //     }else{
        //         console.log('Inserted %d documents into "users" collection. The documents inserted with "_id" are:', result.length, result);
        //     }
        //     db.close();
        // });
    }
});