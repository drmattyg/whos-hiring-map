/// <reference path="typings/mocha/mocha.d.ts" />
/// <reference path="typings/assert/assert.d.ts" />
import assert = require('assert')
describe("Simple test", () => {
	describe("Simple test 1", () => {
		it('Should be really simple', () => {
			var n: number = 2 + 3;
			assert.equal(n, 5);
		});
	})
});