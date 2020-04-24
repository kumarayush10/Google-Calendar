const express = require('express');
const { google } = require('googleapis');
const keys = require('./config/keys');
const googleCalendarService = require('./service/googleCalendarService');
var bodyParser = require('body-parser');

var app = express();

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.listen(8080, function(){
    console.log('App is listening at port 8080');
});

const scopes = [
    'https://www.googleapis.com/auth/calendar.events'
  ];

var oAuth = google.auth.OAuth2;
var oauth2Client = new oAuth(
    keys.google.clientID,
    keys.google.clientSecret,
    'http://localhost:3000/auth/google/redirect'
);

const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
  
    // If you only need one scope you can pass it as a string
    scope: scopes
});

//Default landing page
app.get('/', function(req, res){
    console.log('Home request');
    res.render('home.ejs');
});

app.get('/auth/google', function(req, res){
    console.log('Now authenticating with user');
    console.log(url);
    res.redirect(url);
});


app.get('/auth/google/redirect', function(req, res){
    console.log(req.query.code);
    // This will provide an object with the access_token and refresh_token.
    // Save these somewhere safe so they can be used at a later time.
    console.log('Chaloo');
    oauth2Client.getToken(req.query.code, function(err, tokens){
        if(err){
            console.log('Error');
            console.log(err);
            return;
        }
        console.log('Setting credentials');
        console.log(err);
        console.log('First showing tokens');
        console.log(tokens);
        oauth2Client.setCredentials(tokens);
        console.log('Credentials set');
    });
    res.render('dashboard.ejs');
});

app.get('/google/events', function(req, resWeb){
    console.log('Accessing google calendar');
    const calendar = google.calendar({version: 'v3', auth: oauth2Client});
    calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) { 
        resWeb.send('The API returned an error: ' + err);
        return console.log('The API returned an error: ' + err);
      }
      const events = res.data.items;
      if (events.length) {
        console.log('Upcoming 10 events:');
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date;
          console.log(`${start} - ${event.summary}`);
        });
        resWeb.send(events);
      } 
      else {
        console.log('No upcoming events found.');
        resWeb.send('No upcoming events found');
      }
    });
});

app.get('/google/add', function(req, res){
    res.render('add.ejs');
});

app.post('/addEvent', urlencodedParser, function(req, res){
    console.log('Adding event');
    const eventEndTime = new Date();
    eventEndTime.setDate(eventEndTime.getDay() + 2);
    eventEndTime.setMinutes(eventEndTime.getMinutes() + 45);
    const calendar = google.calendar({version: 'v3', oauth2Client});
    const event = {
        summary: data.title,
        description: data.description,
        start: {
          dateTime: eventEndTime,
          timeZone: 'America/Denver',
        },
        end: {
          dateTime: eventEndTime,
          timeZone: 'America/Denver',
        },
    }
    calendar.events.insert({
      auth: auth,
      calendarId: 'primary',
      resource: event,
    }, function(err, event){
      if(err){
        console.log(err);
        return;
      }
      console.log('Event Created');
    });
    res.render('addSuccess.ejs');
});
