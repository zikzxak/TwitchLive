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
 
var monitoringInterval = null;
 
slapp.message('goodnight', ['direct_mention', 'direct_message'], (msg) => {
  msg.say('sweet dreams :crescent_moon: ')
})
 
slapp.command('/monitor', /^\s*start\s*$/, (msg) => {
    msg.say('Started monitoring streams!')
    console.log('getting streams')
    function getStreams() {
        console.log('monitoring...');
        //no streamers
        if(!streamers.length){
            return;
        }
 
        streamers.forEach(function(streamer, index) {
            console.log(streamer.name + ': ' + streamer.streaming);
            twitch.getChannelStream(streamer.name, function(err, body) {
                if (err) {
                    console.log(err);
                } else if (body.stream) {
                    if (streamers[index].streaming === false) {
                        msg.say({
                        	text: '',
                        	attachments: [
                        		{
						            fallback: body.stream.channel.display_name + ' is playing ' + body.stream.game + '.' + ' Stream: ' + body.stream.channel.url,
									pretext: body.stream.channel.url,
						            color: "#36a64f",
						            author_name: body.stream.channel.status,
						            author_link: body.stream.channel.url,
						            title: body.stream.channel.display_name + ' is streaming!',
						            title_link: body.stream.channel.url,
						            text: 'Game: ' + body.stream.game,
									thumb_url: body.stream.preview.small
						        }
                        	]
                        })
                        streamers[index].streaming = true
                    }
                } else if (streamers[index].streaming === true ) {
                    streamers[index].streaming = false
                }
            });
        });
    }
 
    monitoringInterval = setInterval(getStreams, 30000);
    getStreams();
});
 
slapp.command('/monitor', /^\s*stop\s*$/, (msg) => {
    //no timeout, dont clear
    if(!monitoringInterval){
        return;
    }
 
    clearTimeout(monitoringInterval);
    monitoringInterval = null;
    msg.say('Im no longer monitoring streams :sob:')
});
 
slapp.command('/add', /.*/, (msg, text) => {
    var newStreamer = {name: text.trim().toLowerCase(), streaming: false}
    console.log(newStreamer);
 
    //find function to search array
    function findStreamer(streamer) {
        return streamer.name === newStreamer.name;
    }
 
    //If streamer is in array, error, else add to array
    if(streamers.find(findStreamer)){
        msg.respond('Im already watching ' + text + '!');
    } else {
        streamers.push(newStreamer)
        msg.say('Awesome! Now Im watching ' + text)
        console.log('added streamer: ' + streamer.name);
    }
 
    console.log(streamers);
})
 
slapp.command('/delete', /.*/, (msg, text) => {
    var streamer = text.trim().toLowerCase()
    console.log(streamer);
    if(streamers.length > 0) {
        streamers.forEach(function(name, index) {
            if (name.name === streamer) {
                msg.say('Sad to see ' + streamer + ' go :(')
                streamers.splice(index, 1);
                return;
            } else if (index === streamers.length - 1) {
                msg.respond('w00t I couldnt find ' + streamer + ' !??')
            }
        });
    } else {
        msg.respond('w00t I couldnt find ' + streamer + ' !??')
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
                    msg.respond(body.stream.channel.display_name + ' is playing ' + body.stream.game + '.' + ' Stream: ' + body.stream.channel.url);
                } else {
                    msg.respond(name.name + ' is offline');
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