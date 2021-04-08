const tmi = require('tmi.js');

// Conecta com a Twitch
const client = new tmi.Client({
	options: { debug: true },
    connection: {
        reconnect: true,
        secure: true
    },
    channels: []
});

client.connect();

module.exports = {
    client
}