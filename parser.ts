/// <reference path='typings/node/node.d.ts' />
import http = require('https');

var request = http.request("https://news.ycombinator.com/item?id=9996333");
request.on('response', function(res) {
    res.on('data', function(data) {
//		console.log(data.class);
        console.log(data.toString());
    });
});
request.end();

