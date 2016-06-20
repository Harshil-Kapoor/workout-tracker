/**
 * Created by Harshil on 6/16/2016.
 */
var Botkit = require('botkit');

var accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
var verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;
var port = process.env.PORT;

if(!accessToken)    throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is required but not present');
if(!verifyToken)    throw new Error('FACEBOOK_VERIFY_TOKEN is required but not present');
if(!port)    throw new Error('PORT is required but not present');

var controller = Botkit.facebookbot({
    access_token: accessToken,
    verify_token: verifyToken
});

var flavor, size, delivery;
var flavorO, sizeO, deliveryO;

// var doubleCheese = {
//     name: 'Double Cheese',
//     img_url: 'http://top-10-list.org/wp-content/uploads/2011/05/1_pizza.jpg',
//     info: 'This is a very popular veg. pizza which has a double thick layer of cheese.'
// };
// var gourmet = {
//     name: 'Gourmet',
//     img_url: 'http://top-10-list.org/wp-content/uploads/2011/05/2_pizza.jpg',
//     info: 'This is a unique flavour of vegetarian pizza where the pizza where the spicy vegetarian delight is topped with extremely appealing golden corns, loaded with extra cheese.',
// };
// var mexican = {
//     name: 'Mexican Green Wave',
//     img_url: 'http://top-10-list.org/wp-content/uploads/2011/05/3_pizza.jpg',
//     info: 'This is another unique recipe of American pizza which mane is influenced by the Mexican Waves.',
// };
// var peppyPaneer = {
//     name: 'Peppy Paneer',
//     img_url: 'http://top-10-list.org/wp-content/uploads/2011/05/4_pizza.jpg',
//     info: 'The Paneer used in this pizza are barbequed and then few pieces of Paneer is sprinkled over the pizza along with crispy capsicum slices and spicy red pepper.',
// };


// var flavorResponse={
//     key: 'flavorResp',
//     multiple: false
// };
//
// var sizeResponse={
//     key: 'sizeResp',
//     multiple: false
// };
//
// var deliveryResponse={
//     key: 'deliveryResp',
//     multiple: false
// };


//facebook sdk loading and initialization...
fbAsyncInit = function() {
    FB.init({
        appId      : 1720941448159226,
        xfbml      : true,
        version    : 'v2.6'
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

//callback to get user id from fb graph api...
function getId() {
    var uid, accessToken;
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {

            // the user is logged in and has authenticated your
            // app, and response.authResponse supplies
            // the user's ID, a valid access token, a signed
            // request, and the time the access token
            // and signed request each expire
            uid = response.authResponse.userID;
            accessToken = response.authResponse.accessToken;

        // } else if (response.status === 'not_authorized') {
        //
        //     // the user is logged in to Facebook,
        //     // but has not authenticated your app
        //     uid = undefined;
        //     accessToken = undefined;
        //
        } else {

            // the user isn't logged in to Facebook.
                uid = undefined;
                accessToken = undefined;

        }

        return uid;
    });
}

//callback to get check if user has already set it's targets...
function checkUser(response, convo) {

    var uIdentity = getId();
    var status;

    if (uIdentity == undefined) {
    }

    var requestData = {
        result: {
            action: "show_status",
            parameters: {
                uIdentity: uIdentity
            }
        }
    };

    var url = "workout-trainer.herokuapp.com/webhook/webhook";

    // fire request
    request({
        url: url,
        method: "POST",
        json: requestData

    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body);

            if (response.status == 'not found')  status = false;
            else                                status = true;
        }
        else {
            status = false;

            console.log("error: " + error);
            console.log("response.statusCode: " + response.statusCode);
            console.log("response.statusText: " + response.statusText);
        }
    })
}

//bot code...
var bot = controller.spawn();

controller.setupWebserver(port, function (err, webserver) {
    if(err) return console.log(err);
    controller.createWebhookEndpoints(webserver, bot, function () {
        console.log("Webhooks successfully set up");
    });
});

// this is triggered when a user clicks the send-to-messenger plugin
controller.on('facebook_optin', function (bot, message) {
    bot.reply(message, "Welcome to WorkoutTime...");
});

//the main hearing event triggers...
controller.hears(['hi', 'hello', 'hey'], ['message_received'], function (bot, message) {
    bot.startConversation(message, function (response, convo) {

        convo.say("Hey there!");
        convo.say("Welcome to WorkoutTime");
        convo.say("I'll help you track your workout");

        checkUser(response, convo, function () {
            if (!status) {
                convo.say("It seems you're new here");
                convo.say("Let's get you started...");

                req_target(response, convo);
                convo.next();
            } else {
                convo.say("Just hit me with your workout details...");

                getDetails(response, convo);
                convo.next();
            }
        });

        convo.next();
    });
});

controller.hears(['(.*) for today', '(.*) today', 'next'], ['message_received'], function (bot, message) {
    bot.startConversation(message, function (response, convo) {

        var input = message.match[1]
        convo.say("Next hear()");
        // convo.say("Hey there!");
        // convo.say("Welcome to WorkoutTime");
        // convo.say("I'll help you track your workout");

        checkUser(response, convo, function () {
            if (!status) {
                convo.say("It seems you're new here");
                convo.say("Let's get you started...");

                req_target(response, convo);
                convo.next();
            } else {
                convo.say("Just hit me with your workout details...");

                getDetails(response, convo);
                convo.next();
            }
        });

        convo.next();
    });
});
//

