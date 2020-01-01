$(function() {
  const data = {
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
    days: {
      sun: {
        title: 'Sunday',
        players: [],
        toggled: false
      },
      mon: {
        title: 'Monday',
        players: [],
        toggled: false
      },
      tue: {
        title: 'Tuesday',
        players: [],
        toggled: false
      },
      wed: {
        title: 'Wednesday',
        players: [],
        toggled: false
      },
      thu: {
        title: 'Thursday',
        players: [],
        toggled: false
      },
      fri: {
        title: 'Friday',
        players: [],
        toggled: false
      },
      sat: {
        title: 'Saturday',
        players: [],
        toggled: false
      }
    }
  }

  const socket = io();
  socket.on('days', function(days) {
    data.days = days;
  });

  const app = new Vue({
    el: '#app',
    data: data,
    methods: {
      selectPlayer: function(selectedPlayer) {
        data.players.forEach(function(player) {
          player.selected = player.name === selectedPlayer.name;
        });
        data.selectedPlayer = selectedPlayer;
      },
      selectDay: function(selectedDay) {
        if (!data.selectedPlayer) {
          return;
        }
        const day = data.days[selectedDay];
        let foundIndex = -1;
        day.players.forEach(function(player, i) {
          if (player.name === data.selectedPlayer.name) {
            foundIndex = i;
          }
        });
        if (foundIndex === -1) {
          day.players.push(data.selectedPlayer);
        } else {
          day.players.splice(foundIndex, 1);
        }
        socket.emit('days', data.days);
      },
      toggleDay: function(selectedDay) {
        const day = data.days[selectedDay];
        day.toggled = !day.toggled;
        socket.emit('days', data.days);
      },
      reset: function() {
        data.days = {
          sun: {
            title: 'Sunday',
            players: [],
            toggled: false
          },
          mon: {
            title: 'Monday',
            players: [],
            toggled: false
          },
          tue: {
            title: 'Tuesday',
            players: [],
            toggled: false
          },
          wed: {
            title: 'Wednesday',
            players: [],
            toggled: false
          },
          thu: {
            title: 'Thursday',
            players: [],
            toggled: false
          },
          fri: {
            title: 'Friday',
            players: [],
            toggled: false
          },
          sat: {
            title: 'Saturday',
            players: [],
            toggled: false
          }
        };
        socket.emit('days', data.days);
      }
    }
  });
  socket.emit('init');
});
