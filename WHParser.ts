/// <reference path='typings/htmlparser2/htmlparser2.d.ts' />
import HtmlParser = require('htmlparser2');

class WHParser {
	html : string;
	parser: HtmlParser.Parser;
	constructor(html : string) {
		this.html = html
		this.parser = new HtmlParser.Parser({
			onopentag: function(name, attribs) {
				console.log(name);
			}

		});
	}
}