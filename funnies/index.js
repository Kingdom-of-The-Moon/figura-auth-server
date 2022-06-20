const { readdirSync, readdir } = require('fs');

let folders = readdirSync(__dirname).filter(f => f !== 'index.js');

let b = {};

folders.forEach(f => {
	b[f] = readdirSync(`${__dirname}/${f}`);
});

module.exports = b;