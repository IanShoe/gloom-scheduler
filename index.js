const CronJob = require('cron').CronJob;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const schedulerDataService = require('./data-services/scheduler-data-service.js');
const battleGoalDataService = require('./data-services/battle-goals-data-service.js');

function initializeCron(io) {
  const job = new CronJob('0 0 0 1 * *', function() {
    schedulerDataService.nextMonth();
    io.emit('weeks', schedulerDataService.get().weeks);
  }, null, true, 'America/New_York');
  job.start();
}

function initializeBattleGoalSocket() {
  const battleGoalIO = io.of('/battle-goal');
  battleGoalIO.on('connection', function(socket) {
    socket.on('select-goal', function(playerName,goalName) {
      battleGoalDataService.selectGoal(playerName,goalName).then(function() {
        battleGoalIO.emit('goals', battleGoalDataService.get());
      });
    });
    socket.on('init-goals', function() {
      battleGoalIO.emit('goals', battleGoalDataService.get());
    });
    socket.on('new-scenario', function() {
      battleGoalDataService.newScenario();
      battleGoalIO.emit('goals', battleGoalDataService.get());
    });
  });
  return battleGoalIO;
}

function initializeSchedulerSocket() {
  const schedulerIO = io.of('/scheduler');
  schedulerIO.on('connection', function(socket) {
    socket.on('weeks', function(weeks) {
      schedulerDataService.setWeeks(weeks).then(function() {
        schedulerIO.emit('weeks', schedulerDataService.get().weeks);
      });
    });
    socket.on('init-scheduler', function() {
      schedulerIO.emit('weeks', schedulerDataService.get().weeks);
    });
  });
  return schedulerIO;
}

async function main() {
  app.use(express.static('app'));

  await battleGoalDataService.initialize();
  await schedulerDataService.initialize();

  const battleGoalIO = initializeBattleGoalSocket();
  const schedulerIO = initializeSchedulerSocket();
  initializeCron(schedulerIO);

  http.listen(3000, function() {
    console.log('listening on port: 3000');
  });
}

main();
