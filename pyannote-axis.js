

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

    plugin.config = {};
    plugin.config.margin = 50;
    plugin.config.height = 20;

    plugin.scale = d3.scale.linear();

    plugin.svg = d3.select(plugin.container).append("svg");
    plugin.svg.attr("height", plugin.config.height)
              .attr("class", "pyannote");

    plugin.g = plugin.svg.append("g");
    plugin.g.attr("transform", "translate(" + plugin.config.margin + ", 0)");

    plugin.viz = {};
    plugin.viz.marker = plugin.g.append("line")
                                .attr("x1", 0)
                                .attr("y1", 0)
                                .attr("x2", 0)
                                .attr("y2", plugin.config.height)
                                .attr("stroke-width", 3)
                                .style("shape-rendering", "crispEdges")
                                .style("stroke", "red");

    plugin.viz.axis = plugin.g.append("g");
    plugin.viz.axis.attr("class", "axis");

    plugin.update = function (category, property, broadcaster, old_value, new_value) {

      var extent = plugin.get('time', 'extent');
      plugin.scale.domain(extent);
      
      var axis = d3.svg.axis().scale(plugin.scale);
      plugin.viz.axis.call(axis);

      var currentTime = plugin.get('time', 'currentTime');
      plugin.viz.marker.attr("transform", 
                         "translate(" + plugin.scale(currentTime) + ", 0)");
    };

    plugin.resize = function () {
      var width = plugin.container.clientWidth;
      plugin.svg.attr("width", width);
      plugin.scale.range([0, width-2*plugin.config.margin]);

      // plugin.update();
    };


    plugin.resize();

    return plugin;

  };

  pyannote.axis = my;

  return my;

}));





