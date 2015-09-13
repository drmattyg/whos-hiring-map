/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/request/request.d.ts' />

import WHParser = require('./WHParser');
import request = require('request');
import NERClient = require('./NERClient')
var hnUrl : string = 'https://news.ycombinator.com/item?id=9996333';
var client: NERClient.NERClient = new NERClient.NERClient(9191, 'localhost');
client.query("If you're going to San Francisco, you should wear some flowers in your hair", function(entities: Array<NERClient.NEREntity>) {
	console.log(entities);
});
/*
request(hnUrl, function(error, response, body) {
	var whp : WHParser.WHParser = new WHParser.WHParser(body)
	whp.entries.forEach(entry => {
		console.log(entry.header);
	});
});
*/
