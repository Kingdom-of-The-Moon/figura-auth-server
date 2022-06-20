const { createClient } = require('redis');
const fetch = require('sync-fetch')
const mc = require('minecraft-protocol');
const fs = require('fs');
const { nanoid } = require('nanoid');

let e = s => Buffer.from(s).toString('base64');

const redis = new createClient({
	host: '127.0.0.1',
	port: 6379
});

let funnies = [
	'deez',
	'figua',
	'large cheese',
	'smart fran or fart smran',
	'burger',
	'hamburger'
];

let moreFunnies = fs.readdirSync('./funnies');

let beforePing = (res, client, cb) => {
	res.description.text = funnies[Math.floor(Math.random() * funnies.length)];
	let img = fs.readFileSync(`./funnies/${moreFunnies[Math.floor(Math.random() * moreFunnies.length)]}`);
	res.favicon = `data:image/png;base64,${e(img)}`;
	cb(null, res);
}

const EX = 300;

(async () => {
	await redis.connect();
	console.log('Figura auth server is online.');
})();

const server = mc.createServer({
	version: false,
	motd: 'figura auth server',
	host: '127.0.0.1',
	port: 25566,
	beforePing: beforePing,
	'online-mode': false
});

const uuidF = i=>i.substr(0,8)+"-"+i.substr(8,4)+"-"+i.substr(12,4)+"-"+i.substr(16,4)+"-"+i.substr(20);

server.on('login', async (client) => {
	const uuid = uuidF(fetch(`https://api.mojang.com/users/profiles/minecraft/${client.username}`).json().id);
	console.log(`Getting auth token for ${client.username} [${uuid}]`);

	let token = nanoid(20);
	await redis.set(token, uuid, { EX });

	console.log(`Authenticated ${client.username} with ${token}.`);

	client.end(token);
});
