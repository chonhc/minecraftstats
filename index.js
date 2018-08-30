var Client = require('node-rest-client').Client;
var Crypto = require('crypto');
var storeAzureLog = require('./azureReq');

var client = new Client();

var workspaceId = 'd528a092-ae59-45a7-a723-2441027ddd2b';
var minecraftInfoEndpoint = 'https://mcapi.us/server/status?ip=13.68.196.47&port=25565';
var sharedKey = '8bWI3WfBf/4HnnKsZupGDhFKKHyFTWk4hjFJrZ0lL18yntwW9OpyLmcsSk+bd41zRyk8Rp9cuKTpF2bVcbrvDA==';

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
        var req = {
            "type":"minecraftInfo",
            "credentials":{
              "workspaceId":workspaceId,
              "sharedKey":sharedKey
            },
            "logEntry": serverInfo
        };
        console.log(serverInfo)
        storeAzureLog(req);
    });
}

poll(getMinecraftServerInfo, 60 * 1000);