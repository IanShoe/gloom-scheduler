const express = require('express');
const fs = require('fs');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('app'));

const data = require('./data.json');

io.on('connection', function(socket) {
  socket.on('days', function(days) {
    data.days = days;
    io.emit('days', data.days);
    fs.writeFile('data.json', JSON.stringify(data), function(err) {
      if (err) {
        console.error(`ERROR WRITING JSON: ${err}`);
      }
    });
  });
  socket.on('init', function() {
    io.emit('days', data.days);
  });
});

http.listen(3000, function() {
  console.log('listening on port: 3000');
});
