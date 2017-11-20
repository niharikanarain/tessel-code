'use strict';

// Import the interface to Tessel hardware
const tessel = require('tessel');
var climatelib = require('climate-si7020');
var climate = climatelib.use(tessel.port['B']);
var rfidlib = require('rfid-pn532');
var rfid = rfidlib.use(tessel.port['A']);
var twitter = require('twitter');

// Turn one of the LEDs on to start.
tessel.led[2].on();

var twitterHandle = '@FiveSickSeven8';

var twit = new twitter({
  consumer_key: 'kxAGHN5SQ4R0vHUfWil4CGESt',
  consumer_secret: 'T9t6B11NfF7dhROAUuOtLrZvA6xi1MJj7BUBALo9l6malbHGkv',
  access_token_key: '932731139323768834-zjx2ALTXlkoo4UHumvHxgslqAL9mTKj',
  access_token_secret: '52Jww43eYwRe4JMqWI7ZLrZrjT4X7JgrrOHzCuldqLrBC'
});

climate.on('ready', function () {
  console.log('Connected to climate module');
})

const climateObj = {};

let coldGifs = [`https://gph.is/1ZyNSqU`, `https://gph.is/1Srrbkz`, `https://gph.is/1bh3wZ1`]
let warmGifs = [`https://gph.is/28OGOz2`, `https://gph.is/1h5IiC1`, `https://gph.is/1uJ4ZHw`]
let humidIncGifs = [`https://gph.is/2u1kfR4`, `https://gph.is/1eTxFri`]
let humidDecGifs = [`https://gph.is/1WpeiHM`, `https://gph.is/2p5HbPQ`, `https://gph.is/2cpryy5`]
  // Loop forever
setImmediate(function loop () {
  climate.readTemperature('f', function (err, temp) {
    if (err) return console.error(err)
    if (!climateObj.temp){
      climateObj.temp = temp;
    }
    if (temp > climateObj.temp + 2 || temp < climateObj.temp - 2){
      let tempGif
      if (temp > climateObj.temp + 2) tempGif = warmGifs[Math.floor(Math.random() * warmGifs.length)]
      if (temp < climateObj.temp - 2) tempGif = coldGifs[Math.floor(Math.random() * coldGifs.length)]
      let status = `TesselBot Auto-Update! -- New Temperature: ${Math.round(temp)}F ${tempGif}`;
      twit.post('statuses/update', {status: status}, function(error, tweet, response){
        if (error) {
          console.log('error sending tweet:', error);
        } else {
          console.log('Successfully tweeted! Tweet text:', tweet.text);
        }
      });
      climateObj.temp = temp;
    }
    climate.readHumidity(function (err, humid) {
      if (err) return console.error(err)
      if (!climateObj.humid){
        climateObj.humid = humid;
      }
      if (humid > climateObj.humid + 2 || humid < climateObj.humid - 2){
        let humidGif
        if (humid > climateObj.humid + 2) humidGif = humidIncGifs[Math.floor(Math.random() * humidIncGifs.length)]
        if (humid < climateObj.humid - 2) humidGif = humidDecGifs[Math.floor(Math.random() * humidDecGifs.length)]
        let status = `TesselBot Auto-Update! -- New Humidity: ${Math.round(temp)}%RH ${humidGif}`;
        twit.post('statuses/update', {status: status}, function(error, tweet, response){
          if (error) {
            console.log('error sending tweet:', error);
          } else {
            console.log('Successfully tweeted! Tweet text:', tweet.text);
          }
        });
        climateObj.humid = humid;
      }
      if (!climateObj.humid){
        climateObj.humid = humid;
      }
    console.log('Degrees:', temp.toFixed(4) + 'F', 'Humidity:', humid.toFixed(4) + '%RH');
    setTimeout(loop, 5000);
    });
  });
});

climate.on('error', function(err) {
  console.log('error connecting module', err);
});

rfid.on('ready', function (version) {
  console.log('Ready to read RFID card');
  rfid.setPollPeriod(3000, err => {
    console.error(err)
  })
  rfid.on('data', function(card) {
    if (card.uid) {
      console.log('UID:', card.uid.toString('hex'));
      climate.readTemperature('f', function (err, temp) {
        if (err) return console.error(err)
        climate.readHumidity(function (err2, humid) {
        if (err2) return console.error(err2)
        let temperature = Math.round(temp.toFixed(4))
        let humidity = Math.round(humid.toFixed(4))
        let URLvariable = (temperature < 72) ? 'https://giphy.com/gifs/cat-kitten-kitty-YxA2PPkXbwRTa' : 'https://gph.is/1CJ2gxS'
        console.log('Degrees:', temperature + 'F', 'Humidity:', humidity + '%RH');
        var status = `TesselBot Weather report -- Degrees: ${temperature}F, Humidity: ${humidity} %RH ${URLvariable}`;
        twit.post('statuses/update', {status: status}, function(error, tweet, response){
          if (error) {
            console.log('error sending tweet:', error);
          } else {
            console.log('Successfully tweeted! Tweet text:', tweet.text);
          }
        });
        })
      })
    }
  });
})

rfid.on('error', function (err) {
  console.error(err);
})

climate.on('error', function(err) {
  console.log('error connecting module', err);
})
