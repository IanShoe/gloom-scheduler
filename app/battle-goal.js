$(function() {
  const socket = io('/battle-goal');
  socket.on('goals', function(goals) {
    for (player in vueData.players) {
      vueData.players[player].goals = goals[player].goals
    }
  });
  socket.emit('init-goals');

  // TODO: player model is a bit off. Try to put it back in array form. Will need to look at server model too.
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
    },
    selectedPlayer: null
  };

  new Vue({
    el: '#app',
    data: vueData,
    methods: {
      setGoalImage: function(player, goal) {
        return '/images/' + (player.selected ? goal.image : 'battle-goals/battlegoal-back.png')
      },
      setBattleGoalClass: function(playerName) {
        return (vueData.selectedPlayer === playerName) ? '' : 'not-selected-player';
      },
      newScenario: function() {
        socket.emit('new-scenario')
      },
      selectPlayer: function(selectedPlayer) {
        for (player in vueData.players) {
          vueData.players[player].selected = player === selectedPlayer;
        }
        vueData.selectedPlayer = selectedPlayer;
      },
      deselectPlayer: function() {
        for (player in vueData.players) {
          vueData.players[player].selected = false
        }
        vueData.selectedPlayer = null;
      },
      selectGoal: function(playerName, goalName) {
        if (vueData.selectedPlayer === playerName) {
          socket.emit('select-goal', playerName, goalName);
        }
      }
    }
  });
});
