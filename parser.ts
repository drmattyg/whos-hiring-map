/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/request/request.d.ts' />
/// <reference path='typings/js-yaml/js-yaml.d.ts' />
import WHP = require('./WHParser');
import request = require('request');
import NERClient = require('./NERClient')
import Config = require('./Config')
import yaml = require('js-yaml');
import fs = require('fs');


var hnUrl : string = 'https://news.ycombinator.com/item?id=9996333';
var config: any = Config.readConfig();
var nc: NERClient.NERClient = new NERClient.NERClient(config.ner.port, config.ner.host);
var html: string = fs.readFileSync('data/aug_2015_subset.html', 'utf-8');
var whp: WHP.WHParser = new WHP.WHParser(html, nc, config.bing.key);
// whp.entries.forEach((e) => {
// 	console.log("HEADER: " + e.header);
// });
whp.geocodeEntries(() => {
	var geocodedEntries: WHP.WHEntry[] = whp.entries.filter((e) => { return e.geolocation != null; });
	fs.writeFile(config.output.filename, "window.entryData = " + JSON.stringify(geocodedEntries), (err) => {

	});

});

