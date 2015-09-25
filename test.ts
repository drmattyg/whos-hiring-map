/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/assert/assert.d.ts" />
/// <reference path="typings/q/Q.d.ts" />

import assert = require('assert');
import NERClient = require('./NERClient');
import WHP = require('./WHParser')
import fs = require('fs')
import yaml = require('js-yaml');
import Q = require('q')

var config: any = yaml.safeLoad(fs.readFileSync('./conf/config.yml', 'utf8'));
describe("Simple test 1", () => {
	it('Tests that Grunt/Mocha tests are functioning', () => {
		var n: number = 2 + 3;
		assert.equal(n, 5);
	});
});

describe("NERClient tests", () => {
	describe("NERClient simple location test", () => {
		var testPhrase1: string = "I used to live in Chicago but I don't live there anymore"
		var nc: NERClient.NERClient = new NERClient.NERClient(config.ner.port, config.ner.host);	
		it("Tests the phrase '" + testPhrase1 + "'", (done) => {

			nc.query(testPhrase1, (entities: Array<NERClient.NEREntity>) => {
				assert.equal(entities.length, 13);
				assert(
					entities.filter((e: NERClient.NEREntity) => { return e.name === 'Chicago'})[0].isLocation
					);
				assert.equal(entities.filter((e: NERClient.NEREntity) => { return e.name != 'Chicago' && e.isLocation }).length, 0
					);
				done();
			});
		});

		var testPhrase2: string = "I left my heart in San Francisco CA but my soul is in New Orleans";
		it("Tests coalescing entities", (done) => { 
			nc.query(testPhrase2, (entities: Array<NERClient.NEREntity>) => {
				var locations  : Array<NERClient.NEREntity> = entities.filter((e: NERClient.NEREntity) => { return e.isLocation });
				assert.equal(locations.length, 2);
				assert.notEqual(locations.filter((e) => { return e.name == "San Francisco CA" }), -1);
				assert.notEqual(locations.filter((e) => { return e.name == "New Orleans" }), -1);	
				done(); 	

			});


		});
	});
});

describe("WHParser tests", () => {
	var html: string = fs.readFileSync('data/aug_2015_subset.html', 'utf-8');
	var nc: NERClient.NERClient = new NERClient.NERClient(config.ner.port, config.ner.host);
	var whp: WHP.WHParser = WHP.WHParser.getEmptyInstance(nc, <string>config.bing.key);
	it("Tests geocoding city/state headers", (done) => {		
		var whe: WHP.WHEntry = new WHP.WHEntry("New York, NY; Full time; VISA; ONSITE only; Addepar<p>")

		whp.geocodeEntry(whe, () => {
			console.log(whe);
			assert.equal(whe.geolocation.latitude, 40.78200149536133);
			assert.equal(whe.geolocation.longitude, -73.83170318603516);
			done();
		});
	});

	it("Tests another city/state header", (done) => {
		var whe: WHP.WHEntry = new WHP.WHEntry("Headspring[http://www.headspring.com] | Onsite | Full-Time | VISA | Austin, Dallas and Houston, TX. Monterrey, Mexico.");
		whp.geocodeEntry(whe, () => {
			console.log(whe);
			assert.equal(whe.geolocation.latitude, 29.76045036315918);
			assert.equal(whe.geolocation.longitude, -95.36978149414062);
			done();
		});
	});
	it("Tests geocoding entity extracted headers", (done) => 
	{
		var whe: WHP.WHEntry = new WHP.WHEntry("Verbate | Sydney | Software Engineer | ONSITE")
		whp.geocodeEntry(whe, () => {
			console.log(whe);
			assert.equal(whe.geolocation.longitude, 151.2030029296875)
			assert.equal(whe.geolocation.latitude, -33.874000549316406)
			done();
		});
	});
	it("loads a file and extracts the headers", (mochaDone) => {
		var nc: NERClient.NERClient = new NERClient.NERClient(config.ner.port, config.ner.host);
		var whp: WHP.WHParser = new WHP.WHParser(html, nc, config.bing.key);
		whp.geocodeEntries(() => {
			assert.equal(whp.entries.length, 18);
			var geocodedEntries: WHP.WHEntry[] = whp.entries.filter((e: WHP.WHEntry) => { return e.geolocation != null; });
			geocodedEntries.forEach((e) => { console.log(e.header); console.log(e.geoName); console.log(e.geolocation); });
			assert.equal(geocodedEntries.length, 6);
			var g: WHP.GeoPoint = new WHP.GeoPoint(42.282100677490234, -83.74846649169922);
			assert.equal(geocodedEntries[5].geolocation.latitude, g.latitude);

			assert.equal(geocodedEntries[5].geolocation.longitude, g.longitude);

			mochaDone();
		});

	});
});

describe("Promise test", () => {
	it("Creates a promise from a geocode call", (mochaDone) => {
		var html: string = fs.readFileSync('data/aug_2015_subset.html', 'utf-8');
		var nc: NERClient.NERClient = new NERClient.NERClient(config.ner.port, config.ner.host);
		var whp: WHP.WHParser = WHP.WHParser.getEmptyInstance(nc, <string>config.bing.key);
		var whe: WHP.WHEntry = new WHP.WHEntry("New York, NY; Full time; VISA; ONSITE only; Addepar<p>")
		whp.addEntry(whe)
		whp.geocodeEntryPromise(whe).done(() => { console.log(whp.entries); mochaDone(); });
	});
});

describe("Location map test", () => {
	var html: string = fs.readFileSync('data/aug_2015_subset.html', 'utf-8');
	var nc: NERClient.NERClient = new NERClient.NERClient(config.ner.port, config.ner.host);
	var whp: WHP.WHParser = new WHP.WHParser(html, nc, config.bing.key);

	it("Adds several objects with the same location", (mochaDone) => {
		var whpWithDupes: WHP.WHParser = WHP.WHParser.getEmptyInstance(nc, null);
		whp.geocodeEntries(() => {
			assert.equal(Object.keys(whp.locationMap).length, 6);
			[5, 6, 7, 8, 9, 10, 5, 6, 7, 12, 13, 14, 12, 13, 14].forEach((n : number) => {
				whpWithDupes.addEntry(whp.entries[n]);
			})
			//console.log(whpWithDupes.entries);
			assert.equal(Object.keys(whpWithDupes.locationMap).length, 2);
			var k: string = Object.keys(whpWithDupes.locationMap)[0];
			assert.equal(whpWithDupes.locationMap[k].length, 2);
			// console.log(k);
			// console.log(whpWithDupes.locationMap)
			// test writing this to disk as well
			fs.writeFile("data/testoutput.js", JSON.stringify(whp.locationMap), (err) => {
				if (err) { throw "WTF?" }
				mochaDone();
			});

		})
		//var dupeEntry : WHP.WHEntry = new WHP.WHEntry()
	});

});

describe("File reading test", () => {
	it("reads the output from the previous test", () => {
		var input : string = fs.readFileSync("data/testoutput.js", "utf-8")
		var entryData = JSON.parse(input)
		var keySet = Object.keys(entryData);
		keySet.forEach((k: string) => {
			var d = k.split(/:/)
			var lat = d[0]
			var lon = d[1]
			console.log(lat + "," + lon);
			var entries: WHP.WHEntry[] = <WHP.WHEntry[]>entryData[k];
			// not a real test, was just testing this code that it compiles, etc
		});
	});
});