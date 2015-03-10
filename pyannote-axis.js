

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

  my.Axis = function (name, container, height, mediumSync) {

    var sync = {'medium': mediumSync};
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

    plugin.axis = plugin.content.append("g")
                                .attr("class", "axis");
    
    plugin._updateScale = function() {
      plugin.scale.range([0, plugin.config.width-2*plugin.config.margin.width]);
    };

    plugin._updateMarker = function (currentTime) {
      plugin.marker.attr(
        "transform", "translate(" + plugin.scale(currentTime) + ", 0)");      
    };

    plugin._updateAxis = function () {
        var axis = d3.svg.axis().scale(plugin.scale);
        plugin.axis.call(axis);
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
      
      var currentTime = plugin.get('medium', 'currentTime');

      plugin._updateScale();

      plugin._updateAxis();

      if (currentTime !== undefined) { 
        plugin._updateMarker(currentTime); 
      }      
    };


    plugin.border.on("mousemove", function() {
      var coordinates = d3.mouse(plugin.content[0][0]);
      plugin.set('medium', 'currentTime', plugin.scale.invert(coordinates[0]));
    });



    plugin.resize();

    return plugin;

  };

  pyannote.axis = my;

  return my;

}));





