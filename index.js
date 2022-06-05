const { MongoClient } = require('mongodb');
const { createClient } = require('redis');
const mc = require('minecraft-protocol');
const https = require('https');
const { nanoid } = require('nanoid');

const mongo = new MongoClient('mongodb://admin:securePassword123@192.168.1.119:27017/?authMechanism=DEFAULT');
const redis = new createClient({
	host: '127.0.0.1',
	port: 6379
});

const EX = 300;

(async () => {
	await mongo.connect();
	await redis.connect();
	console.log('Figura auth server is online.');
})();

const server = mc.createServer({
	version: false,
	motd: 'figura auth server',
	port: 25565,
	encryption: false,
	onlineMode: true
});

server.on('login', async (client) => {
	console.log(`Getting auth token for ${client.username}`);

	// on disconnect
	client.on('end', async () => {
		console.log(`${client.username} disconnected`);
	});

	// get uuid of client from mojang api
	https.get('https://api.mojang.com/users/profiles/minecraft/' + client.username, (res) => {
		let data = '';
		res.on('data', (chunk) => {
			data += chunk;
		});
		res.on('end', async () => {
			const uuid = JSON.parse(data).id;
			const user = await mongo.db('figura').collection('users').findOne({ uuid });

			let token = null;

			if (user?.banned) return client.end(JSON.stringify({ type: 'banned', reason: user.banned }));

			token = await redis.get(uuid);
			if (token) console.log(`Authenticated ${client.username} with ${token}, closing connection. (cached token)`);
			if (token) return client.end(JSON.stringify({ type: 'auth', token: token }));

			token = nanoid(10);
			await redis.set(uuid, token, { EX });
			await redis.set(token, uuid, { EX });

			console.log(`Authenticated ${client.username} with ${token}, closing connection.`);

			client.end(JSON.stringify({ type: 'auth', token: token }));
		});
	});
});
