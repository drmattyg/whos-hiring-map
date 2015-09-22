/// <reference path='typings/node/node.d.ts' />

import net = require("net")

export class NEREntity {

	name: string;
	isLocation: boolean;
}

export class NERClient {
	port: number;
	host: string;
	callback: (entities: Array<NEREntity>) => void;
	reEntString: RegExp = /(.*?)\/(.*)$/;
	constructor(port: number, host: string ) {
		this.port = port;
		this.host = host;
	}

	processResults(result: string): Array<NEREntity> {
		var entities: Array<NEREntity> = result.trim().split(/\s+/).map((value: string) => {
			var e = new NEREntity()
			var m: RegExpMatchArray = value.match(this.reEntString);
			if (m === null || m.length != 3) { throw "Invalid input from NER" }
			if (m[2] === "LOCATION") {
				e.isLocation = true
			} else {
				e.isLocation = false
			}
			e.name = m[1]
			return e;
		});
		var coalescedEntities: Array<NEREntity> = new Array<NEREntity>();
		var wasLocation: boolean = false;
		entities.forEach(function(e: NEREntity, ix: number) {
			if (ix != 0 && e.isLocation && coalescedEntities[coalescedEntities.length - 1].isLocation) {
				var previous: NEREntity = coalescedEntities.pop();
				previous.name = previous.name + " " + e.name
				coalescedEntities.push(previous)

			} else {
				coalescedEntities.push(e)
			}
		});
		return coalescedEntities;

	}

	query(text: string, callback: (entities: Array<NEREntity>) => void): void {
		if (text[text.length - 1] != "\n") { text = text + "\n"; }
		var client: net.Socket = net.connect({ port: this.port, host: this.host, function() { client.write(text + "\n"); } });
		var result: string = null;
		client.on("data", (data) => {
			var queryResult : string = data.toString();
			callback(this.processResults(queryResult));
		});
		client.on("end", () => {
		});
		client.write(text);
		return;
	}

	// Stole this from here: http://stackoverflow.com/questions/280634/endswith-in-javascript
	endsWith(input: string, suffix: string) : boolean {
		return input.indexOf(suffix, input.length - suffix.length) !== -1;
	}




}