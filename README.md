# workout-tracker
Repository for Workout Tracker, a facebook bot for tracking workout details.

#file descriptions :

Dockerfile :		File for Docker container creation (beepboophq.com, a hosting platform for fb & slack bots, not currently used by us...)

Procfile : 		File used by heroku (again a hosting platform), specifies which process to be executed first, like in package.json

README.md :		you're reading this

apiCore.js :		File implementing api core on the server, for getting userID(fb)

controller.js :	File created for bot using botkit, api.ai free implementation (though now not working on it...)

mongoTest.js :	File for testing mLab connection

package.json :	You know what it is

workout.js :		The service code, the brains behind the bot...