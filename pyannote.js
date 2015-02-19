(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["radio"], factory);
  } else if (typeof exports === "object") {
    module.exports = factory(require("radio"));
  } else {
    root.pyannote = factory(root.radio);
  }
}(this, function (radio) {

  "use strict";

  var my = {};

  my.BasePlugin = function (name, syncGroups) {

    var plugin = {};

    plugin.name = name;

    plugin._sync = {};

    plugin._syncGroups = {};
    for (var key in syncGroups) { plugin._syncGroups[key] = syncGroups[key]; }

    // publish

    plugin.setSync = function (key, value) {
      // TODO check if key is in _syncGroups
      var broadcaster = plugin.name;
      var event = plugin._syncGroups[key] + '.' + key;
      radio(event).broadcast(key, value, broadcaster);
    };

    // subscribe

    function _updateSync(key, value, broadcaster) {
      this._sync[key] = value;
      this.hasChanged(key, broadcaster);
    }

    for (var key in syncGroups) { 
      var event = plugin._syncGroups[key] + '.' + key;
      radio(event).subscribe([_updateSync, plugin]);
    }

    plugin.getSync = function (key) {
      // TODO check if key is in _syncGroups
      return plugin._sync[key];
    }

    plugin.hasChanged = function (key, broadcaster) {
      console.log('hasChanged must be overriden');
    };

    return plugin;
  };

  my.Player = function (media, timeSyncGroup) {

    var syncGroups = {'time': timeSyncGroup};
    var plugin = my.BasePlugin('player', syncGroups);

    plugin.media = media;

    plugin.media.addEventListener('timeupdate', function () {
      var currentTime = plugin.media.currentTime;
      plugin.setSync('time', currentTime);
    });

    plugin.hasChanged = function (key, broadcaster) {
      if (key === 'time' && broadcaster !== plugin.name) { 
        plugin.media.currentTime = plugin.getSync('time');
      }
    };

    return plugin;
  };

  return my;

}));
