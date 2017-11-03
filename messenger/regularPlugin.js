define([
  '../util.js'
], function (util) {
  var p = {
  }

  p.checkin = function (component, id) {
    var
      idMap = {};

    var
      basePath = '0@',
      currentComponent = component;

    while (currentComponent) {
      if (currentComponent.__MID__) {
        basePath = currentComponent.__MID__;
        break;
      }
      if (!this.getParent(currentComponent)) {
        break;
      }
      currentComponent = this.getParent(currentComponent);
    }

    this.walk(currentComponent, basePath, id, idMap);

    return idMap;
  }

  p.walk = function (currentComponent, parentPath, id, idMap) {
    util._$forEach(currentComponent._children, function (item) {
      var currentId = id();
      item.__MID__ = parentPath + '/' + currentId;
      idMap[item.__MID__] = item;
      p.walk(item, item.__MID__, id, idMap);
    })
  }

  p.checkout = function (component, idMap) {
    delete idMap[component.__MID__];
    util._$forEach(component._children, function (item) {
      p.checkout(item, idMap);
    });
  }

  p.getParent = function (component) {
    return component.$outer || component.$parent;
  }

  return p;
})