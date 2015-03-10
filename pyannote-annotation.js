

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

  my.Timeline = function (name, container, height, mediumSync, dataSync) {

    var sync = {'medium': mediumSync, 'data': dataSync};
    var plugin = pyannote.Plugin(name, sync, container, height);

    plugin.scale = d3.scale.linear();
    
    plugin.marker = plugin.content.append("line")
                                  .attr("x1", 0)
                                  .attr("y1", -plugin.config.margin.height)
                                  .attr("x2", 0)
                                  .attr("y2", plugin.config.height+plugin.config.margin.height)
                                  .attr("class", "marker")
                                  .attr("stroke-width", 3)
                                  .style("shape-rendering", "crispEdges")
                                  .style("stroke", "red");

    plugin._updateScale = function() {
      console.log(plugin.name + ': update scale');

      plugin.scale.range([0, plugin.config.width-2*plugin.config.margin.width]);
    };

    plugin._updateMarker = function(currentTime) {
      console.log(plugin.name + ': update marker');

      plugin.marker.attr(
        "transform", "translate(" + plugin.scale(currentTime) + ", 0)");      
    };

    plugin._updateTracks = function(content) {
      console.log(plugin.name + ': update tracks');

      plugin.tracks = plugin.content.selectAll(".track")
                                    .data(content);

      plugin.tracks.select("rect")
                   .attr("transform", function(d) {
                      return "translate(" + plugin.scale(d.segment.start) + ", " + plugin.config.height*1/10 + ")";
                    })
                   .attr("width", function(d) {
                      return plugin.scale(d.segment.end) - plugin.scale(d.segment.start);
                    });

      plugin.tracks.enter()
            .append("g")
                .attr("class", "track")
                .append("rect")
                .attr("transform", function(d) {
                    return "translate(" + plugin.scale(d.segment.start) + ", " + plugin.config.height*1/10 + ")";
                })
                .attr("width", function(d) {
                    return plugin.scale(d.segment.end) - plugin.scale(d.segment.start);
                })
                .attr("height", plugin.config.height*4/5)
                .style("fill", "black");
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

      var currentTime = plugin.get('medium', 'currentTime');
      
      var content = plugin.get('data', 'content');
      if (content === undefined) { content = [] };

      plugin._updateScale();
      
      if (currentTime !== undefined) {
        plugin._updateMarker(currentTime); 
      }
      
      if (content !== undefined) { 
        plugin._updateTracks(content); 
      }

    };

    plugin.resize();

    return plugin;

  };

  pyannote.annotation = my;

  return my;

}));
