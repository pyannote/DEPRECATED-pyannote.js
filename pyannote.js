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

    plugin.t = undefined;

    plugin.setTime = function (t) {
      plugin.publish(timeSyncGroup + '.time', t);
    };

    function _updateTime(t, broadcaster) {
      if (this.updateTime !== undefined) {
        this.updateTime(t, broadcaster);
      }
    }

    plugin.subscribe(timeSyncGroup + '.time', _updateTime);

    // ---- Current zoom ------------------------------------------------------

    plugin.zoom = undefined;

    plugin.setZoom = function (zoom) {
      plugin.publish(timeSyncGroup + '.zoom', zoom);
    };

    function _updateZoom(zoom, broadcaster) {
      if (this.updateZoom !== undefined) {
        this.updateZoom(zoom, broadcaster);
      }
    }

    plugin.subscribe(timeSyncGroup + '.zoom', _updateZoom);

    return plugin;
  };

  return my;

}));
