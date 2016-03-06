function User(){
    var userID = -1; // ID is integer starting from 0
    var userVerificationCode = "";
    var userName = "";
    var userPhoneNumber = "";
    var onWatch = false;
    var onWatchCountDown = 0; // number of seconds left until warning
    var warningMessageSent = false;

    var active = false;

    var GPSHistory = []; // format: {t,lat,lon}. t is server's time in seconds after Jan 1, 1970
    var listOfContacts = []; // format: {email, cellphoneNumber}

    this.setID = function(newID){
        userID = newID;
    }
    this.getID = function(){
        return userID;
    }

    this.setVerificationCode = function(newVerification){
        userVerificationCode = newVerification;
    }
    this.getVerificationCode = function(){
        return userVerificationCode;
    }

    this.setName = function(newName){
        userName = newName;
    }
    this.getName = function(){
        return userName;
    }

    this.setUserPhoneNumber = function(newNumber){
        userPhoneNumber = newNumber;
    }
    this.getUserPhoneNumber = function(){
        return userPhoneNumber;
    }

    this.setOnWatch = function(newStatus){
        onWatch = newStatus;
    }
    this.getOnWatch = function(){
        return onWatch;
    }

    this.setCountDownTime = function(numberOfSeconds){
        onWatchCountDown = numberOfSeconds;
    }
    this.getCountDownTime = function(){
        return onWatchCountDown;
    }

    this.setWarningMessageStatus = function(newStatus){
        warningMessageSent = newStatus;
    }
    this.getWarningMessageStatus = function(){
        return warningMessageSent;
    }

    this.setActiveStatus = function(newState){
        active = newState;
    }
    this.getActiveStatus = function(){
        return active;
    }

    this.getGPSHistory = function(){
        return GPSHistory;
    }
    this.setGPSHistory = function(newHistoryList){
        GPSHistory = newHistoryList;
    }
    this.addGPSHistory = function(serverTime, lat, lon){
        GPSHistory.push({'t':serverTime,'lat':lat,'lon':lon})
    }

    this.setListOfContacts = function(newList){
        listOfContacts = newList;
    }
    this.getListOfContacts = function(){
        return listOfContacts;
    }

}
