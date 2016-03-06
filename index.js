var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

// twilio
var twilio = require('twilio');
var client = new twilio.RestClient('AC9476bbd225fb87c684787c20e1108c86', 'a4ce5ef9968590a8e1aedc5f5f6ef2bc');
var Messenger = require("./Message.js");

// users
var User = require("./User.js");

// generate a random string with length of len
function makeRandomString(len){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ ){
    	text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


var listOfUsers = [];
function createUser(){
    // create new user and return the user instance
    var newUser = User.create();
    newUser.setID(listOfUsers.length);
    newUser.setVerificationCode(makeRandomString(10));
    newUser.setAccessCode(makeRandomString(12));
    listOfUsers.push(newUser);
    return newUser;
}
function removeUser(userID){
    // TODO: bound check

    listOfUsers[userID] = User.create();
}
function verifyUser(userID, verificationCode){
    // TODO: bound check
    // returns true if the user is valid

    var targetUserInstance = listOfUsers[userID];
    if((userID <= listOfUsers.length-1)&&(targetUserInstance.getVerificationCode() == verificationCode)){
        return true;
    } else {
        return false;
    }
}
var port = process.env.PORT || 5000;

// Serve our index.html page at the root url
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/client.html');
});
// Have express serve all of our files in the public directory
app.use(express.static('public'));
// Starts the web server at the given port
http.listen(port, function(){
    console.log('Listening on ' + port); // TODO: remove this line for privacy
});

io.on('connection', function (socket) {
    console.log(socket.id + " connected");
    socket.join(socket.id);
    io.to(socket.id).emit("connectionSuccess")

    socket.on("verifyUserAccount",function(userID,verificationCode){
        if(verifyUser(userID, verificationCode)){
            io.to(socket.id).emit("userAccountValid")
        } else {
            io.to(socket.id).emit("userAccountInvalid")
        }
    })
    socket.on("requestNewUserID",function(){
        console.log("requestNewUserID")
        var newUser = createUser();
        io.to(socket.id).emit("newUserID",{
            "ID":newUser.getID(),
            "verificationCode":newUser.getVerificationCode(),
            "accessCode":newUser.getAccessCode()
        })

    });
    socket.on("requestSetContactList",function(userID,verificationCode,newContactList){
        console.log("requestSetContactList")

        //verifyUser(userID, verificationCode)
        // TODO: check validity of the list of contacts

        if(verifyUser(userID, verificationCode)){
            console.log(listOfUsers[userID].getListOfContacts())
            listOfUsers[userID].setListOfContacts(newContactList);

            io.to(socket.id).emit("contactListUpdateSuccessful")
            console.log(listOfUsers[userID].getListOfContacts())
        }
    });
    socket.on("requestUpdateOnWatchMode",function(userID,verificationCode,newOnWatchStatus,countDownTime){
        // TODO: verify the input integrity. for example countDownTime should not be negative
        console.log("requestUpdateOnWatchMode")
        if(verifyUser(userID, verificationCode)){
            var targetUserInstance = listOfUsers[userID];
            targetUserInstance.setOnWatch(newOnWatchStatus);

            if(newOnWatchStatus == false){ //if turning off onWatch status
                listOfUsers[userID].setGPSHistory([]); // wipe out GPS History
                targetUserInstance.setCountDownTime(0);
            } else {
                targetUserInstance.setCountDownTime(countDownTime);
            }

            io.to(socket.id).emit("watchModeUpdateSuccessful",{"newMode":targetUserInstance.getOnWatch()});
        }
    });
    socket.on("requestResetCountDownTime",function(userID,verificationCode,newCountDownTime){
        // newCountDownTime is in seconds
        // TODO: make sure newCountDownTime is non-negative
        if(verifyUser(userID, verificationCode)){
            var targetUserInstance = listOfUsers[userID];
            targetUserInstance.setCountDownTime(newCountDownTime);

            // TODO: do something if warning message had been sent and new user is fine since time is reset. Maybe tell the contacts about that the user if fine?
            targetUserInstance.setWarningMessageStatus(false);
        }
    });
    socket.on("requestUpdateGPSLocation",function(userID,verificationCode,lat,lon){
        console.log("requestUpdateGPSLocation")
        if(verifyUser(userID, verificationCode)){
            var currentSystemTime = new Date();
            currentSystemTime = currentSystemTime.getTime(); // time in seconds after Jan 1 1970

            var targetUserInstance = listOfUsers[userID];
            targetUserInstance.addGPSHistory(currentSystemTime,lat,lon);

            // tell subscribers
            io.to("watch_" + userID).emit("userGPSData",{"userID":userID,"GPSHistory":targetUserInstance.getGPSHistory()})
        }
    });
    socket.on("checkGPSLocation",function(userID,accessCode){
        console.log("checkGPSLocation on user of ID " + userID)

        var targetUserInstance = listOfUsers[userID];
        if((userID <= listOfUsers.length-1)&&(targetUserInstance.getAccessCode() == accessCode)){
            io.to(socket.id).emit("userGPSData",{"userID":userID,"GPSHistory":targetUserInstance.getGPSHistory()})
        } else {
            io.to(socket.id).emit("cannotAccessUserData",{"userID":userID,"accessCode":accessCode})
        }
    });
    socket.on("subscribeUserGPS",function(userID,accessCode){
        var targetUserInstance = listOfUsers[userID];
        if((userID <= listOfUsers.length-1)&&(targetUserInstance.getAccessCode() == accessCode)){
            io.to(socket.id).emit("subscribeSuccessful")
            socket.join("watch_" + userID);
        } else {
            io.to(socket.id).emit("subscribeFail")
        }
    });
})
function notifySubscriber(userID){
    var targetUserInstance = listOfUsers[userID];
    io.to("watch_" + userID).emit("userGPSData",{"userID":userID,"GPSHistory":targetUserInstance.getGPSHistory()})
}
function updateCountDown(){
    for(var ind=0; ind < listOfUsers.length; ind++){
        var targetUserInstance = listOfUsers[ind];
        if(targetUserInstance.getOnWatch()){ // if onWatch mode is on for this user
            var currentCountDownTime = targetUserInstance.getCountDownTime();
            if(currentCountDownTime > -20){ // if not yet hit the 20 response time
                targetUserInstance.setCountDownTime(currentCountDownTime-1);
            } else {
                // hit 20 seconds response time. Should send warning to all contacts
                if(targetUserInstance.getWarningMessageStatus() == false){ // if haven't sent message to people on the contact list
                    console.log("sending warnings to contacts.... (To be implemented)");

                    var listOfUserContact = targetUserInstance.getListOfContacts();
                    for(var ind=0; ind < listOfUserContact.length; ind++){
                        Messenger.send(client,listOfUserContact[ind].phone,"7787856879", "I might be in trouble now. my id is " + targetUserInstance.getID() + " and accessCode is: " + targetUserInstance.getAccessCode())
                    }
                    targetUserInstance.setWarningMessageStatus(true);
                }
            }
        }

    }
}
setInterval(updateCountDown,1000);
//Messenger.send(client,"7789386579","7787856879", "I am Dad")
