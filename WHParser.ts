/// <reference path='typings/cheerio/cheerio.d.ts' />

// using https://gist.github.com/kristopolous/19260ae54967c2219da8 as reference for parsing



import NC = require('./NERClient')
export class WHEntry { 
	html: string;
	header: string;
	latitude: number;
	longitude: number;


	constructor(html: string) {
		this.html = html;
		this.header = html.split(/(<p>|\n)/)[0]

	}
}
export class WHParser {
	html: string;
	entries: Array<WHEntry> = [];
	nerClient: NC.NERClient;
	constructor(html: string, client: NC.NERClient) {
		var cheerio: CheerioAPI = require('cheerio');
		this.html = html
		this.nerClient = client;
		var $ = cheerio.load(this.html);
		$('.c5a,.cae,.c00,.c9c,.cdd,.c73,.c88').each((i: number, elem: CheerioElement) => { 
			var entry : WHEntry = new WHEntry($(elem).html())
			this.entries.push(entry);
		});
	}
}
//export = WHParser

