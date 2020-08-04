const CronJob = require('cron').CronJob;
const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const apiRouter = require('./routers/api-router');
const battleGoalDataService = require('./data-services/battle-goals-data-service.js');
const itemsDataService = require('./data-services/items-data-service.js');
const schedulerDataService = require('./data-services/scheduler-data-service.js');

function initializeCron(io) {
  const job = new CronJob('0 0 0 1 * *', function() {
    schedulerDataService.nextMonth();
    io.emit('weeks', schedulerDataService.get().weeks);
  }, null, true, 'America/New_York');
  job.start();
}

function initializeItemsSocket() {
  const itemsIO = io.of('/items');
  itemsIO.on('connection', function(socket) {
    socket.on('init-items', function() {
      itemsIO.emit('items', itemsDataService.get());
    });
    socket.on('unlock-items', function(unlockedItems) {
      itemsDataService.unlockItems(unlockedItems)
      itemsIO.emit('items', itemsDataService.get());
    });
    socket.on('buy-item', function(playerName, itemId) {
      itemsDataService.buyItem(playerName, itemId);
      itemsIO.emit('items', itemsDataService.get());
    });
    socket.on('sell-item', function(playerName, itemId) {
      itemsDataService.sellItem(playerName, itemId);
      itemsIO.emit('items', itemsDataService.get());
    });
  });
  return itemsIO;
}


function initializeBattleGoalSocket() {
  const battleGoalIO = io.of('/battle-goal');
  battleGoalIO.on('connection', function(socket) {
    socket.on('select-goal', function(playerName, goalName) {
      battleGoalDataService.selectGoal(playerName, goalName).then(function() {
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
  app.get('/', (req, res) => {
    res.redirect('/scheduler.html');
  });
  app.use('/api', apiRouter);

  await battleGoalDataService.initialize();
  await schedulerDataService.initialize();
  await itemsDataService.initialize();

  const battleGoalIO = initializeBattleGoalSocket();
  const schedulerIO = initializeSchedulerSocket();
  const itemsIO = initializeItemsSocket();
  initializeCron(schedulerIO);

  http.listen(3000, function() {
    console.log('listening on port: 3000');
  });
}

main();

process.on('SIGINT', function() {
  app.close();
  framework.stop().then(function() {
    process.exit();
  });
});
