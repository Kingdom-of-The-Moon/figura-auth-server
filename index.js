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

(async () => {
	await mongo.connect();
	console.log('MongoDB connected');
	await redis.connect();
	console.log('Redis connected');
})();

const server = mc.createServer({
	version: false,
	motd: 'figura auth server',
	port: 25565,
	onlineMode: true
});

server.on('login', async (client) => {
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

			if (user?.banned) return client.end(`banned.${user.banned}`);

			token = await redis.get(uuid);
			if (token) return client.end(`auth.${token}`);

			token = nanoid(10);
			redis.set(uuid, token, { EX: 60 });

			client.end(`auth.${token}`);
		});
	});
});