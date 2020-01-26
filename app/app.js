$(function() {
  const socket = io();
  socket.on('weeks', function(weeks) {
    vueData.weeks = weeks;
  });
  socket.emit('init');

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
      dayTitle: function(day) {
        return ((day.number === 1) ? day.monthName + ' ' : '') + day.number;
      },
      isToday: function(day) {
        const today = new Date();
        return today.getDate() === day.number && today.getMonth() === day.month;
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
