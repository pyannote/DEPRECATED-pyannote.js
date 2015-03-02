

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

    plugin.config = {};
    plugin.config.margin = 50;
    plugin.config.height = 50;

    plugin.scale = d3.scale.linear();

    plugin.svg = d3.select(plugin.container).append("svg");
    plugin.svg.attr("height", plugin.config.height)
              .attr("class", "pyannote");

    plugin.g = plugin.svg.append("g");
    plugin.g.attr("transform", "translate(" + plugin.config.margin + ", 0)");
    
    plugin.viz = {};
    plugin.viz.border = plugin.g.append("rect")
                          .attr("height", plugin.config.height)
                          .style("stroke", "#000")
                          .style("shape-rendering", "crispEdges")
                          .style("fill", "none");

    plugin.viz.marker = plugin.g.append("line")
                                .attr("x1", 0)
                                .attr("y1", 0)
                                .attr("x2", 0)
                                .attr("y2", plugin.config.height)
                                .attr("stroke-width", 3)
                                .style("shape-rendering", "crispEdges")
                                .style("stroke", "red");

    plugin.update = function (category, property, broadcaster, old_value, new_value) {

      var extent = plugin.get('time', 'extent');
      plugin.scale.domain(extent);

      var currentTime = plugin.get('time', 'currentTime');
      plugin.viz.marker.attr("transform", 
                         "translate(" + plugin.scale(currentTime) + ", 0)");
    };

    plugin.resize = function () {
      var width = plugin.container.clientWidth;
      plugin.svg.attr("width", width);
      plugin.scale.range([0, width-2*plugin.config.margin]);

      plugin.viz.border.attr("width", width-2*plugin.config.margin);
      plugin.update();
    };

    plugin.resize();

    return plugin;

  };

  pyannote.annotation = my;

  return my;

}));
