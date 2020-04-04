$(function() {
  const socket = io('/items');
  socket.on('items', function(items) {
    vueData.items = items
  });
  socket.emit('init-items');

  const vueData = {
    players: [{
      name: 'Dan',
      tappedItems: [],
      class: 'badge-brown',
      selected: false
    }, {
      name: 'George',
      tappedItems: [],
      class: 'badge-success',
      selected: false
    }, {
      name: 'Ian',
      tappedItems: [],
      class: 'badge-purple',
      selected: false
    }, {
      name: 'Nick',
      tappedItems: [],
      class: 'badge-primary',
      selected: false
    }],
    selectedPlayer: null,
    items: [],
    unlockedItems: '',
    filters: [
      'All',
      'Head',
      'Body',
      'One Hand',
      'Two Hands',
      'Legs',
      'Small Item'
    ],
    currentFilter: 'All'
  };

  new Vue({
    el: '#app',
    data: vueData,
    methods: {
      selectPlayer: function(selectedPlayer) {
        vueData.players.forEach(function(player) {
          player.selected = player.name === selectedPlayer.name;
        });
        vueData.selectedPlayer = selectedPlayer;
      },
      setItemImage: function(item) {
        return '/images/' + item.image;
      },
      unlockItems: function() {
        socket.emit('unlock-items', vueData.unlockedItems);
      },
      shouldShowShopItem: function(item) {
        return item.available &&
          item.ownedBy.length < item.quantity &&
          (!vueData.selectedPlayer || !item.ownedBy.includes(vueData.selectedPlayer.name)) &&
          (vueData.currentFilter === 'All' || item.slot === vueData.currentFilter);
      },
      shouldShowMyItem: function(item) {
        return vueData.selectedPlayer &&
          item.ownedBy.includes(vueData.selectedPlayer.name) &&
          (vueData.currentFilter === 'All' || item.slot === vueData.currentFilter);
      },
      buyItem: function(item) {
        if (!item.ownedBy.includes(vueData.selectedPlayer.name)) {
          socket.emit('buy-item', vueData.selectedPlayer.name, item.id);
        }
      },
      sellItem: function(item) {
        if (item.ownedBy.includes(vueData.selectedPlayer.name)) {
          socket.emit('sell-item', vueData.selectedPlayer.name, item.id);
        }
      },
      tapItem: function(item) {
        const pos = vueData.selectedPlayer.tappedItems.indexOf(item.id);
        if (pos === -1) {
          vueData.selectedPlayer.tappedItems.push(item.id);
        } else {
          vueData.selectedPlayer.tappedItems.splice(pos, 1);
        }
      },
      itemTapped: function(item) {
        return vueData.selectedPlayer.tappedItems.includes(item.id);
      },
      setFilter: function(filter) {
        vueData.currentFilter = filter;
      },
      filterActive: function(filter) {
        return vueData.currentFilter === filter;
      }
    }
  });
});
