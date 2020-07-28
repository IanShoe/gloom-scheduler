const scenarioService = require('./scenario-service');

let votes = [];

async function _play() {
  if (!votes.length) {
    return 'NO ONE VOTED YET DOFUS';
  }
  const id = votes[Math.floor(Math.random() * votes.length)];
  _reset();
  return await scenarioService.get(id);
}

function _reset() {
  votes = [];
}

async function _vote(id) {
  const scenario = await scenarioService.get(id);
  if (scenario) {
    votes.push(id);
    return scenario.prettyName;
  } else {
    return 'SCENARIO NOT FOUND DOFUS';
  }
}

async function _unvote(id) {
  const scenario = await scenarioService.get(id);
  if (scenario) {
    votes.splice(votes.findIndex(v => id === v), 1);
    return scenario.prettyName;
  } else {
    return 'SCENARIO NOT FOUND DOFUS';
  }
}

module.exports = {
  play: _play,
  reset: _reset,
  unvote: _unvote,
  vote: _vote
}
