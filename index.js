const CronJob = require('cron').CronJob;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const schedulerDataService = require('./data-services/scheduler-data-service.js');
const battleGoalDataService = require('./data-services/battle-goals-data-service.js');

async function main() {
  app.use(express.static('app'));

  await initializeScheduler();
  await initializeBattleGoals();

  http.listen(3000, function() {
    console.log('listening on port: 3000');
  });
}

async function initializeBattleGoals(){
  await battleGoalDataService.initialize();

  // console.log(battleGoalDataService.get());
  // battleGoalDataService.setWeeks(data.weeks);
  

  var bgIo = io.of('/battle-goal')
  bgIo.on('connection', function(socket) {
    socket.on('select-goal', function(playerName,goalName) {
      battleGoalDataService.selectGoal(playerName,goalName).then(function() {
        bgIo.emit('goals', battleGoalDataService.get());
      });
    });
    socket.on('init-goals', function() {
      bgIo.emit('goals', battleGoalDataService.get());
    });
    socket.on('new-scenario', function() {
      battleGoalDataService.newScenario();
      bgIo.emit('goals', battleGoalDataService.get());
    });
  });
}

async function initializeScheduler() {
  await schedulerDataService.initialize();

  const data = schedulerDataService.get();
  schedulerDataService.setWeeks(data.weeks);

  var sIo = io.of('/scheduler')
  sIo.on('connection', function(socket) {
    socket.on('weeks', function(weeks) {
      schedulerDataService.setWeeks(weeks).then(function() {
        sIo.emit('weeks', schedulerDataService.get().weeks);
      });
    });
    socket.on('init-scheduler', function() {
      sIo.emit('weeks', schedulerDataService.get().weeks);
    });
  });

  const job = new CronJob('0 0 0 1 * *', function() {
    schedulerDataService.nextMonth();
    sIo.emit('weeks', schedulerDataService.get().weeks);
  }, null, true, 'America/Los_Angeles');
  job.start();
}

main();
