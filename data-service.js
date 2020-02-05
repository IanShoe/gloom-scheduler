const fsRaw = require('fs');
const fs = fsRaw.promises;

const dateUtils = require('./date-utils');
const dataFile = './data.json';

let serverData;

function _get() {
  return serverData;
}

async function _setWeeks(weeks) {
  serverData.weeks = weeks;
  try {
    await fs.writeFile(dataFile, JSON.stringify(serverData, null, 2));
  } catch (err) {
    console.error(`ERROR WRITING JSON: ${err}`);
  }
}

async function _initialize() {
  try {
    await fs.access(dataFile, fsRaw.constants.F_OK);
    serverData = require(dataFile);
  } catch (err) {
    _provision();
  }
  return _get();
}

function _nextMonth() {
  for (let i = 0; i < serverData.indicieOfNextMonth; i++) {
    serverData.weeks.shift();
  }
  _setupNextMonth();
}

function _provision() {
  const firstDayOfMonth = dateUtils.getFirstDayOfMonth();
  serverData = {
    weeks: dateUtils.generateWeeksOfMonth(firstDayOfMonth, _generateDay)
  };
  _setupNextMonth();
}

function _setupNextMonth() {
  const firstDayOfNextMonth = dateUtils.getFirstDayOfNextMonth();
  const nextMonthsWeeks = dateUtils.generateWeeksOfMonth(firstDayOfNextMonth, _generateDay);
  if (nextMonthsWeeks[0][0].number !== 1) {
    nextMonthsWeeks.shift(); // first week of this month already accomodated for
    serverData.indicieOfNextMonth = serverData.weeks.length - 1;
  } else {
    serverData.indicieOfNextMonth = serverData.weeks.length;
  }
  serverData.weeks = serverData.weeks.concat(nextMonthsWeeks);
}

function _generateDay(d) {
  return {
    iansHouse: false,
    month: d.getMonth(),
    monthName: dateUtils.monthNames[d.getMonth()],
    number: d.getDate(),
    players: []
  };
}

module.exports = {
  get: _get,
  initialize: _initialize,
  nextMonth: _nextMonth,
  setWeeks: _setWeeks
}
