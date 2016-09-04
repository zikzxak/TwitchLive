'use strict'

const handleHowAreYou = 'chatter:handleHowAreYou'
const axios = require('axios')

module.exports = (slapp) => {

  slapp.message('^(hi|hello|hey)$', ['direct_mention', 'direct_message'], (msg, text) => {
    msg
      .say(text + ', how are you?')
      .route(handleHowAreYou, {}, 60)
  })

  slapp.route(handleHowAreYou, (msg) => {
    var resp = msg.body.event && msg.body.event.text

    if (new RegExp('good', 'i').test(resp)) {
      msg
        .say(['Great! Ready?', ':smile: Are you sure?'])
        .route(handleHowAreYou, 60)
    } else {
      msg.say('Me too')
    }
  })

  slapp.message('prh', ['direct_mention', 'direct_message'], (msg) => {

    var today = new Date();
    var dd = today.getDate()-1;
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
    dd='0'+dd
    }

    if(mm<10) {
        mm='0'+mm
    }
    today = yyyy+'-'+mm+'-'+dd;

    msg.say('Fetching companies...')
    var companies = 'New companies registered yesterday:' + '\n'
    axios.get('http://avoindata.prh.fi:80/tr/v1?totalResults=true&maxResults=200&resultsFrom=0&companyForm=OY&companyRegistrationFrom='+today+'&companyRegistrationTo='+today)
      .then(function (response) {
          response.data.results.forEach(function(company) {
            companies = companies.concat(company.name + '\n')
          })
      msg.say(companies)
    })
    .catch(function (error) {
      console.log(error)
    });
  })

  slapp.message('^(thanks|thank you)', ['mention', 'direct_message'], (msg) => {
    msg.say(['You are welcome', 'Of course'])
  })

}
