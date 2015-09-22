import fs = require('fs')
import yaml = require('js-yaml');

export function readConfig(): any {
	return readConfigFromFile('./conf/config.yml');
}

export function readConfigFromFile(filename: string): any {
	return yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
}
