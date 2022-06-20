const { readdirSync, statSync } = require('fs');

let folders = readdirSync(__dirname).filter(f => statSync(`${__dirname}/${f}`).isDirectory());

let files = readdirSync(__dirname).filter(f => f.endsWith('.js') && f !== 'index.js');

let b = {};

folders.forEach(f => {
	b[f] = readdirSync(`${__dirname}/${f}`);
});

files.forEach(f => {
	b[f.split('.')[0]] = require(`${__dirname}/${f}`);
});

module.exports = b;