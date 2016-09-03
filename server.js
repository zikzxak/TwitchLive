'use strict'
const express = require('express')
const Slapp = require('slapp')
const BeepBoopConvoStore = require('slapp-convo-beepboop')
const BeepBoopContext = require('slapp-context-beepboop')
const axios = require('axios')
const TwitchApi = require('twitch-api')
if (!process.env.PORT) throw Error('PORT missing but required')

var slapp = Slapp({
  record: 'out.jsonl',
  convo_store: BeepBoopConvoStore(),
  context: BeepBoopContext()
})

var twitch = new TwitchApi({})

var streamers = []

slapp.message('streamers', (msg) => {
	console.log('getting streams for ' + streamers)
	twitch.getChannelStream('ESL_CSGO', function(err, body) {
		if (err) {
			console.log(err);
		} else {
			console.log(body.stream);
		}
	});
/**	axios.get('https://api.twitch.tv/kraken/streams?channel=' + streamers)
		.then(function (response) {
			if(response.data.streams[0]) {
				console.log('found streams');
				console.log(response.data);
				msg.say(response.data.streams[0].name)
			} else {
				console.log('no streamers')
			}
		})
		.catch(function (error) {
			console.log(error);
		}) **/
})

slapp.command('/add', /.*/, (msg, text) => {
	streamers = streamers.concat(','+ text);
   	msg.respond('Awesome! Now Im watching ' + text)
   	console.log(streamers);
})

require('beepboop-slapp-presence-polyfill')(slapp, { debug: true })
require('./flows')(slapp)
var app = slapp.attachToExpress(express())

app.get('/', function (req, res) {
  res.send('Hello')
})

console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)
