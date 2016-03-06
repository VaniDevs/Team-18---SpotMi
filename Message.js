module.exports = {
	send:sendSMS
}

function sendSMS(client,receiverPhoneNumber,senderPhoneNumber, messageBody){
	console.log("in sendSMS")
	console.log(client)
	console.log(receiverPhoneNumber)
	console.log(senderPhoneNumber)
	console.log(messageBody)
    // client. The client instance
    // receiverPhoneNumber String. Without +1
    // senderPhoneNumber String. Without +1
    // messageBody String

    // Note: current implementation assumes that both receiver and the sender are both in North America where country code = "+1"

    client.sms.messages.create({
        to:"+1"+receiverPhoneNumber,
        from:"+1"+senderPhoneNumber,
        body:messageBody
    }, function(error, message) {
        // The HTTP request to Twilio will run asynchronously. This callback
        // function will be called when a response is received from Twilio
        // The "error" variable will contain error information, if any.
        // If the request was successful, this value will be "falsy"
        if (!error) {
            // The second argument to the callback will contain the information
            // sent back by Twilio for the request. In this case, it is the
            // information about the text messsage you just sent:
            console.log('Success! The SID for this SMS message is:');
            //console.log(message.sid);

            console.log('Message sent on:');
            //console.log(message.dateCreated);
        } else {
            console.log('Oops! There was an error.');
        }
    });
}
