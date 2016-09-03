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

slapp.message('start', (msg) => {
	console.log('getting streams')
	if(streamers.length > 0) {
		streamers.forEach(function(streamer, index) {
			twitch.getChannelStream(streamer.name, function(err, body) {
				if (err) {
					console.log(err);
				} else if (body.stream) {
					if (streamers[index].streaming == false) {
						msg.say(body.stream.channel.display_name + ' is playing ' + body.stream.game + '.' + ' Stream: ' + body.stream.channel.url);
						streamers[index].streaming = true
					}
				} else if (streamers[index].streaming == true ) {
					streamers[index].streaming = false
				}
			});
		});
	} else {
		console.log('no streamers!')
	}
}, 50000);

slapp.command('/add', /.*/, (msg, text) => {
	var streamer = {name: text.trim().toLowerCase(), streaming: false}
	console.log(streamer);
	if(streamers.length > 0) {
		streamers.forEach(function(name, index) {
			if (name.name == text.trim().toLowerCase()) {
				msg.say('Im already watching' + text + '!')
				return;
			} else if (index == streamers.length - 1) {
				streamers.push(streamer)
				msg.respond('Awesome! Now Im watching ' + text)
				console.log('added streamer: ' + streamer.name);
			}
		});
	} else {
		streamers.push(streamer)
		msg.respond('Awesome! Now Im watching ' + text)
		console.log('added streamer: ' + streamer.name);
	}
   	console.log(streamers);
})

slapp.command('/delete', /.*/, (msg, text) => {
	var streamer = text.trim().toLowerCase()
	console.log(streamer);
	if(streamers.length > 0) {
		streamers.forEach(function(name, index) {
			if (name.name == streamer) {
				msg.say('Sad to see ' + streamer + ' go :(')
				streamers.splice(index, 1);
				return;
			} else if (index == streamers.length - 1) {
				msg.say('w00t I couldnt find ' + streamer + ' !??')
			}
		});
	} else {
		msg.say('w00t I couldnt find ' + streamer + ' !??')
	}
   	console.log(streamers);
})

slapp.command('/list', (msg) => {
	if(streamers.length > 0) {
		streamers.forEach(function(name, index) {
			twitch.getChannelStream(name.name, function(err, body) {
				if (err) {
					console.log(err);
				} else if (body.stream) {
					msg.say(body.stream.channel.display_name + ' is playing ' + body.stream.game + '.' + ' Stream: ' + body.stream.channel.url);
				} else {
					msg.say(body.stream.channel.display_name + ' is offline');
				}
			});
		});
	} else {
		msg.respond('no streamers on my watch!')
	}
})		

require('beepboop-slapp-presence-polyfill')(slapp, { debug: true })
require('./flows')(slapp)
var app = slapp.attachToExpress(express())

app.get('/', function (req, res) {
  res.send('Hello')
})

console.log('Listening on :' + process.env.PORT)
app.listen(process.env.PORT)
