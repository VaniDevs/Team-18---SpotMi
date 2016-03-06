
$('document').ready(function(){
    document.getElementById("lblOnWatchStatus").innerHTML = currentUser.getOnWatch();

    document.getElementById("btnWatchOn").onclick = function(){
        currentUser.setOnWatch(true);
        document.getElementById("lblOnWatchStatus").innerHTML = currentUser.getOnWatch();
        requestUpdateOnWatchMode();
    }
    document.getElementById("btnWatchOff").onclick = function(){
        currentUser.setOnWatch(false);
        document.getElementById("lblOnWatchStatus").innerHTML = currentUser.getOnWatch();
        requestUpdateOnWatchMode();
    }

    document.getElementById("btnAddTime").onclick = function(){
        var currentRemainTime = Number(document.getElementById("remainSeconds").value);
        var newTime = currentRemainTime + 5;

        document.getElementById("remainSeconds").value = newTime;
        requestResetCountDownTime();
    }

    document.getElementById("btnUploadContact").onclick = requestSetContactList;
    document.getElementById("btnUploadGPSInfo").onclick = requestUpdateGPSLocation;

});
