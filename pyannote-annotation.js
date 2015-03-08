

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

  my.Timeline = function (name, container, mediumSync, dataSync) {

    var sync = {'medium': mediumSync, 'data': dataSync};
    var plugin = pyannote.BasePlugin(name, sync, container);

    plugin.config = {};
    plugin.config.margin = 50;
    plugin.config.height = 50;

    plugin.scale = d3.scale.linear()
                           .range([0, 1])
                           .domain([0, 0]);

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

    plugin._updateMarker = function(currentTime) {
      plugin.viz.marker.attr(
        "transform", "translate(" + plugin.scale(currentTime) + ", 0)");      
    };

    plugin._updateTracks = function(content) {
      
      var tracks = plugin.g.selectAll(".track").data(content);
      
      tracks.select("rect")
            .attr("transform", function(d) {
                return "translate(" + plugin.scale(d.segment.start) + ", 0)";
            })
            .attr("width", function(d) {
                return plugin.scale(d.segment.end) - plugin.scale(d.segment.start);
            });

      tracks.enter()
            .append("g")
            .attr("class", "track")
            .append("rect")
            .attr("transform", function(d) {
                return "translate(" + plugin.scale(d.segment.start) + ", " + plugin.config.height + ")";
            })
            .attr("width", function(d) {
                return plugin.scale(d.segment.end) - plugin.scale(d.segment.start);
            })
            .attr("height", plugin.config.height);
    };

    plugin.update = function (category, property, broadcaster, old_value, new_value) {

      if (category === 'medium' && property === 'duration') {
        plugin.scale.domain([0, new_value]);
        plugin._updateTracks(plugin.get('data', 'content'));
        return;
      }

      if (category === 'medium' && property === 'currentTime') {
        plugin._updateMarker(new_value);
        return;
      }

      if (category === 'data' && property === 'content') {
        plugin._updateTracks(new_value); 
        return;
      }

    };

    plugin.resize = function () {

      var width = plugin.container.clientWidth;
      plugin.svg.attr("width", width);
      plugin.scale.range([0, width-2*plugin.config.margin]);

      plugin.viz.border.attr("width", width-2*plugin.config.margin);
      
      var duration = plugin.get('medium', 'duration');
      if (duration !== undefined) { plugin.scale.domain([0, duration]); }

      var currentTime = plugin.get('medium', 'currentTime');
      if (currentTime !== undefined) { plugin._updateMarker(currentTime); }
      
      var content = plugin.get('data', 'content');
      if (content !== undefined) { plugin._updateTracks(content); }

    };

    plugin.resize();

    return plugin;

  };

  pyannote.annotation = my;

  return my;

}));
