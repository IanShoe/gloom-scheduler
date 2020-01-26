const CronJob = require('cron').CronJob;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const dataService = require('./data-service');

async function main() {
  await dataService.initialize();

  const data = dataService.get();
  dataService.setWeeks(data.weeks);
  app.use(express.static('app'));

  io.on('connection', function(socket) {
    socket.on('weeks', function(weeks) {
      dataService.setWeeks(weeks).then(function() {
        io.emit('weeks', dataService.get().weeks);
      });
    });
    socket.on('init', function() {
      io.emit('weeks', dataService.get().weeks);
    });
  });

  http.listen(3000, function() {
    console.log('listening on port: 3000');
  });
  const job = new CronJob('0 0 0 1 * *', function() {
    dataService.nextMonth();
    io.emit('weeks', dataService.get().weeks);
  }, null, true, 'America/Los_Angeles');
  job.start();
}

main();
