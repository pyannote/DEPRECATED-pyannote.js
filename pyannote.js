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

  my.BasePlugin = function (name, container, syncGroups) {

    var plugin = {};

    // plugin name (a.k.a. broadcaster in code below)
    plugin.name = name;

    // plugin container (e.g. <div> or <video>)
    plugin.container = container;

    // synced keys
    plugin._sync = {};

    // sync groups
    plugin._syncGroups = {};
    for (var key in syncGroups) { plugin._syncGroups[key] = syncGroups[key]; }

    // broadcast new value of synced key 
    // to all members of the same syncGroup
    plugin.setSync = function (key, value) {
      if (key in plugin._syncGroups) {
        var broadcaster = plugin.name;
        var event = plugin._syncGroups[key] + '.' + key;
        radio(event).broadcast(key, value, broadcaster);
      }
    };

    // get current value for synced key
    plugin.getSync = function (key) {
      return plugin._sync[key];
    }

    // -- subscription callback -- 
    // called when value of synced keys has changed
    // key: the synced key whose value has changed
    // broadcaster: name of the plugin that actually changed the value
    plugin.hasChanged = function (key, broadcaster) {
      console.log('hasChanged must be overriden');
    };

    // key: the synced key whose value has changed
    // value: the new value of the synced key
    // broadcaster: name of the plugin that actually changed the value
    // this: the plugin that subscribed to key
    function _updateSync(key, value, broadcaster) {
      // update value of synced key... 
      this._sync[key] = value;
      // ... and tell the plugin that value has changed
      this.hasChanged(key, broadcaster);
    }

    // subscribe the plugin to its sync keys
    // e.g. if plugin syncGroups is {'time': 'group1', 'data': 'group2'}, 
    // it will be subscribed to events 'group1.time' and 'group2.data'
    for (var key in syncGroups) {
      var event = plugin._syncGroups[key] + '.' + key;
      radio(event).subscribe([_updateSync, plugin]);
    }

    };

    return plugin;
  };

  my.Player = function (name, media, timeSyncGroup, container) {

    var syncGroups = {'time': timeSyncGroup};
    var plugin = my.BasePlugin(name, container, syncGroups);
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
