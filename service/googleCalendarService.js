const {google} = require('googleapis');

module.exports.listEvents = function (auth) {
    console.log('Accessing google calendar');
    const calendar = google.calendar({version: 'v3', auth});
    calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const events = res.data.items;
      if (events.length) {
        console.log('Upcoming 10 events:');
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date;
          console.log(`${start} - ${event.summary}`);
        });
        return events;
      } else {
        console.log('No upcoming events found.');
      }
    });
  }

module.exports.addEvent = function(auth, data){
  console.log(data);
  const eventEndTime = new Date();
  eventEndTime.setDate(eventEndTime.getDay() + 2);
  eventEndTime.setMinutes(eventEndTime.getMinutes() + 45);
  const calendar = google.calendar({version: 'v3', auth});
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
}