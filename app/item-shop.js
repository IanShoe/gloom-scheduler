$(function() {
  const socket = io('/items');
  socket.on('items', function(items) {
    vueData.items = items
  });
  socket.emit('init-items');

  // TODO: player model is a bit off. Try to put it back in array form. Will need to look at server model too.
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
    items:[],
    unlockedItems:'',
    filter:'All'
  };

  new Vue({
    el: '#app',
    data: vueData,
    methods: {
      setItemImage: function(item) {
        return '/images/' + item.image;
      },
      unlockItems: function() {
        socket.emit('unlock-items',vueData.unlockedItems);
      },
      shouldShowShopItem: function(item) {
        return item.available 
              && item.ownedBy.length < item.quantity 
              && (vueData.selectedPlayer === null || !item.ownedBy.includes(vueData.selectedPlayer.name))
              && (vueData.filter === 'All' 
              || item.slot === vueData.filter);
      },
      shouldShowMyItem: function(item) {
        return vueData.selectedPlayer !== null 
                && item.ownedBy.includes(vueData.selectedPlayer.name)
                && (vueData.filter === 'All' 
                || item.slot === vueData.filter);
      },
      selectPlayer: function(selectedPlayer) {
        vueData.players.forEach(function(player) {
          player.selected = player.name === selectedPlayer.name;
        });
        vueData.selectedPlayer = selectedPlayer;
      },
      buyItem: function(item) {
        if (!item.ownedBy.includes(vueData.selectedPlayer.name)){
          socket.emit('buy-item',vueData.selectedPlayer.name, item.id);
        }
      },
      sellItem: function(item) {
        if (item.ownedBy.includes(vueData.selectedPlayer.name)){
          socket.emit('sell-item',vueData.selectedPlayer.name, item.id);
        }
      }
    }
  });
});
