/**
 * overview: a tiny messenger framework
 * support component: Regular
 * api:
 * 1.subcribe(component, name[, callback, relativePath]): subcribe messages
 * example:
 *  messenger.subcribe(this, 'hello', function () {}, '../')
 * 
 * 2.unsubcibe(component[, name, callback, relativePath]): unsubcribe messages
 * example:
 *  messenger.unsubcribe(this)
 * 
 * 3.dispatch(component, name[, data, relativePath]): dispatch a specified message
 * example:
 *  messenger.dispatch(this, 'hello', 'nice to meet you')
 * 
 * 4.checkin(component): check in the component into the messenger
 * example:
 *  messenger.checkin(rootComponent)
 * 
 * 5.checkout(component): check out the component from the messenger
 * example:
 *  messenger.checkout(rootComponent)
 * 
 * popo: hzyangjiezheng
 * version: 0.0.1
 * update: 2017/08/15
 */
define([
  '../util.js',
  './regularPlugin.js'
], function (util, regularPlugin) {
  var p = {};

  var idMap = {
    /* '0@/1@/2@': header,
    '0@/1@/3@': body */
  };
  var pathCache = {};

  var basePath = '0@';

  var messageMap = {
    /* 
    '0@': {
      '1@': {
        '2@': {
          messages: {
            change: [{subcriber,callback1}, {subcriber,callback2}]
          }
        },
        '3@': {
          messages: {
            keypress: [{subcriber,callback3}, {subcriber,callback4}]
          }
        },
        messags: {

        }
      },
      messages: {

      }
    } */
  };

  var id = 0;

  function idFactory () {
    return ++id + '@';
  }

  // register the component into the messenger,
  // and the component will be built into a tree, 
  // and every node own an unique MID suffix with @.
  p.checkin = function (component) {
    if (component instanceof Regular) {
      this.checkout(component);
      util._$merge(idMap, regularPlugin.checkin(component, idFactory));
    }
  }

  p.checkout = function (component) {
    this.unsubcribe(true, component);
    if (component instanceof Regular) {
      regularPlugin.checkout(component, idMap);
    }
  }

  p.subcribe = function (component, name, callback, relativePath) {
    var self = this;
    setTimeout(function () {
      var path = component.__MID__;
      if (!path) return;
      if (relativePath) {
        path = self._createPath(path, relativePath);
      } else {
        path = basePath;
      }
      self._subcribeMessageByPath(component, name, callback, path);
    }, 0)
  }

  p._createPath = function (path, relativePath) {
    var currentPath = path;
    relativePath = relativePath || '';
    util._$forEach(relativePath.split('/'), function (item) {
      var
        pathArray = currentPath.split('/');
      if (item === '..') {
        pathArray.pop();
        currentPath = pathArray.join('/');
      } else if (item === '.') {
        currentPath = path;
      }
    })
    if (!currentPath) {
      currentPath = basePath;
    }

    return currentPath;
  }

  p._subcribeMessageByPath = function (component, name, callback, path) {
    var
      pathArray = path.split('/'),
      pathLength = pathArray.length,
      currentPathMap = messageMap,
      currentPathMessages,
      currentPathDispatcherHandler;

    // add into dispatcher map
    if (pathCache[path + '!' + name]) {
      currentPathDispatcherHandler = pathCache[path + '!' + name];
      currentPathDispatcherHandler.push({owner: component, callback: callback});
    } else {
      util._$forEach(pathArray, function (item, i) {
        currentPathMap[item] = currentPathMap[item] || {};
        currentPathMap = currentPathMap[item];
        if (i === pathLength - 1) {
          currentPathMap['messages'] = currentPathMap['messages'] || {};
          currentPathMessages = currentPathMap['messages'];
          currentPathMessages[name] = currentPathMessages[name] || [];
          currentPathDispatcherHandler = currentPathMessages[name];
          currentPathDispatcherHandler.push({owner: component, callback: callback});
          // cache the path
          pathCache[path + '!' + name] = currentPathDispatcherHandler;
        }
      }, this)
    }
  }

  p.unsubcribe = function (component, name, callback, relativePath) {
    var
      path,
      currentPathMap = messageMap,
      cascade;
    if (typeof component === 'boolean') {
      cascade = component;
      component = arguments[1];
      name = arguments[2];
      callback = arguments[3];
      relativePath = arguments[4];
    }
    path = component.__MID__;
    if (!path) return;
    if (relativePath) {
      path = this._createPath(path, relativePath);
    } else {
      path = basePath;
    }

    util._$forEach(path.split('/'), function (item) {
      currentPathMap[item] = currentPathMap[item] || {};
      currentPathMap = currentPathMap[item];
    });

    this._unsubcribeMessageByPathMap(component, name, callback, currentPathMap, cascade);
  }

  p._unsubcribeMessageByPathMap = function (component, name, callback, currentPathMap, cascade) {
    var
      currentPathMessages = currentPathMap['messages'] || {};
    util._$forEach(currentPathMessages, function (typeHandler, typeName) {
      if (!name || typeName === name) {
        util._$forEachReverse(typeHandler, function (item, i) {
          if (!item.owner || (item.owner === component && (!callback || callback === item.callback))) {
            typeHandler.splice(i, 1);
          }
        });
        return typeName === name;
      }
    })
    if (cascade !== false) {
      for (var key in currentPathMap) {
        if (currentPathMap.hasOwnProperty(key) && key !== 'messages') {
          p._unsubcribeMessageByPathMap(component, name, callback, currentPathMap[key], cascade);
        }
      }
    }
  }

  // garbage collect
  p.GC = function () {
  }

  p.dispatch = function (component, name, data, relativePath) {
    var
      path = component.__MID__,
      currentPathMap = messageMap;
    if (!path) return;
    if (relativePath) {
      path = this._createPath(path, relativePath);
    } else {
      path = basePath;
    }
    util._$forEach(path.split('/'), function (item) {
      currentPathMap = currentPathMap[item] || {};
    });
    this._dispatchMessageByPathMap(component, name, data, currentPathMap);
  }

  p._dispatchMessageByPathMap = function (component, name, data, currentPathMap) {
    var
      currentPathMessages = currentPathMap['messages'] || {};
    util._$forEach(currentPathMessages, function (typeHandler, typeName) {
      if (typeName === name) {
        util._$forEachReverse(typeHandler, function (item, i) {
          if (!item.owner || typeof item.callback !== 'function') {
            typeHandler.splice(i, 1);
          } else {
            item.callback(data);
          }
        });

        return typeName === name;
      }
    })

    for (var key in currentPathMap) {
      if (currentPathMap.hasOwnProperty(key) && key !== 'messages') {
        p._dispatchMessageByPathMap(component, name, data, currentPathMap[key]);
      }
    }
  }

  return p;
})
