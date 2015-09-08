/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/request/request.d.ts' />
import WHParser = require('./WHParser');
import request = require('request');
var hnUrl : string = 'https://news.ycombinator.com/item?id=9996333';
request(hnUrl, function(error, response, body) {
	var whp : WHParser = new WHParser(body)
});
//$('.c5a').each(function(i, elem) { console.log($(this).text()); }); 0;

