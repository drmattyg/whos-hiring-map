/// <reference path='typings/cheerio/cheerio.d.ts' />

// using https://gist.github.com/kristopolous/19260ae54967c2219da8 as reference for parsing



//	import cheerio = require('cheerio');
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
	entries: Array<WHEntry>;
	constructor(html: string) {
		var cheerio: CheerioAPI = require('cheerio');
		this.html = html
		var $ = cheerio.load(this.html);
		var ent: Array<WHEntry> = [];
		$('.c5a').each(function(i, elem) { 
			console.log($(this));
			var entry : WHEntry = new WHEntry($(this).html())
			ent.push(entry) 
		});
		this.entries = ent;
	}
}
//export = WHParser

