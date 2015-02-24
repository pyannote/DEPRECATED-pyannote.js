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

  // broadcast 'resize' event to all plugins on window resize 
  window.onresize = function () { radio('resize').broadcast(); };


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
    plugin.set = function (key, value) {
      if (key in plugin._syncGroups) {
        var broadcaster = plugin.name;
        var event = plugin._syncGroups[key] + '.' + key;
        radio(event).broadcast(key, value, broadcaster);
      }
    };

    // get current value for synced key
    plugin.get = function (key) {
      return plugin._sync[key];
    }

    // -- subscription callback -- 
    // called when value of synced keys has changed
    // key: the synced key whose value has changed
    // broadcaster: name of the plugin that actually changed the value
    plugin.update = function (key, broadcaster) {
      console.log('update must be overriden');
    };

    // key: the synced key whose value has changed
    // value: the new value of the synced key
    // broadcaster: name of the plugin that actually changed the value
    // this: the plugin that subscribed to key
    function _updateSync(key, value, broadcaster) {
      // update value of synced key... 
      this._sync[key] = value;
      // ... and tell the plugin that value has changed
      this.update(key, broadcaster);
    }

    // subscribe the plugin to its sync keys
    // e.g. if plugin syncGroups is {'time': 'group1', 'data': 'group2'}, 
    // it will be subscribed to events 'group1.time' and 'group2.data'
    for (var key in syncGroups) {
      var event = plugin._syncGroups[key] + '.' + key;
      radio(event).subscribe([_updateSync, plugin]);
    }

    // -- subscription callback -- 
    // called when window (and therefore plugin container) is resized
    plugin.resize = function () {
      console.log('resize must be overriden');
    };

    // subscribe the plugin to the 'resize' event
    radio('resize').subscribe(function() {
      plugin.resize();
    });

    return plugin;
  };

  my.Player = function (name, media, timeSyncGroup, container) {

    var syncGroups = {'time': timeSyncGroup};
    var plugin = my.BasePlugin(name, container, syncGroups);
    plugin.media = media;

    plugin.media.addEventListener('timeupdate', function () {
      var currentTime = plugin.media.currentTime;
      plugin.set('time', currentTime);
    });

    plugin.update = function (key, broadcaster) {
      if (key === 'time' && broadcaster !== plugin.name) { 
        plugin.media.currentTime = plugin.get('time');
      }
    };

    return plugin;
  };

  return my;

}));
