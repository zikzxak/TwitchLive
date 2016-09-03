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
	console.log('getting streams')
	if(streamers.length > 0) {
		streamers.forEach(function(streamer) {
			twitch.getChannelStream(streamer, function(err, body) {
				if (err) {
					console.log(err);
				} if (body.stream) {
					msg.say(body.stream.channel.display_name + 'is playing ' + body.stream.game + '.' + 'Stream: ' + body.stream.channel.url);
				} else {
					msg.say('Im sorry theres no active streamers. Maybe you should stream your own? ;)')
				}
			});
		});
	} else {
		msg.say('no streamers!')
	}
});

slapp.command('/add', /.*/, (msg, text) => {
	streamers.push(text)
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
