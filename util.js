define([
  'base/platform'
],

function (platform) {
  var
    _r = [],
    _o = {},
    _f = function () {},
    slice = _r.slice,
    concat = _r.concat,
    util = {
      _$error: function (message) {
        throw (new Error(message));
      },

      _$type: function (o) {
        var
          r = /^\[object\s(.*)\]$/;
        return {}.toString.call(o).match(r)[1].toLowerCase();
      },

      _$isObject: function (o) {
        if (!o) {
          return false;
        }
        return this._$type(o) == 'object' || (o && typeof o.nodeType === 'number' && typeof o.nodeName === 'string') || o == window;
      },

      _$isArray: function (a) {
        return this._$type(a) == 'array';
      },

      _$isString: function (s) {
        return this._$type(s) == 'string';
      },

      _$isNumber: function (n) {
        return this._$type(n) == 'number';
      },

      _$isFunction: function (f) {
        return this._$type(f) == 'function';
      },

      _$isBoolean: function (b) {
        return this._$type(b) == 'boolean';
      },

      _$isNaN: function (nan) {
        return this._$isNumber(nan) && isNaN(nan);
      },

      _$isDom: function (obj) {
        if (typeof HTMLElement === 'object') {
          return obj instanceof HTMLElement;
        } else {
          return obj && obj.nodeType == 1 && typeof obj.nodeName === 'string';
        }
      },

      _$isElement: function (dom) {
        return dom && dom.nodeType && typeof dom.nodeName === 'string';
      },

      _$isBlankObject: function (obj) {
        var
          key;
        for (key in obj) {
          if (obj.hasOwnProperty(obj[key])) {
            return true;
          }
        }

        return false;
      },

      _$isHtml: function (str) {
        return /^<.+/.test(str);
      },

      _$forEach: function (obj, callback, context) {
        var
          i = 0,
          key;

        if (!util._$isFunction(callback)) return;
        if (util._$isArray(obj) || (obj && obj.length != undefined)) {
          for (; i < obj.length; i++) {
            if (callback.call(context || obj[i], obj[i], i)) break;
          }
        } else if (util._$isObject(obj)) {
          for (key in obj) {
            if (callback.call(context || obj, obj[key], key)) break;
          }
        }
      },

      _$forEachReverse: function (arr, callback, context) {
        if (util._$isArray(arr) || (arr && arr.length != undefined)) {
          for (var i = arr.length - 1; i >= 0; i--) {
            if (callback.call(context || arr[i], arr[i], i)) break;
          }
        }
      },

      /**
       * bind the events crossing platform
       * @param {DOM} dom the dom to bind the event.
       * @param  {String} type    event type.
       * @param  {Function} handler evnet handler.
       * @return {None}
       */
      _$on: function (dom, type, handler, capture) {
        if (window.addEventListener) {
          dom.addEventListener(type, handler, capture || false);
        } else if (window.attachEvent) {
          dom.attachEvent('on' + type, handler);
        }
      },
      /**
       * unbind the events crossing platform
       * @param {DOM} dom the dom to bind the event.
       * @param  {String} type    event type.
       * @param  {Function} handler evnet handler.
       * @return {None}
       */
      _$off: function (dom, type, handler) {
        if (window.removeEventListener) {
          dom.removeEventListener(type, handler);
        } else if (window.dettachEvent) {
          dom.dettachEvent('on' + type, handler);
        }
      },

      _$merge: function (deep) {
        var
          target,
          srcArray;
        if (util._$isBoolean(deep)) {
          target = util._$isObject(arguments[1]) || util._$isArray(arguments[1]) ? arguments[1] : {};
          srcArray = slice.call(arguments, 2);
        } else {
          target = util._$isObject(deep) || util._$isArray(deep) ? deep : {};
          srcArray = slice.call(arguments, 1);
        }

        util._$forEach(srcArray, function (src) {
          if (util._$isObject(src) || util._$isArray(src)) {
            util._$forEach(src, function (val, key) {
              if (deep === true && (util._$isObject(val) || util._$isArray(val))) {
                if (!util._$isObject(target[key]) && !util._$isObject(target[key])) {
                  target[key] = util._$isObject(val) ? {} : [];
                }

                util._$merge(deep, target[key], val);
              } else {
                target[key] = val;
              }
            })
          }
        });

        return target;
      },

      _$copy: function (obj) {
        return this._$merge(true, {}, obj);
      },

      _$getBrowser: function () {
        // Useragent RegExp
        var rwebkit = /(webkit)[ \/]([\w.]+)/,
          ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
          rmsie = /(msie) ([\w.]+)/,
          rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;
        function uaMatch (ua) {
          ua = ua.toLowerCase();

          var match = rwebkit.exec(ua) ||
                      ropera.exec(ua) ||
                      rmsie.exec(ua) ||
                      ua.indexOf('compatible') < 0 && rmozilla.exec(ua) ||
                      [];

          return { browser: match[1] || '', version: match[2] || '0' };
        }

        var userAgent = window.navigator.userAgent;
        return uaMatch(userAgent);
      },
      _$string2object: function (str, split) {
        var
          arr = str.split(split || '&'),
          ret = {};
        this._$forEach(arr, function (item) {
          item = item.split('=');
          ret[item[0]] = item[1] || '';
        });
        return ret;
      },

      _$object2string: function (obj, split, encode) {
        var result = '';
        var resultArray = [];
        var key, value;
        if (!obj) return result;
        for (key in obj) {
          value = obj[key];
          if (encode) value = encodeURIComponent(value);
          resultArray.push(key + '=' + value);
        }

        result = resultArray.join(split || ',');
        return result;
      },

      /**
       * @method _$json2param
       * @describe transfer from json to string with & signal
       * @param{JSON} data for transfering
       * @return{String}
       */
      _$json2param: function (data, encode) {
        var
          ret = [];
        this._$forEach(data, function (val, key) {
          if (encode) {
            val = encodeURIComponent(val);
          }
          ret.push(key + '=' + val);
        });
        return ret.join('&');
      },

      _$getParam: function (href, key, decode) {
        var
          match = href.split('?'),
          path = match[0],
          param = match[1],
          arr;

        if (!key) return;
        if (param) {
          param = this._$string2object(param);
          if (param[key]) {
            if (decode !== false) {
              return decodeURIComponent(param[key]);
            } else {
              return param[key];
            }
          } else {
            return '';
          }
        } else {
          return null;
        }
      },

      _$getHash: function (url, decode) {
        if (typeof url !== 'string') return '';
        var match = url.split('#');
        return match[1] || '';
      },

      _$getUrlQuery: function (url, decode) {
        var result = {};
        var match, i, len, param, item, _key, _value;
        if (typeof url !== 'string') return result;
        match = url.split('#')[0].split('?');
        param = match[1];
        if (param) {
          param = param.split('&');
          for (i = 0, len = param.length; i < len; i++) {
            item = param[i].split('=');
            _key = item[0];
            _value = item[1];
            result[_key] = decode !== false ? decodeURIComponent(_value) : _value;
          }
        }
        return result;
      },

      _$getUrlPath: function (url) {
        if (typeof url !== 'string') return '';
        return url.split('#')[0].split('?')[0];
      },

      _$setUrl: function (path, query, hash, encode) {
        var url = path;
        if (query) {
          url += '?' + this._$object2string(query, '&', encode !== false)
        }

        if (hash && typeof hash === 'string') {
          url += '#' + hash
        }

        return url;
      },

      _$formatUrl: function (url, data) {
        var path = this._$getUrlPath(url);
        var query = this._$getUrlQuery(url);
        var hash;

        if (data.query) query = this._$merge({}, query, data.query);
        if (data.hash) {
          hash = data.hash;
        } else {
          hash = this._$getHash(url);
        }

        return this._$setUrl(path, query, hash);
      },

      /**
       * get the css of dom crossing platform
       * @param  {Dom} elment the dom that gets the csss
       * @param  {String} cssKey the property of css
       * @return {String} the value of the specified css
       */
      _$getCss: function (element, cssKey) {
        // for IE
        if (element.currentStyle) {
          this._$getCss = function (element, cssKey) {
            return element.currentStyle[cssKey];
          }
        } else {
          this._$getCss = function (element, cssKey) {
            return document.defaultView.getComputedStyle(element)[cssKey];
          }
        }
        return this._$getCss(element, cssKey);
      },

      _$removeCss: function (element, cssKey) {
        if (!(cssKey instanceof Array)) cssKey = [cssKey];
        this._$forEach(cssKey, function (key) {
          element.style.removeProperty ? element.style.removeProperty(key) : element.style.removeAttribute(key);
        })
      },

      _$getElementAbsPos: function (element) {
        var t = element.offsetTop;
        var l = element.offsetLeft;
        while (element = element.offsetParent) {
          t += element.offsetTop;
          l += element.offsetLeft;
        }
        return {left: l, top: t};
      },

      _$getChildElements: function (element) {
        var
          ret = [];

        this._$forEach(element.childNodes, function (node) {
          if (node.nodeType === 1) {
            ret.push(node);
          }
        });

        return ret;
      },
      /**
       * help to count the visiting url for the baidu statistic tool
       * @param  {[type]} url [description]
       * @return {[type]}     [description]
       */
      _$countUrlForStatistics: function (url, callback) {
        if (!url) return;
        var
          nIframe = document.createElement('iframe');
        util._$on(nIframe, 'load', function () {
          // nIframe.parentNode.removeChild(nIframe);
          if (typeof callback === 'function') {
            callback();
          }
        });
        nIframe.style.display = 'none';
        nIframe.src = url;
        document.body.appendChild(nIframe);
      },

      _$isSafari: function () {
        var
          browser = platform._$KERNEL.browser;
        if (browser) {
          browser = browser.toLowerCase()
          return browser === 'safari'
        }
        return false
      },

      _$trim: function (str) {
        return str.replace(/^\s*|\s*$/g, '');
      },
      _$wait: function (key, context, onload, onerror) {
        var
          timer,
          maxCount = 100;
        if (context[key]) {
          if (typeof onload === 'function') {
            onload();
          }
        } else {
          timer = setInterval(function () {
            maxCount--;
            if (maxCount < 0) {
              clearInterval(timer);
              if (typeof onerror === 'function') {
                onerror();
              }
            } else if (context[key]) {
              clearInterval(timer);
              timer = null;
              if (typeof onload === 'function') {
                onload();
              }
            }
          }, 300)
        }
      },
      _$trackEvent: function (trackEvent, category, action, optLabel, optValue) {
        if (window._hmt) {
          window._hmt.push([trackEvent, category, action, optLabel, optValue]);
        }
      }
    }
  return util;
})
