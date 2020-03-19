const fsRaw = require('fs');
const fs = fsRaw.promises;

const dataFile = './data-files/battle-goal-data.json';
const battleGoalData = './gloomhaven/data/battle-goals.js'
const players = ['Dan', 'George', 'Ian', 'Nick']

let serverData;

function _get() {
  return serverData;
}

async function _selectGoal(playerName,goalName) {
  var i = serverData[playerName].goals[0].name === goalName ? 1 : 0;
  serverData[playerName].goals.splice(i,1);
  try {
    await fs.writeFile(dataFile, JSON.stringify(serverData, null, 2));
  } catch (err) {
    console.error(`ERROR WRITING JSON: ${err}`);
  }
}

async function _initialize() {
  try {
    await fs.access(dataFile, fsRaw.constants.F_OK);
    serverData = require("."+dataFile);
  } catch (err) {
    await _provision();
  }
  return _get();
}

async function _provision() {
  await _newScenario()
}

async function _newScenario() {
  let availableGoals;
  availableGoals = JSON.parse(fsRaw.readFileSync(battleGoalData));
  _shuffleArray(availableGoals)
  serverData = {}
  for (var i = 0; i < players.length; i++){
    serverData[players[i]] = {
      goals: [availableGoals[2*i],availableGoals[2*i+1]],
      name: players[i]
    }
  }
  await fs.writeFile(dataFile, JSON.stringify(serverData, null, 2));
}

function _shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

module.exports = {
  get: _get,
  initialize: _initialize,
  newScenario: _newScenario,
  selectGoal: _selectGoal
}
