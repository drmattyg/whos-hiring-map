/// <reference path='typings/cheerio/cheerio.d.ts' />
// /// <reference path='typings/q/Q.d.ts' />
// using https://gist.github.com/kristopolous/19260ae54967c2219da8 as reference for parsing



import NC = require('./NERClient')

// why do it the hard way when someone already did the work for you?
var geocoder = require('simple-bing-geocoder')
//import Q = require('q')

export class GeoPoint {
	latitude: number;
	longitude: number;
}

export class WHEntry {
	html: string;
	header: string;
	geolocation: GeoPoint;
	cityStateRegex: RegExp = /\b([\w\s]*?, \w\w)/;

	constructor(html: string) {
		this.html = html;
		this.header = html.split(/(<p>|\n)/)[0]

	}





}
export class WHParser {
	html: string;
	entries: Array<WHEntry> = [];
	nerClient: NC.NERClient;
	bingKey: string;
	constructor(html: string, client: NC.NERClient, geocoderApiKey: string) {
		var cheerio: CheerioAPI = require('cheerio');
		this.html = html
		this.nerClient = client;
		this.bingKey = geocoderApiKey;
		if (!html) return; // this is a case used for testing
		var $ = cheerio.load(this.html);
		$('.c5a,.cae,.c00,.c9c,.cdd,.c73,.c88').each((i: number, elem: CheerioElement) => { 
			var entry : WHEntry = new WHEntry($(elem).html())
			if (geocoderApiKey) {
				this.geocodeEntry(entry, () => {
					console.log(entry.header);
					console.log(entry.geolocation);
					this.entries.push(entry);
				});
			} else {
				this.entries.push(entry);
			}
			
		});
			
	}

	
	

	geocodeEntry(entry: WHEntry, callback: () => void) : void {
		// first, try the simple city/state regex
		var locationName : string = null
		var m: RegExpMatchArray = entry.header.match(/\b([\w\s]*?, \w\w)/);
		if(m) {
			locationName = m[0]
//			console.log(locationName);
			this.geocodeString(locationName, (p: GeoPoint) => { 
				entry.geolocation = p; 
				callback(); 
			});
			return;
		}
		this.nerClient.query(entry.header.replace(/,\s?/, " "), (entities: NC.NEREntity[]) => {
			var locations: NC.NEREntity[] = entities.filter((e: NC.NEREntity) => { return e.isLocation });
			var locationName : string = "NOWHERE"
			if (locations.length > 0) { 
				locationName = locations[0].name; 
				this.geocodeString(locationName, (p: GeoPoint) => {
					entry.geolocation = p;
					callback();
				});
			} else {
				entry.geolocation = null;
				callback();
			}
		});
	}



	geocodeString(value : string, callback : (GeoPoint) => void) : void {
		geocoder.geocode(value, (err: any, data: any) => {
			var rs = data.resourceSets[0]
			if (rs.estimatedTotal == 0) { callback(null); }

			// unpacking all the crap from Bing
			var coords = rs.resources[0].geocodePoints[0].coordinates
			var p: GeoPoint = new GeoPoint();
			p.latitude = coords[0]
			p.longitude = coords[1]
			callback(p);
		}, { key: this.bingKey });
	}

}
//export = WHParser

