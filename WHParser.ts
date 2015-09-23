/// <reference path='typings/cheerio/cheerio.d.ts' />
/// <reference path='typings/q/Q.d.ts' />
/// <reference path='typings/leaflet/leaflet.d.ts' />
// using https://gist.github.com/kristopolous/19260ae54967c2219da8 as reference for parsing



import NC = require('./NERClient');
import Config = require('./Config');

// why do it the hard way when someone already did the work for you?
var geocoder = require('simple-bing-geocoder')
import Q = require('q');
var qlimit = require('qlimit'); // no tsd for qlimit

export class GeoPoint {
	latitude: number;
	longitude: number;
	constructor(lat: number, lon: number) { this.latitude = lat; this.longitude = lon; }
	key() : string {
		return this.latitude.toString() + ":" + this.longitude.toString();
	}
}

export class WHEntry {
	html: string;
	header: string;
	geolocation: GeoPoint;
	geoName: string;
	parent: WHParser;
	

	constructor(html: string) {
		var d : Array<string> = html.split(/(<p>|\n)/);

		this.header = d[0]
		this.html = html.replace(this.header, "")

	}


}
export class WHParser {
	html: string;
	entries: Array<WHEntry> = [];
	nerClient: NC.NERClient;
	bingKey: string;
	MAX_GEOCODER_TRIES: number = 3;
	config: any = Config.readConfig();
	limit = qlimit(this.config.bing.max_connections);
	geocodeEntryPromise: any = Q.nbind(this.geocodeEntry, this);
	locationMap: WHEntry[][] = [];

	cityStateRegex: RegExp = /\b([A-Z]\w+(?:\s[A-Z]\w*)?,?\s?(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|AB|BC|MB|NB|NL|NS|ON|PE|QC|SK))\b/;
	constructor(html: string, client: NC.NERClient, geocoderApiKey: string) {
		var cheerio: CheerioAPI = require('cheerio');
		this.html = html
		this.nerClient = client;
		this.bingKey = geocoderApiKey;
		if (!html) return; // this is a case used for testing
		var $ = cheerio.load(this.html);
		$('.c5a,.cae,.c00,.c9c,.cdd,.c73,.c88').each((i: number, elem: CheerioElement) => { 
			var entry : WHEntry = new WHEntry($(elem).html())
			this.addEntry(entry);

			
		});
			
	}

	geocodeEntries(callback : () => void) : void {

		Q.all<WHEntry>(<Q.IPromise < WHEntry > []>
			this.entries.map(this.limit(
				(e: WHEntry) => { 
					return this.geocodeEntryPromise(e);
				}
				))).done(
					(values: WHEntry[]) => {
					 callback() 
				});
	}

	// for testing
	static getEmptyInstance(client: NC.NERClient, geocoderApiKey: string): WHParser {
		var whp : WHParser = new WHParser(null, client, null)
		whp.bingKey = geocoderApiKey;
		whp.html = null;
		return whp;
	}


	geocodeEntry(entry: WHEntry, callback: () => void) : void {
		// first, try the simple city/state regex
		var locationName : string = null
		var m: RegExpMatchArray = entry.header.match(this.cityStateRegex) //(/\b([\w\s]*?, \w\w)/);
		if(m) {
			locationName = m[0]
			entry.geoName = locationName;
			this.geocodeString(locationName, this.MAX_GEOCODER_TRIES, (p: GeoPoint) => { 
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
				entry.geoName = locationName
				if(entry.geoName.toLowerCase() == "bay area") {
					// special case for HN; Bing geocodes this to Texas, but YC HN almost certainly means SF Bay Area
					entry.geolocation = new GeoPoint(37.442548, -122.162158);
					callback();
					return;
				}
				this.geocodeString(locationName, this.MAX_GEOCODER_TRIES, (p: GeoPoint) => {
					entry.geolocation = p;
					callback();
				});
			} else {
				entry.geolocation = null;
				callback();
			}
		});
	}



	geocodeString(value : string, maxTries: number, callback : (GeoPoint) => void) : void {
		try {
			if (maxTries < 0) {
				callback(null);
				return;
			}
			geocoder.geocode(value, (err: any, data: any) => {
				if (err != null) {
					console.log("Retrying")
					this.geocodeString(value, maxTries - 1, callback);
					return;
				}
				var rs = data.resourceSets[0]
				if (rs.estimatedTotal == 0) {
					if (maxTries < 0) {
						console.log("Failed for " + value);
						callback(null);
						return;
					} else {
						this.geocodeString(value, maxTries - 1, callback);
						return;
					}
				}

				// unpacking all the crap from Bing
				var coords = rs.resources[0].geocodePoints[0].coordinates
				var p: GeoPoint = new GeoPoint(coords[0], coords[1]);
				callback(p);
			}, { key: this.bingKey });
		} catch(ex) {
			if(maxTries < 0) { 
				callback(null);
				return;
			} else {
				this.geocodeString(value, maxTries - 1, callback);
				return;
			}
		}
	}

	addEntry(entry : WHEntry) : void {
		this.entries.push(entry);
		if (entry.geolocation == null) return;
		var entryList : WHEntry[] = this.locationMap[entry.geolocation.key()]
		if(!entryList) {
			entryList = [];
			this.locationMap[entry.geolocation.key()] = entryList;
		}
		entryList.push(entry);

	}

}
//export = WHParser

