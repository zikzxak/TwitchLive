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
 
var twitch = new TwitchApi({
    clientId: '4qo5p3oajp806sgom70b74a7ishhypp',
    clientSecret: '6226c98t6twgkp8eaz8qiy3nubozx7h',
    redirectUri: 'https://beepboophq.com'
});
 
var streamers = [
        {name: 'tissukka', streaming: false},
        {name: 'kyklis', streaming: false},
        {name: 'repostmies', streaming: false},
        {name: 'dunlimited', streaming: false},
        {name: 'hauskis', streaming: false},
        {name: 'teinij', streaming: false},
        {name: 'zergburg', streaming: false}
]
 
var monitoringInterval = null;
 
slapp.message('goodnight', ['direct_mention', 'direct_message'], (msg) => {
  msg.say('sweet dreams :crescent_moon: ')
})
 
slapp.command('/monitor', /^\s*start\s*$/, (msg) => {
    msg.say('Im watching you... :maki:')
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
						            text: body.stream.game,
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
    msg.say('Im no longer monitoring streams :sob: I have no reason to exist :sob:')
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
        msg.say('New streamer added! Now Im looking after ' + text + ' :sleuth_or_spy:')
        console.log('added streamer: ' + newStreamer.name);
    }
 
    console.log(streamers);
})
 
slapp.command('/delete', /.*/, (msg, text) => {
    const streamerName = text.trim().toLowerCase();
    console.log(streamerName);
 
    //find function to search array
    function findStreamer(streamer) {
        return streamer.name === streamerName;
    }
 
    //Get index of the streamer we are deleting
    const streamerIndex = streamers.findIndex(findStreamer);
 
    //If streamer is in array delete, else error.
    if(streamerIndex !== -1){
        msg.say('Im no longer looking after ' + streamerName + ' :sob:')
        streamers.splice(streamerIndex, 1);
    } else {
        msg.respond('w00t I couldnt find ' + streamerName + ' !??');
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