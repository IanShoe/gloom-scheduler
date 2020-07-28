const request = require('request-promise');
const scenarioModel = require('../models/scenarios.json');

const AUTH_TOKEN = '49|Bdbxhu62Cb9qYnxug08YMGmSKKSOOx2cSq4rjkum8urmplTjDx2kzlQNuDhGjrrKRDxRHeJCpKgynchb'
const CAMPAIGN_ID = 39;

let scenariosCache = null;

async function _get(id) {
  if (!scenariosCache) {
    await _reset();
  }
  if (id) {
    return scenariosCache.find(scenario => scenario.id === id);
  }
  return scenariosCache;
}

async function _reset() {
  scenariosCache = await _fetch();
}

async function _fetch() {
  try {
    console.log('Fetching Scenarios');
    const body = await request({
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`
      },
      url: `https://api.gloomhaven-storyline.com/stories/${CAMPAIGN_ID}`,
      method: 'GET'
    });
    console.log('Fetched Scenarios');
    const scenarios = [];
    const storyItems = JSON.parse(body).data;
    for (let storyItem in storyItems) {
      if (storyItem.startsWith('scenario') && storyItems[storyItem].state === 'incomplete') {
        scenarios.push(buildScenario(storyItem));
      }
    }
    return scenarios;
  } catch (e) {
    const error = new Error('Error Retrieving Scenarios');
    error.name = 'ScnearioServiceError';
    throw error;
  }
}

function buildScenario(storyItem) {
  const id = parseInt(storyItem.split('-')[1]);
  const scenario = { ...scenarioModel.scenarios[id - 1] };
  if (scenario.id !== id) {
    scenario.prettyName = id;
  } else if (!scenario.region_ids) {
    scenario.prettyName = `${id}: ${scenario.name}`;
  } else {
    const regions = scenario.region_ids
      .map((rid) => scenarioModel.regions[rid - 1].name)
      .join(', ');
    scenario.prettyName = `${id}: ${scenario.name} - ${regions}`;
  }
  return scenario;
}

module.exports = {
  get: _get,
  reset: _reset
};
