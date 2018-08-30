var Client = require('node-rest-client').Client;
var CryptoJS = require('ts.cryptojs256');


var client = new Client();

var minecraftInfoEndpoint = 'https://mcapi.us/server/status?ip=13.68.196.47&port=25565';
var logAnalyticsEndpoint = 'https://d528a092-ae59-45a7-a723-2441027ddd2b.ods.opinsights.azure.com/api/logs?api-version=2016-04-01';

var workspaceID = 'd528a092-ae59-45a7-a723-2441027ddd2b';
function getSignature(contentLength) {
    var signature = `POST
    ${contentLength}
    content-type: "application/json"
    x-ms-date:${new Date().toUTCString()}
    /api/logs`;
    var encodedString = CryptoJS.enc.base64.stringify(signature);
    var hmacHash = CryptoJS.HmacSHA256(encodedString, workspaceID);

    return hmacHash;
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
                'Authorization': `SharedKey ${workspaceID}:${getSignature(serverInfo.length)}`, 
                'Log-Type': 'minecraftInfo', 
                'x-ms-date': new Date().toUTCString(), 
                'time-generated-field': new Date().toISOString()
            }
        };
        client.post(logAnalyticsEndpoint, args, function (data, response) {
            console.log(data);
            // console.log(response);
        });
    });
}

poll(getMinecraftServerInfo, 1000);