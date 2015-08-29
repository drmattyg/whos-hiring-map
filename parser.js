/// <reference path='typings/node/node.d.ts' />
var http = require('https');
var request = http.request("https://news.ycombinator.com/item?id=9996333");
request.on('response', function (res) {
    console.log(res.headers);
    res.on('data', function (data) {
        console.log(data.toString());
    });
});
request.end();
