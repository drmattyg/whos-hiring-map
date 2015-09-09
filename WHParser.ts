/// <reference path='typings/cheerio/cheerio.d.ts' />

// using https://gist.github.com/kristopolous/19260ae54967c2219da8 as reference for parsing



//	import cheerio = require('cheerio');
export class WHEntry { 
	html: string;
	header: string;
	latitude: number;
	longitude: number;
}
export class WHParser {
	html: string;
	entries: Array<string>;
	constructor(html: string) {
		var cheerio: CheerioAPI = require('cheerio');
		this.html = html
		var $ = cheerio.load(this.html);
		var ent: Array<string> = [];
		$('.c5a').each(function(i, elem) { ent.push($(this).text().toString()) });
	}
}
//export = WHParser

