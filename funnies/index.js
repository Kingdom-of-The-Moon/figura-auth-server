const { readdirSync, statSync } = require('fs');

let folders = readdirSync(__dirname).filter(f => statSync(`${__dirname}/${f}`).isDirectory());

let files = readdirSync(__dirname).filter(f => f.endsWith('.js'));

let b = {};

folders.forEach(f => {
	b[f] = readdirSync(`${__dirname}/${f}`);
});

files.forEach(f => {
	b[f] = require(`${__dirname}/${f}`);
});

module.exports = b;