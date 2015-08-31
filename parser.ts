/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/htmlparser2/htmlparser2.d.ts' />

import http = require('https');
import parser = require('htmlparser2')

var request = http.request("https://news.ycombinator.com/item?id=9996333");
request.on('response', function(res) {
    res.on('data', function(data) {
        console.log(data.toString());
    });
});
request.end();

