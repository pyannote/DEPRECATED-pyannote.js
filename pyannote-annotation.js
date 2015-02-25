

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["pyannote", "d3"], factory);
  } else if (typeof exports === "object") {
    module.exports = factory(require("pyannote", "d3"));
  } else {
    factory(root.pyannote, root.d3);
  }
}(this, function (pyannote, d3) {

  "use strict";

  var my = {};

  my.Timeline = function (name, container, timeSync, dataSync) {

    var sync = {'time': timeSync, 'data': dataSync};
    var plugin = pyannote.BasePlugin(name, sync, container);

    plugin.draw = function() {
      var h = '<h1>' + plugin.name + '</h1>';
      var t = '<p>t = ' + plugin.get('time', 'currentTime') + '</p>';
      var d = '<p>d = ' + plugin.get('data', 'whatever') + '</p>';
      plugin.container.innerHTML = h + t + d;
    }

    plugin.update = function () {
      plugin.draw();
    };

    plugin.resize = function () {
      plugin.draw();
    }

    return plugin;

  };

  pyannote.annotation = my;

  return my;

}));
