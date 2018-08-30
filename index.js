var Client = require('node-rest-client').Client;
var Crypto = require('crypto-js');
var utf8 = require('utf8');

var client = new Client();

var minecraftInfoEndpoint = 'https://mcapi.us/server/status?ip=13.68.196.47&port=25565';
var logAnalyticsEndpoint = 'https://d528a092-ae59-45a7-a723-2441027ddd2b.ods.opinsights.azure.com/api/logs?api-version=2016-04-01';

var workspaceID = 'd528a092-ae59-45a7-a723-2441027ddd2b';
function getSignature(contentLength) {
    var signature = 'POST' + '\\n' +
        contentLength+'\\n' +
        'application/json' + '\\n' +
        'x-ms-date:' + new Date().toUTCString() + '\\n' + 
        '/api/logs';

    console.log();
    console.log(signature);

    var wordArray = Crypto.enc.Utf8.parse(signature);
    var encodedBits = Crypto.HmacSHA256(wordArray, 'accessKeyBytes');
    var base64 = Crypto.enc.Base64.stringify(encodedBits);

    console.log();
    console.log(base64);

    return base64;
}


function poll(fn, interval) {
    interval = interval || 100;

    var checkCondition = function(resolve, reject) {
        var result = fn();
        if(result) {
            resolve(result);
        }
        setTimeout(checkCondition, interval, resolve, reject);
    };

    return new Promise(checkCondition);
}

function getMinecraftServerInfo() {
    client.get(minecraftInfoEndpoint, function(serverInfo, response) {
        var args = {
            data: serverInfo,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `SharedKey ${workspaceID}:${getSignature(JSON.stringify(serverInfo).length)}`, 
                'Log-Type': 'minecraftInfo', 
                'x-ms-date': new Date().toUTCString(), 
                'time-generated-field': new Date().toISOString()
            }
        };

        client.post(logAnalyticsEndpoint, args, function (data, response) {
            console.log('DATA\n');
            console.log(data);
            // console.log('RESPONSE\n');
            // console.log(response);
        });
        // console.log(args);
        // console.log(serverInfo);
    });
}

poll(getMinecraftServerInfo, 60 * 1000);