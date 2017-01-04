/******************** INCLUDES **********************/
var config = require('./config');
var alexa = require('alexa-app');

var KB = require('./lib/kegbot');

// Reloaded by hotswap when code has changed (by alexa-app-server)
module.change_code = 1;

var appName = config.applicationName;

/******************* ASK MAIN ROUTINES **************/
// Define an alexa-app
var app = new alexa.app(appName);
app.launch(function(request,response) {
    // Store the Launch Intent in session, which later keeps the session going for multiple requests/commands
    response.session ('launched', 'true');
    
    response.say(config.greeting);
    
    response.shouldEndSession(false, "How can I help?");
});

app.sessionEnded(function(request,response) {
    response.say('Bye');
});

app.messages.NO_INTENT_FOUND = "I am uncertain what you mean.  Kindly rephrase...";

// Pre-execution security checks - ensure each requests applicationId match configured values
app.pre = function(request,response,type) {    
    // Extract values from various levels of the nested request object
    var address = request.data.remoteAddress;
    var password = request.data.password;
    var timestamp = request.data.request.timestamp;
    var requestId = request.data.request.requestId;
    var sessionId = request.sessionId;
    var applicationId = request.sessionDetails.application.applicationId;
    
    // Log the request
    console.log(address + ' - ' + timestamp + ' - ' + ' AWS ASK ' + type + ' received: ' + requestId + ' / ' + sessionId);
    
    if (applicationId !== config.applicationId) {
        console.log(address + ' - ' + timestamp + ' - ERROR: Invalid application ID in request:' + applicationId);
        response.fail("Invalid application ID");
    }
};

/*************** Define ALEXA ASK Intents *****************************/
app.intent('onTap', {
    "utterances":config.utterances.onTap},
    function(request,response) {
        console.log('REQUEST: onTap Intent');
        var keg = KB.getCurrentKeg();
	if (keg) {
            replyWith(appName + ' has ' + keg.type.name + ' on tap', response);
        } else {
            replyWith(appName + ' has no beer on tap', response);
        }
    });

app.intent('Volume', {
    "utterances":config.utterances.volume},
    function(request,response) {
        console.log('REQUEST: volume Intent');
        var keg = KB.getCurrentKeg();
	if (keg) {
            replyWith(appName + ' has ' + keg.percent_full + ' percent of ' + keg.type.name + ' left', response);
        } else {
            replyWith(appName + ' has no beer on tap', response);
        }
    });

app.intent('HelpIntent',
    {"utterances":config.utterances.Help
    },function(request,response) {
        console.log('REQUEST:  Help...');
        response.say(config.help.say.toString()).reprompt('What would you like to do?').shouldEndSession(false);
        response.card(appName, config.help.card.toString());
    });

// Custom ASK response handler
function replyWith(speechOutput,response) {
    // Log the response to console
    console.log('RESPONSE: ' + speechOutput);
    
    // 'Say' the response on the ECHO
    response.say(speechOutput);
    
    // Show a 'Card' in the Alexa App
    response.card(appName,speechOutput);
    
    // If this is a Launch request, do not end session and handle multiple commands
    if (response.session ('launched') === 'true') { 
        response.shouldEndSession (false); 
    }
    
    // 'Send' the response to end upstream asynchronous requests
    response.send();
}

module.exports = app;
