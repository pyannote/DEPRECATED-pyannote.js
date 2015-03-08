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

  my.BasePlugin = function (name, sync, container) {

    var plugin = {};

    // plugin name (a.k.a. broadcaster in code below)
    plugin.name = name;

    // plugin container
    plugin.container = container;

    // internal _model
    plugin._model = {};

    // sync groups
    plugin._sync = {};
    for (var category in sync) { 
      plugin._sync[category] = sync[category]; 
      plugin._model[category] = {};
    }

    // plugin.set('medium', 'currentTime', 3)
    plugin.set = function (category, property, new_value) {
      if (category in plugin._sync) {
        var broadcaster = plugin.name;
        var event = plugin._sync[category] + '.' + category;
        radio(event).broadcast(category, property, new_value, broadcaster);
      }
    };

    // get current value for synced key
    plugin.get = function (category, property) {
      if (property in plugin._model[category]) {
        return plugin._model[category][property];
      }
    }

    // -- subscription callback -- 
    // called when value of synced keys has changed
    // key: the synced key whose value has changed
    // broadcaster: name of the plugin that actually changed the value
    plugin.update = function (category, property, broadcaster, old_value, new_value) {
      console.log('update must be overriden');
    };

    // category: 
    // property: 
    // new_value: the new value of the property
    // broadcaster: name of the plugin that actually changed the value
    // this: the plugin that subscribed to key
    function _update(category, property, new_value, broadcaster) {
      // update value of synced key... 
      var old_value = this.get(category, property);
      this._model[category][property] = new_value;
      // ... and tell the plugin that value has changed
      this.update(category, property, broadcaster, old_value, new_value);
    }

    // subscribe the plugin to its sync keys
    // e.g. if plugin sync is {'medium': 'group1', 'data': 'group2'}, 
    // it will be subscribed to events 'group1.time' and 'group2.data'
    for (var category in sync) {
      var event = plugin._sync[category] + '.' + category;
      radio(event).subscribe([_update, plugin]);
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


  my.Player = function (audioOrVideo, name, container, mediumSync) {

    var sync = {'medium': mediumSync};
    var plugin = my.BasePlugin(name, sync, container);

    plugin.player = d3.select(plugin.container).append(audioOrVideo);
    plugin.player.attr("width", "100%")
                 .attr("preload", "metadata")
                 .attr("controls", true);

    plugin.player.on('loadedmetadata', function() {
      var duration = plugin.player[0][0].duration;
      plugin.set('medium', 'duration', duration);
    });

    plugin.player.on('timeupdate', function() {
      var currentTime = plugin.player[0][0].currentTime;
      plugin.set('medium', 'currentTime', currentTime);
    });

    plugin._updateCurrentTime = function(currentTime) {
      plugin.player[0][0].currentTime = currentTime;
    };

    plugin._updateSource = function(source) {
      plugin.player.attr("src", source.url)
                   .attr("type", source.type);
    };

    plugin.update = function (category, property, broadcaster, old_value, new_value) {
      
      if (broadcaster !== plugin.name && category === 'medium' && property === 'currentTime') {
        plugin._updateCurrentTime(new_value);
      }

      if (category === 'medium' && property === 'source') {
        plugin._updateSource(new_value);
      }

    };

    plugin.resize = function () { };

    return plugin;

  };

  my.VideoPlayer = function (name, container, mediumSync) {
    var plugin = my.Player('video', name, container, mediumSync);
    return plugin;
  };

  my.AudioPlayer = function (name, container, mediumSync) {
    var plugin = my.Player('audio', name, container, mediumSync);
    return plugin;
  };


  return my;

}));
