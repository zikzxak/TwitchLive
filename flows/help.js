'use strict'

module.exports = (slapp) => {

  let help = `Twitchy will let you know when your favorite streamers are online.

Commands:

\`\`\`
/add [channel]
\`\`\`

\`\`\`
/remove [channel]
\`\`\`

\`\`\`
/list
\`\`\`

\`\`\`
/monitor start
\`\`\`

\`\`\`
/monitor stop
\`\`\`

`

  slapp.command('/twitchy', /^\s*help\s*$/, (msg) => {
    msg.respond(help)
  })

  slapp.message('help', ['direct_mention', 'direct_message'], (msg, text) => {
    msg.say(help)
  })

  slapp.event('bb.team_added', function (msg) {
    slapp.client.im.open({ token: msg.meta.bot_token, user: msg.meta.user_id }, (err, data) => {
      if (err) {
        return console.error(err)
      }
      let channel = data.channel.id

      msg.say({ channel: channel, text: 'Thanks for adding me to your team!' })
      msg.say({ channel: channel, text: help })
    })
  })
}
