'use strict'
const express = require('express')
const Slapp = require('slapp')
const BeepBoopConvoStore = require('slapp-convo-beepboop')
const BeepBoopContext = require('slapp-context-beepboop')
const axios = require('axios')
if (!process.env.PORT) throw Error('PORT missing but required')

var slapp = Slapp({
  record: 'out.jsonl',
  convo_store: BeepBoopConvoStore(),
  context: BeepBoopContext()
})

var streamers = 'tissukka'

var twitchGet = 'https://api.twitch.tv/kraken/streams?channel='+streamers

slapp.message('streamers', (msg) => {
	setInterval(function () {
		console.log('getting streams...')
		axios.get(twitchGet)
			.then(function (response) {
				if(response.data.streams.length > 0) {
					msg.say(response.data.streams[0].name)
				} else {
					console.log('no streamers')
				}
				console.log(response);
			})
			.catch(function (error) {
				console.log(error);
			})
	}, 30000)
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
