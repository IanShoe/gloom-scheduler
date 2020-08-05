const scenarioService = require('./scenario-service');

let votes = [];

async function _play() {
  if (!votes.length) {
    return 'NO ONE VOTED YET DOFUS';
  }
  const id = votes[Math.floor(Math.random() * votes.length)];
  _reset();
  return (await scenarioService.get(id)).prettyName;
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

async function _votes() {
  let voteMap = {};
  for (let i = 0; i < votes.length; i++) {
    const id = votes[i];
    const scenario = await scenarioService.get(id);
    if (!voteMap[id]) {
      voteMap[id] = {
        votes: 0,
        name: scenario.prettyName
      };
    }
    voteMap[id].votes++;
  }
  return Object.values(voteMap).sort((a, b) => a.votes - b.votes).reverse().map((v) => `${v.name} - ${v.votes}`).join('\n');
}

module.exports = {
  play: _play,
  reset: _reset,
  unvote: _unvote,
  vote: _vote,
  votes: _votes
}
