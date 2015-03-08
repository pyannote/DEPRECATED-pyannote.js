

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

  my.Axis = function (name, container, mediumSync) {

    var sync = {'medium': mediumSync};
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

    plugin._updateMarker = function (currentTime) {
      plugin.viz.marker.attr(
        "transform", "translate(" + plugin.scale(currentTime) + ", 0)");      
    };

    plugin._updateAxis = function () {
        var axis = d3.svg.axis().scale(plugin.scale);
        plugin.viz.axis.call(axis);
    };

    plugin.update = function (category, property, broadcaster, old_value, new_value) {

      if (category === 'medium' && property === 'duration') {
        plugin.scale.domain([0, new_value]);
        plugin._updateAxis();
        return;
      }
      
      if (category === 'medium' && property === 'currentTime') {
        plugin._updateMarker(new_value);
        return;
      }

    };

    plugin.resize = function () {
      
      var width = plugin.container.clientWidth;
      plugin.svg.attr("width", width);
      plugin.scale.range([0, width-2*plugin.config.margin]);

      var duration = plugin.get('medium', 'duration');
      if (duration !== undefined) { 
        plugin.scale.domain([0, duration]); 
        plugin._updateAxis();
      }
      
      var currentTime = plugin.get('medium', 'currentTime');
      if (currentTime !== undefined) { plugin._updateMarker(currentTime); }

    };

    plugin.resize();

    return plugin;

  };

  pyannote.axis = my;

  return my;

}));





