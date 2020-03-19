$(function() {
  const socket = io('/scheduler');
  socket.on('weeks', function(weeks) {
    vueData.weeks = weeks;
  });
  socket.emit('init-scheduler');

  const vueData = {
    players: [{
      name: 'Dan',
      class: 'badge-brown',
      selected: false
    }, {
      name: 'George',
      class: 'badge-success',
      selected: false
    }, {
      name: 'Ian',
      class: 'badge-purple',
      selected: false
    }, {
      name: 'Nick',
      class: 'badge-primary',
      selected: false
    }],
    selectedPlayer: null,
    weeks: []
  };

  new Vue({
    el: '#app',
    data: vueData,
    methods: {
      dayClasses: function(day) {
        const today = new Date();
        const isPast = day.month < today.getMonth() || (day.month === today.getMonth()  && day.number < today.getDate());
        return {
          'calendar-all': day.players.length === vueData.players.length,
          'calendar-past': isPast,
          'calendar-today': today.getDate() === day.number && today.getMonth() === day.month,
          'ians-house': day.iansHouse
        };
      },
      dayTitle: function(day) {
        return ((day.number === 1) ? day.monthName + ' ' : '') + day.number;
      },
      selectPlayer: function(selectedPlayer) {
        vueData.players.forEach(function(player) {
          player.selected = player.name === selectedPlayer.name;
        });
        vueData.selectedPlayer = selectedPlayer;
      },
      selectDay: function(selectedDay) {
        if (!vueData.selectedPlayer) {
          return;
        }
        let foundIndex = -1;
        selectedDay.players.forEach(function(player, i) {
          if (player.name === vueData.selectedPlayer.name) {
            foundIndex = i;
          }
        });
        if (foundIndex === -1) {
          selectedDay.players.push(vueData.selectedPlayer);
        } else {
          selectedDay.players.splice(foundIndex, 1);
        }
        selectedDay.players = selectedDay.players.sort((a, b) => {
          if (a.name > b.name) {
            return 1;
          } else if (a.name < b.name) {
            return -1;
          } else {
            return 0;
          }
        });
        socket.emit('weeks', vueData.weeks);
      },
      iansHouse: function(selectedDay, event) {
        event.stopPropagation();
        event.preventDefault();
        selectedDay.iansHouse = !selectedDay.iansHouse;
        socket.emit('weeks', vueData.weeks);
      }
    }
  });
});
