/// <reference path='typings/htmlparser2/htmlparser2.d.ts' />
import HtmlParser = require('htmlparser2');
declare var hp;
class WHParser {
	html : string;
	parser: HtmlParser.Parser;
	handler: HtmlParser.Handler;
	constructor(html : string) {
		this.html = html
		hp = HtmlParser; // working around some wonkiness with the class declaration here that I don't get
		this.handler = new hp.DomHandler(function(error, dom) { 
			this.getJobEntries(dom);
		});
		this.parser = new HtmlParser.Parser(this.handler);
		this.parser.done();
	}

	getJobEntries(dom) {
		console.log(dom);
	}
}