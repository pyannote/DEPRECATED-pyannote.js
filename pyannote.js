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

  my.BasePlugin = function (name) {

    var plugin = {};

    plugin.name = name;

    plugin.publish = function (event, data) {
      var broadcaster = plugin.name;
      radio(event).broadcast(data, broadcaster);
    };

    plugin.subscribe = function (event, func) {
      radio(event).subscribe([func, plugin]);
    };

    return plugin;
  };

  my.TimeSyncPlugin = function (name, timeSyncGroup) {

    var plugin = my.BasePlugin(name);

    // ---- Current time ------------------------------------------------------

    plugin.setTime = function (t) {
      plugin.publish(timeSyncGroup + '.time', t);
    };

    function updateTime(t, broadcaster) {
      this.t = t;
      if (this.timeHasChanged !== undefined) {
        this.timeHasChanged(broadcaster);
      }
    }

    plugin.subscribe(timeSyncGroup + '.time', updateTime);

    // ---- Current zoom ------------------------------------------------------

    plugin.setZoom = function (zoom) {
      plugin.publish(timeSyncGroup + '.zoom', zoom);
    };

    function updateZoom(zoom, broadcaster) {
      this.zoom = zoom;
      if (this.zoomHasChanged !== undefined) {
        this.zoomHasChanged(broadcaster);
      }
    }

    plugin.subscribe(timeSyncGroup + '.zoom', updateZoom);

    return plugin;
  };

  my.Player = function (media, timeSyncGroup) {

    var plugin = my.TimeSyncPlugin('player', timeSyncGroup);

    plugin.media = media;

    plugin.media.addEventListener('timeupdate', function () {
      
      var currentTime = plugin.media.currentTime;
      plugin.setTime(currentTime);
    
    });

    plugin.timeHasChanged = function (broadcaster) {

      if (broadcaster !== plugin.name) {
        plugin.media.currentTime = plugin.t;
      }
    };

    return plugin;
  };

  return my;

}));
