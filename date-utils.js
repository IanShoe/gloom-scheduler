const _monthNames = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "June",
  6: "July",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
  11: "Dec"
};

function _getLastDayOfPreviousMonth(d) {
  d = d || new Date();
  return new Date(d.getFullYear(), d.getMonth(), 0);
}

function _getFirstDayOfMonth(d) {
  d = d || new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function _getLastDayOfMonth(d) {
  d = d || new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function _getFirstDayOfNextMonth(d) {
  d = d || new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

function _getLastDayOfNextMonth(d) {
  d = d || new Date();
  return new Date(d.getFullYear(), d.getMonth() + 2, 0);
}

function _generateDay(d) {
  return d.getDate();
}

function _generateWeeksOfMonth(firstDay, generateDay) {
  generateDay = generateDay || _generateDay;
  const weeks = [];
  const lastDayOfMonth = _getLastDayOfMonth(firstDay);
  const lastDayOfPreviousMonth = _getLastDayOfPreviousMonth(firstDay);
  const daysInMonth = lastDayOfMonth.getDate();

  let currentWeek = [];

  // Handle first week that includes some days from previous month
  for (let i = firstDay.getDay() - 1; i >= 0; i--) {
    currentWeek.push(generateDay(new Date(firstDay.getFullYear(), firstDay.getMonth(), -i)));
  }

  // Handle weeks up to next month
  for (let i = 1; i <= daysInMonth; i++) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(generateDay(new Date(firstDay.getFullYear(), firstDay.getMonth(), i)));
  }

  // Handle last week that includes some days from next month
  let nextMonthStart = 1
  while (currentWeek.length !== 7) {
    currentWeek.push(generateDay(new Date(firstDay.getFullYear(), firstDay.getMonth(), daysInMonth + nextMonthStart++)));
  }
  weeks.push(currentWeek);

  return weeks;
}

module.exports = {
  getLastDayOfPreviousMonth: _getLastDayOfPreviousMonth,
  getFirstDayOfMonth: _getFirstDayOfMonth,
  getLastDayOfMonth: _getLastDayOfMonth,
  getFirstDayOfNextMonth: _getFirstDayOfNextMonth,
  getLastDayOfNextMonth: _getLastDayOfNextMonth,
  generateWeeksOfMonth: _generateWeeksOfMonth,
  monthNames: _monthNames
}
