var config = require('../config');
var request = require('request');

// If https is used, allow default and self signed SSL certificates
var agent;
if ( config.KB_protocol === 'https' ) {
    var https = require('https');
    var agentOptions;
    agentOptions = {
        host: config.KB_host,
        path: '/',
        rejectUnauthorized: false
    };
    if ( config.KB_port ) {
        agentOptions.port = config.KB_port;
    }
    agent = new https.Agent(agentOptions);
}

function getCurrentKeg( callback ) {
    var url = config.KB_server + "/api/taps/";
    request({
        uri:url,
        method: 'GET',
        agent: agent
    }, function (err, response) {
        if (err) {
            callback(err, null);
            return false;
        }
        var obj = JSON.parse(response.body);
        callback(err, obj.objects[0].current_keg);
    });
}

module.exports.getCurrentKeg = getCurrentKeg;
