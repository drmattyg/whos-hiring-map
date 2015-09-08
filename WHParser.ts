/// <reference path='typings/cheerio/cheerio.d.ts' />
import cheerio = require('cheerio');
class WHParser {
	html: string;
	//	parser: HtmlParser.Parser;
	//	handler: HtmlParser.Handler;
	constructor(html: string) {
		this.html = html
		var $ = cheerio.load(this.html)
		$('.c5a').each(function(i, elem) { console.log($(this).text()); });

	}
}
export = WHParser;