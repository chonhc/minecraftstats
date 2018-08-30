module.exports = function (req) {

    var request = require('request');
    var crypto = require('crypto');

    var workspaceId = req.credentials.workspaceId;
    var sharedKey = req.credentials.sharedKey;

    var apiVersion = '2016-04-01';
    var processingDate = new Date().toUTCString();

    var body = JSON.stringify(req.logEntry);

    console.log('Body is ' + body);

    var contentLength = Buffer.byteLength(body, 'utf8');

    var stringToSign = 'POST\n' + contentLength + '\napplication/json\nx-ms-date:' + processingDate + '\n/api/logs';
    var signature = crypto.createHmac('sha256', new Buffer(sharedKey, 'base64')).update(stringToSign, 'utf-8').digest('base64');
    var authorization = 'SharedKey ' + workspaceId + ':' + signature;

    var headers = {
        "content-type": "application/json", 
        "Authorization": authorization,
        "Log-Type": req.type,
        "x-ms-date": processingDate
    };

    var url = 'https://' + workspaceId + '.ods.opinsights.azure.com/api/logs?api-version=' + apiVersion;

    request.post({url: url, headers: headers, body: body}, function (error, response, body) {
        console.log('Posting to LogAnalytics');
        console.log('StatusCode: ', response && response.statusCode); 
    });


};