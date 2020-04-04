const fsRaw = require('fs');
const path = require('path');
const fs = fsRaw.promises;

const dataFile = path.resolve('data-files/items-data.json');
const rawItemData = './gloomhaven/data/items.js'

let serverData;

async function _writeData() {
  try {
    await fs.writeFile(dataFile, JSON.stringify(serverData, null, 2));
  } catch (err) {
    console.error(`ERROR WRITING JSON: ${err}`);
  }
}

function _get() {
  return serverData;
}

async function _initialize() {
  try {
    await fs.access(dataFile, fsRaw.constants.F_OK);
    serverData = require(dataFile);
  } catch (err) {
    await _provision();
  }
  return _get();
}

async function _provision() {
  serverData = JSON.parse(fsRaw.readFileSync(rawItemData));
  await _writeData();
}

async function _unlockItems(unlockedItems) {
  unlockedItems = unlockedItems.trim();
  unlockEndpoints = unlockedItems.split('-');
  if (unlockEndpoints.length > 1) {
    const start = parseInt(unlockEndpoints[0]);
    const stop = parseInt(unlockEndpoints[1]);
    for (let i = start; i <= stop; i++) {
      _unlockItem(i);
    }
  } else {
    _unlockItem(parseInt(unlockEndpoints[0]));
  }
  await _writeData();
}

function _unlockItem(itemId) {
  serverData[itemId - 1].available = true;
}

async function _buyItem(playerName, itemId) {
  serverData[itemId - 1].ownedBy.push(playerName);
  await _writeData;
}

async function _sellItem(playerName, itemId) {
  for (let i = 0; i < serverData[itemId - 1].ownedBy.length; i++) {
    if (serverData[itemId - 1].ownedBy[i] === playerName) {
      serverData[itemId - 1].ownedBy.splice(i, 1);
    }
  }
}

module.exports = {
  get: _get,
  initialize: _initialize,
  unlockItems: _unlockItems,
  buyItem: _buyItem,
  sellItem: _sellItem
}
