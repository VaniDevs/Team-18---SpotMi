socket = io();

var currentUser = new User();

var contactList = [
    {"email":"danielcdcj@yahoo.com.tw","phone":"7789386579"},
    {"email":"a@b.c","phone":"1234567890"}
];



socket.emit("requestNewUserID");

socket.on("newUserID",function(serverReply){
    var newUserID = serverReply.ID;
    var newUserVerification = serverReply.verificationCode;

    currentUser.setID(newUserID);
    currentUser.setVerificationCode(newUserVerification);
});

function requestSetContactList(){
    var userID = currentUser.getID();
    var verificationCode = currentUser.getVerificationCode();

    socket.emit("requestSetContactList",userID,verificationCode,contactList)
}

function requestUpdateOnWatchMode(){
    var userID = currentUser.getID();
    var verificationCode = currentUser.getVerificationCode();
    var newOnWatchStatus = currentUser.getOnWatch();

    var countDownTime = Number(document.getElementById("remainSeconds").value);

    socket.emit("requestUpdateOnWatchMode",userID,verificationCode,newOnWatchStatus,countDownTime)
}

function requestResetCountDownTime(){
    var userID = currentUser.getID();
    var verificationCode = currentUser.getVerificationCode();
    var newCountDownTime = Number(document.getElementById("remainSeconds").value);

    socket.emit("requestResetCountDownTime",userID,verificationCode,newCountDownTime);
}

function requestUpdateGPSLocation(){

    var userID = currentUser.getID();
    var verificationCode = currentUser.getVerificationCode();

    var lat = Number(document.getElementById("txtLat").value);
    var lon = Number(document.getElementById("txtLon").value);

    socket.emit("requestUpdateGPSLocation",userID,verificationCode,lat,lon);
    console.log("requestUpdateGPSLocation")
}


function reduceTime(){
    var watchStatus = currentUser.getOnWatch();
    if(watchStatus){
        var currentRemainTime = Number(document.getElementById("remainSeconds").value);

        if(currentRemainTime > 0){
            var newTime = currentRemainTime - 1;
            document.getElementById("remainSeconds").value = newTime;
        }
    }
}
setInterval(reduceTime,1000)
