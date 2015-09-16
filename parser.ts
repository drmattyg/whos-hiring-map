/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/request/request.d.ts' />
/// <reference path='typings/js-yaml/js-yaml.d.ts' />
import WHParser = require('./WHParser');
import request = require('request');
import NERClient = require('./NERClient')
import yaml = require('js-yaml');
import fs = require('fs');


var hnUrl : string = 'https://news.ycombinator.com/item?id=9996333';
var config: any = yaml.safeLoad(fs.readFileSync('./conf/config.yml', 'utf8'));
var client: NERClient.NERClient = new NERClient.NERClient(config.ner.port, config.ner.host);
request(hnUrl, (error, response, body) => {
	var whp : WHParser.WHParser = new WHParser.WHParser(body, client)
	whp.entries.forEach(entry => {
		console.log(entry.header);
	});
});

