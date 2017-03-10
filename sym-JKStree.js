(function(CS) {
  'use strict';
  var myCustomSymbolDefinition = {
    typeName: 'JKStree',
    displayName: 'JKS Staleness Tree',
    datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
    iconUrl: '/Scripts/app/editor/symbols/ext/Icons/JKStree.png',
    visObjectType: symbolVis,
    getDefaultConfig: function() {
      return {
        DataShape: 'TimeSeries',
        DataQueryMode: CS.Extensibility.Enums.DataQueryMode.ModeSingleton,
        Height: 300,
        Width: 600,
        // Specify the value of custom configuration options; see the "configure" section below
        targetURL: 'Scripts/app/editor/symbols/ext/treeview.html',
        refreshOnSchedule: false,
        refreshIntervalSeconds: 60
      };
    },
    configOptions: function() {
      return [{
        title: 'Format Symbol',
        mode: 'format'
      }];
    },
    configure: {
      targetURLKeyword: 'targetURL',
      refreshOnScheduleKeyword: 'refreshOnSchedule',
      refreshIntervalSecondsKeyword: 'refreshIntervalSeconds'
    },
  };

  function symbolVis() {}
  CS.deriveVisualizationFromBase(symbolVis);
  symbolVis.prototype.init = function(scope, elem) {
    this.onDataUpdate = myCustomDataUpdateFunction;
    this.onConfigChange = myCustomConfigurationChangeFunction;

    var symbolContainerElement = elem.find('#container')[0];
    var newUniqueIDString = "myCustomSymbol_" + Math.random().toString(36).substr(2, 16);
    symbolContainerElement.id = newUniqueIDString;
    // Create a variable to hold the custom visualization object
    var customVisualizationObject;
    // Create a timer variable to be used for refreshes
    var myTimer;
    // Update the visualization
    if (!customVisualizationObject) {
      customVisualizationObject = true;
      // Set the source of the iframe
      myUpdateIFrameURLFunction();
    }

    function myCustomConfigurationChangeFunction() {
      // If the chart exists...
      if (customVisualizationObject) {
        console.log("Now updating visualization with new configuration...");
        // Update the iFrame to the new desired URL
        if (scope.config.targetURL != symbolContainerElement.src) {
          myUpdateIFrameURLFunction();
        }
        // Update the refresh timer
        window.clearInterval(myTimer);
        if (scope.config.enableRefresh == true) {
          if (scope.config.refreshIntervalSeconds > 0) {
            myTimer = setInterval(myUpdateIFrameURLFunction, scope.config.refreshIntervalSeconds * 1000);
          }
        }
      }
    }

    function myUpdateIFrameURLFunction() {
      console.log((new Date) + " : Refreshing iFrame...");
      // Refresh the iFrame 
      symbolContainerElement.src = scope.config.targetURL;
    }

    var holder = [];
    var stale = [];
    var paths = [];
    var blink = [];
    var names = [];

    function myCustomDataUpdateFunction(data) {
      if (data) {
        for (var i = 0; i < data.Data.length; i++) {
          if (holder[i] != data.Data[i].Values[0].Value) {
            holder[i] = data.Data[i].Values[0].Value;
            stale[i] = 0;
          } else {
            stale[i] = (stale[i] || 0) + 1;
          }
          paths[i] = data.Data[i].Path ? data.Data[i].Path.split('|')[0] : paths[i];
          names[i] = data.Data[i].Label ? data.Data[i].Label.split('|')[1] : names[i];
        }

        for (var j = 0; j < names.length; j++) {
          var asset = $(jq(paths[j]), frames['treeframe'].document).parent().find("ul");
          if (asset.find(jq(names[j])).length == 0) {
            asset.append("<li id='" + names[j] + "'>" + names[j] + " : " + holder[j] + "</li>");
          } else {
            asset.find(jq(names[j])).html(names[j] + " : " + holder[j]);
          }

        }

        for (var i = 0; i < stale.length; i++) {
          var link = $(jq(paths[i]), frames['treeframe'].document);
          if (stale[i] > 4 && !blink[i]) {
            link.addClass('gg').addClass('aa');
            blink[i] = true;
            var parent = findparent(paths[i]);
            while (parent) {
              var parentnode = $(jq(parent), frames['treeframe'].document).addClass('gg');
              parentnode.hasClass('aa') ? parentnode.attr("counter", function(idx, val) {
                return parseInt(val || 0) + 1
              }) : parentnode.addClass('aa');
              parent = findparent(parent);
            }
          } else if (stale[i] == 0 && blink[i]) {
            link.removeClass('aa');
            var parent = findparent(paths[i]);
            while (parent) {
              var parentnode1 = $(jq(parent), frames['treeframe'].document);
              parentnode1.attr("counter") > 0 ? parentnode1.attr("counter", function(idx, val) {
                return parseInt(val || 0) - 1
              }) : parentnode1.removeClass('aa');
              parent = findparent(parent);
            }
            blink[i] = false;
          }
        }
      }
    }

    function jq(myid) {
      if (myid) {
        return "[id='" + myid.replace(/(\\)/g, "\\$1") + "']";
      }
    }

    function findparent(a) {
      var count = a.split("\\").length;
      if (count > 4) {
        return a.slice(0, a.lastIndexOf("\\"));
      } else {
        return null
      };
    }

  }
  CS.symbolCatalog.register(myCustomSymbolDefinition);
})(window.PIVisualization);
