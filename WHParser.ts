/// <reference path='typings/cheerio/cheerio.d.ts' />
/// <reference path='typings/q/Q.d.ts' />
/// <reference path='typings/leaflet/leaflet.d.ts' />
// using https://gist.github.com/kristopolous/19260ae54967c2219da8 as reference for parsing



import NC = require('./NERClient')

// why do it the hard way when someone already did the work for you?
var geocoder = require('simple-bing-geocoder')
import Q = require('q')

export class GeoPoint {
	latitude: number;
	longitude: number;
}

export class WHEntry {
	html: string;
	header: string;
	geolocation: GeoPoint;
	geoName: string;
	

	constructor(html: string) {
		var d : Array<string> = html.split(/(<p>|\n)/);

		this.header = d[0]
		this.html = html.replace(this.header, "")

	}
/*
	toLeafletMarker() : L.Marker {
		var marker: L.Marker = new L.Marker([this.geolocation.latitude, this.geolocation.longitude]);
		marker.bindPopup("<b>" + this.header + "<b><p>" + this.html);
		return marker;
	}
*/


}
export class WHParser {
	html: string;
	entries: Array<WHEntry> = [];
	nerClient: NC.NERClient;
	bingKey: string;
	MAX_GEOCODER_TRIES: number = 3;
//	cityStateRegex: RegExp = /\b([A-Z]\w+(?:\s[A-Z]\w*)?\s+(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|AB|BC|MB|NB|NL|NS|ON|PE|QC|SK)\b)/;
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
			this.entries.push(entry);
			// if (geocoderApiKey) {
			// 	this.geocodeEntry(entry, () => {
			// 		this.entries.push(entry);
			// 	});
			// } else {
			// 	this.entries.push(entry);
			// }
			
		});
			
	}

	geocodeEntries(callback : () => void) : void {
		var promises: Array<Q.Promise<WHEntry>> = this.entries.map((entry: WHEntry) => {
			var deferred: Q.Deferred<WHEntry> = Q.defer<WHEntry>();
			this.geocodeEntry(entry, () => {
				deferred.resolve(entry);
			});
			return deferred.promise;
		});
		var resolvedEntries: WHEntry[]
		Q.all<WHEntry>(promises).done((values: WHEntry[]) => {
			callback();
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
					entry.geolocation = { latitude: 37.442548, longitude: -122.162158}
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
		if(maxTries < 0) {
			callback(null);
			return;
		}
		geocoder.geocode(value, (err: any, data: any) => {
			if(err != null) {
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
			var p: GeoPoint = new GeoPoint();
			p.latitude = coords[0]
			p.longitude = coords[1]
			callback(p);
		}, { key: this.bingKey });
	}

}
//export = WHParser

