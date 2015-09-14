/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/assert/assert.d.ts" />
import assert = require('assert');
import NERClient = require('./NERClient');

describe("Simple test 1", () => {
	it('Tests that Grunt/Mocha tests are functioning', () => {
		var n: number = 2 + 3;
		assert.equal(n, 5);
	});
});

describe("NERClient tests", () => {
	describe("NERClient simple location test", () => {
		var testPhrase: string = "I used to live in Chicago but I don't live there anymore"
		it("Tests the phrase '" + testPhrase + "'", (done) => {
			var nc: NERClient.NERClient = new NERClient.NERClient(9191, "localhost");
			nc.query(testPhrase, (entities: Array<NERClient.NEREntity>) => {
				console.log(entities);
				done();
			});
		});
	});
});