$(function() {
  const socket = io();
  socket.on('goals', function(goals) {
    console.log(goals)
    for (player in vueData.players) {
      console.log(vueData.players[player])
      vueData.players[player].goals = goals[player].goals
    }
  });
  socket.emit('init-goals');

  const vueData = {
    players: { 
      Dan: {
        name: 'Dan',
        class: 'badge-brown',
        selected: false,
        goals: []
      }, 
      George: {
        name: 'George',
        class: 'badge-success',
        selected: false,
        goals: []
      }, 
      Ian: {
        name: 'Ian',
        class: 'badge-purple',
        selected: false,
        goals: []
      }, 
      Nick: {
        name: 'Nick',
        class: 'badge-primary',
        selected: false,
        goals: []
      }
    }
    ,
    selectedPlayer: null
  };

  new Vue({
    el: '#app',
    data: vueData,
    methods: {
      newScenario: function(){
        socket.emit('new-scenario')
      },
      selectPlayer: function(selectedPlayer) {
        for(player in vueData.players) {
          vueData.players[player].selected = player === selectedPlayer;
        }
        vueData.selectedPlayer = selectedPlayer;
      },
      deselectPlayer: function() {
        for(player in vueData.players) {
          vueData.players[player].selected = false
        }
        vueData.selectedPlayer = null;
      },
      selectGoal: function(playerName,goalName) {
        socket.emit('select-goal',playerName,goalName)
      }
    }
  });
});
