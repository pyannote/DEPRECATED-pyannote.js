

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

  my.Axis = function (name, container, timeSync) {

    var sync = {'time': timeSync};
    var plugin = pyannote.BasePlugin(name, sync, container);

    plugin.svg = d3.select(plugin.container).append("svg")
                                            .attr("class", "pyannote");
    plugin.g = plugin.svg.append("g")
                         .attr("class", "axis");

    plugin.draw = function() {

        var width = plugin.container.clientWidth;
        var height = plugin.container.clientHeight;
        plugin.svg.attr("width", width)
                  .attr("height", 100);

        var extent = plugin.get('time', 'extent');
        var scale = d3.time.scale()
                           .domain([new Date(2012, 0, 1, 0, 0, 0, 1000*extent[0]), 
                                    new Date(2012, 0, 1, 0, 0, 0, 1000*extent[1])])
                           .range([0, width]);

        var xAxis = d3.svg.axis()
                          .scale(scale);

        plugin.g.call(xAxis);

    };

    plugin.resize = function () {
      plugin.draw();
    };

    plugin.update = function () {
      plugin.draw();
    };

    return plugin;

  };

  pyannote.axis = my;

  return my;

}));





