/// <reference path='typings/node/node.d.ts' />

import net = require('net')

export class NEREntity {

	name: string;
	isLocation: boolean;
}

export class NERClient {
	port: number;
	host: string;
	callback: (entities: Array<NEREntity>) => void;
	queryResult: string;
	constructor(port: number, host: string ) {
		this.port = port;
		this.host = host;
	}

	query(text: string, callback: (entities: Array<NEREntity>) => void): void {
		if (text[text.length - 1] != '\n') { text = text + "\n"; }
		var client: net.Socket = net.connect({ port: this.port, host: this.host, function() { client.write(text + "\n"); } });
		var result: string = null;
		client.on('data', function(data) {
			this.queryResult = data.toString();
		});
		client.on('end', function() {
			// test data here; here's where we'll do the actual data processing
			var entities: Array<NEREntity> = new Array<NEREntity>();
			var e: NEREntity = new NEREntity();
			e.name = "San Francisco";
			e.isLocation = true;
			entities.push(e);
			callback(entities);
			

		});
		client.write(text);
		return;
	}

	var 

}