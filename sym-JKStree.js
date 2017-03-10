(function(CS) {
  'use strict';
  var myCustomSymbolDefinition = {
    typeName: 'JKStree',
    displayName: 'JKS tree',
    datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Single,
    iconUrl: '/Scripts/app/editor/symbols/ext/Icons/JKStree.png',
    visObjectType: symbolVis,
    getDefaultConfig: function() {
      return {
        // Specify the data shape type (for symbols that update with new data)
        DataShape: 'Value',
        Height: 300,
        Width: 600,
        // Specify the value of custom configuration options; see the "configure" section below
        targetURL: 'https://pisrv01.pischool.int/PIVision/Scripts/app/editor/symbols/ext/treeview.html',
        refreshOnSchedule: false,
        refreshIntervalSeconds: 60
      };
    },
    configOptions: function() {
      return [{
        // Add a title that will appear when the user right-clicks a symbol
        title: 'Format Symbol',
        // Supply a unique name for this cofiguration setting, so it can be reused, if needed
        mode: 'format'
      }];
    },
    // Include variables that will be used in the custom configuration pane.
    // Define a keyword and the value of that keyword for each variable.
    // You'll specify the value for these in the getDefaultConfig section
    // by referencing these variables by the value of their keyword
    configure: {
      targetURLKeyword: 'targetURL',
      refreshOnScheduleKeyword: 'refreshOnSchedule',
      refreshIntervalSecondsKeyword: 'refreshIntervalSeconds'
    },
  };

  //************************************
  // Function called to initialize the symbol
  //************************************
  //function myCustomSymbolInitFunction(scope, elem) {
  function symbolVis() {}
  CS.deriveVisualizationFromBase(symbolVis);
  symbolVis.prototype.init = function(scope, elem) {
    // Specify which function to call when a data update or configuration change occurs 
    this.onDataUpdate = myCustomDataUpdateFunction;
    this.onConfigChange = myCustomConfigurationChangeFunction;

    // Locate the html div that will contain the symbol, using its id, which is "container" by default
    var symbolContainerElement = elem.find('#container')[0];
    // Use random functions to generate a new unique id for this symbol, to make it unique among all other custom symbols
    var newUniqueIDString = "myCustomSymbol_" + Math.random().toString(36).substr(2, 16);
    // Write that new unique ID back to overwrite the old id
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

    //************************************
    // Function that is called when custom configuration changes are made
    //************************************
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
        if (scope.config.refreshOnSchedule == true) {
          if (scope.config.refreshIntervalSeconds > 0) {
            myTimer = setInterval(myUpdateIFrameURLFunction, scope.config.refreshIntervalSeconds * 1000);
          }
        }
      }
    }

    //************************************
    // Function that is called to refresh the iframe
    //************************************
    function myUpdateIFrameURLFunction() {
      console.log((new Date) + " : Refreshing iFrame...");
      // Refresh the iFrame 
      symbolContainerElement.src = scope.config.targetURL;
    }

    var blink;
    var stale = 0;

    function myCustomDataUpdateFunction(data) {

      if (data) {

        if (scope.value == data.Value) {
          ++stale;
        } else {
          stale = 0
        }
        scope.value = data.Value;
        scope.time = data.Time;
        if (data.Path) {
          scope.path = data.Path.substring(3).split('|')[0];
        }
      }

      var link = $(jq(scope.path), frames['treeframe'].document);
      //if (!blink && scope.path && link.length > 0) {
      if (stale > 4 && !blink) {
        link.addClass('gg').addClass('aa');
        blink = true;
        var parent = findparent(scope.path);
        while (parent) {

          console.log(parent + " if");
          $(jq(parent), frames['treeframe'].document).addClass('gg').addClass('aa');
          parent = findparent(parent);
        }

      } 
      
      else if (stale == 0 && blink) {
        link.removeClass('aa');
        var parent = findparent(scope.path);
        while (parent) {
          console.log(parent + " elseif");
          $(jq(parent), frames['treeframe'].document).removeClass('aa');
          parent = findparent(parent);
        }
        //link.css('visibility', 'visible');
        blink = false;
      }

    }


    function jq(myid) {
      if (myid) {
        return "[id='" + myid.replace(/(\\)/g, "\\$1") + "']";
      }
    }

    function findparent(a) {
      var count = a.split("\\").length;
     // console.log(count);
      if (count > 4) {
        return a.slice(0, a.lastIndexOf("\\"));
      } else {
        return null
      };
    }

  }

  CS.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);
