

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

    plugin.svg = d3.select(plugin.container).append("svg");
    plugin.svg.attr("height", 200)
              .attr("class", "pyannote");

    plugin.g = plugin.svg.append("g");
    plugin.g.attr("transform", "translate(" + plugin.config.margin + ", 5)");
    plugin.rect = plugin.g.append("rect")
                          .attr("height", 50)
                          .style("stroke", "gray")
                          .style("stroke-width", 1)
                          .style("fill", "white");

    plugin.marker = plugin.g.append("rect")
                            .attr("height", 50)
                            .attr("width", 1)
                            .style("stroke", "red")
                            .style("stroke-width", 1);

    plugin.scale = d3.scale.linear();

    plugin.update = function () {
      var extent = plugin.get('time', 'extent');
      plugin.scale.domain(extent);

      var currentTime = plugin.get('time', 'currentTime');
      plugin.marker.attr("transform", 
                         "translate(" + plugin.scale(currentTime) + ", 0)");
    };

    plugin.resize = function () {
      var width = plugin.container.clientWidth;
      plugin.svg.attr("width", width);
      plugin.scale.range([0, width-2*plugin.config.margin]);
      plugin.rect.attr("width", width-2*plugin.config.margin);
      plugin.update();
    };

    plugin.resize();

    return plugin;

  };

  pyannote.annotation = my;

  return my;

}));
