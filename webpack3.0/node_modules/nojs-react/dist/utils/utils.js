'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var $ = require('jquery');
var actions = require('./asyncActions');

module.exports = {

    /*
     * 所有依赖dom的ui组件都可以通过id,element,jQuery来获取dom元素
     */
    dom: function dom(selector) {
        if (!selector) {
            return;
        }
        var type = typeof selector === 'undefined' ? 'undefined' : _typeof(selector),
            elem;
        if (type == 'string') {
            //通过id
            elem = $('#' + selector);
        } else if (type == 'object') {
            elem = selector.nodeType || selector === window || selector === window.parent ? $(selector) : selector;
        }
        elem = elem.length ? elem : null;
        return elem;
    },


    //部分组件需要动态插入dom 创建一个该类组件的容器
    createContainer: function createContainer(className) {
        var layerElement = document.createElement('div');
        layerElement.className = className;
        document.body.appendChild(layerElement);
        return layerElement;
    },


    /**
     * 创建事件队列
     * var componentEvent = addEventQueue.call(component, 'onShow', when)
     * component就具备了'onShow'事件
     * 执行事件的时机 componentEvent.complete(args) 或者在when函数中定义
     */
    addEventQueue: function addEventQueue(eventName, when) {
        var self = this;
        var queue = []; //this['_'+eventName+'_queue'] =
        queue.name = eventName;
        function add(handle) {
            handle && queue.push(handle);
            return this;
        }
        function complete() {
            var args = Array.prototype.slice.call(arguments);
            var res,
                fn,
                _res,
                i = 0,
                n = queue.length;
            for (; i < n; i++) {
                fn = queue[i];
                _res = fn.apply(self, args);
                if (_res !== undefined) {
                    res = _res;
                    //返回false后 中断后面事件队列的执行
                    if (res === false) break;
                }
            }
            return res;
        }
        //某些场景 在事件列表执行完成之后需要清空队列
        function end() {
            queue.length = 0;
            return self;
        }
        this[eventName] = add.bind(this);
        typeof when == 'function' && when.call(this, complete);
        this.props && this.props[eventName] && add.call(this, this.props[eventName]);
        return {
            add: add,
            complete: complete,
            end: end
        };
    },


    stopScroll: function stopScroll(object, callback) {
        if (!object) {
            return;
        }
        //自定义鼠标滚轮事件
        var scrollFunc = function scrollFunc(e) {
            e = e || window.event;
            if (e.wheelDelta) {
                //IE/Opera/Chrome 
                e.returnValue = false; //阻止网页滚动条滚动
            } else if (e.detail) {
                //Firefox 
                e.preventDefault();
            }
            callback && callback(e);
        };
        var moveFunc = function moveFunc(e) {
            scrollFunc(e);
            // e.stopPropagation();
        };
        if (document.addEventListener) {
            //firefox
            object.addEventListener("DOMMouseScroll", scrollFunc, false);
            object.addEventListener("touchmove", moveFunc, false);
        }
        object.onmousewheel = scrollFunc; //IE/Opera/Chrome/Safari 
        object.ontouchmove = moveFunc;
    },

    /**
     * 手动触发事件
     * @type  事件类型
     * @element  触发事件dom对象
     *  HTMLEvents   HTMLEvent   initEvent()
        MouseEvents MouseEvent  initMouseEvent()        
        UIEvents    UIEvent initUIEvent()
        参考 http://www.cnblogs.com/MrBackKom/archive/2012/06/26/2564501.html
     */
    fireEvent: function fireEvent(type, element, eventType, data) {
        if (!element) {
            return;
        }
        var result = false;
        eventType = eventType || 'HTMLEvents';
        var init = {
            'HTMLEvents': 'initEvent',
            'MouseEvents': 'initMouseEvent',
            'UIEvents': 'initUIEvent'
        };
        //IE fire event  
        if (element.fireEvent) {
            result = element.fireEvent('on' + type);
            //DOM2 fire event  
        } else if (document.createEvent) {
            var ev = document.createEvent(eventType);
            data = [type, false, true, document.defaultView].concat(data);
            ev[init[eventType]].apply(ev, data);
            result = element.dispatchEvent(ev);
        }
        try {
            result && element[type]();
        } catch (e) {}
    },


    //检测元素是否存在真实dom中
    elementInDOM: function elementInDOM(element) {
        if (!element) {
            return;
        }
        var body = document.body;
        var parent = element;
        while (parent = parent.parentNode) {
            if (parent === body) {
                break;
            }
        }
        if (parent) {
            return true;
        }
    },
    parseCss3: function parseCss3(css) {
        var u = navigator.userAgent.toLowerCase(),
            type = $.type(css),
            browser = '';

        if (type == 'string') {
            css = css.split(';');
        }
        if (type != 'array' || !css.length) {
            return browser;
        }

        if (this.browser('ie')) {
            if (parseInt(this.browser.version) < 9) {
                return browser;
            }
            browser = '-ms-';
        } else if (/webkit/.test(u)) {
            browser = '-webkit-';
        } else if (this.browser('firefox')) {
            browser = '-moz-';
        } else if (this.browser('opera')) {
            browser = '-o-';
        }

        $.each(css, function (i, v) {
            if (v) {
                css[i] = browser + v + ';' + v;
            }
        });
        return css.join(';');
    },

    browser: function () {
        //检测浏览器
        var u = navigator.userAgent.toLowerCase(),
            v = u.match(/(?:firefox|opera|safari|chrome|msie)[\/: ]([\d.]+)/),

        //mozilla/5.0 (windows nt 6.1; wow64; trident/7.0; slcc2; .net clr 2.0.50727; .net clr 3.5.30729; .net clr 3.0.30729; media center pc 6.0; .net4.0c; .net4.0e; rv:11.0) like gecko
        //ie11已去除msie标示 可通过trident检测
        fn = {
            version: v ? v[0] : ' ', //浏览器版本号
            safari: /version.+safari/.test(u),
            chrome: /chrome/.test(u),
            firefox: /firefox/.test(u),
            ie: /msie/.test(u) || /trident/.test(u),
            ie6: /msie 6.0/.test(u),
            ie7: /msie 7.0/.test(u),
            ie8: /msie 8.0/.test(u),
            ie9: /msie 9.0/.test(u),
            opera: /opera/.test(u)
        },
            state;
        function check(name) {
            //多个用空格隔开 如'ie6 ie7'
            state = false;
            name = name.split(' ');
            $.each(name, function (i, val) {
                if (fn[val]) {
                    state = true;
                    return false;
                }
            });
            return state;
        }
        //check.fn = fn;
        check.version = parseInt(fn.version.split(/[\/: ]/)[1].split('.')[0]);
        return check;
    }(),

    /*
     * 读取cookie值: cookie("key"); 
     * 设置/新建cookie的值:    cookie("key", "value");
     * 新建一个cookie 包括有效期(天数) 路径 域名等:cookie("key", "value", {expires: 7, path: '/', domain: 'a.com', secure: true});
     * 删除一个cookie:cookie("key", null);    
     */
    cookie: function cookie(name, value, options) {
        if (typeof value != 'undefined') {
            options = options || {};
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            var expires = '';
            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
                } else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString();
            }
            var path = options.path ? '; path=' + options.path : '';
            var domain = options.domain ? '; domain=' + options.domain : '';
            var secure = options.secure ? '; secure' : '';
            document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        } else {
            var cookieValue = '';
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = $.trim(cookies[i]);
                    if (cookie.substring(0, name.length + 1) == name + '=') {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    },


    /**
     * 本地数据存储
     * localStorage.set(key,value,options)
     * localStorage.get(key)
     */
    localStorage: function () {
        var localStorage = window.localStorage || function () {
            //userData
            var o = document.getElementsByTagName("head")[0],
                n = window.location.hostname || "localStorage",
                d = new Date(),
                doc,
                agent;

            if (!o.addBehavior) {
                return {};
            }
            try {
                agent = new ActiveXObject('htmlfile');
                agent.open();
                agent.write('<s' + 'cript>document.w=window;</s' + 'cript><iframe src="/favicon.ico"></frame>');
                agent.close();
                doc = agent.w.frames[0].document;
            } catch (e) {
                doc = document;
            }
            o = doc.createElement('head');
            doc.appendChild(o);
            d.setDate(d.getDate() + 365);
            o.addBehavior("#default#userData");
            o.expires = d.toUTCString();
            o.load(n);

            var root = o.XMLDocument.documentElement,
                attrs = root.attributes,
                prefix = "prefix_____hack__",
                reg1 = /^[-\d]/,
                reg2 = new RegExp("^" + prefix),
                encode = function encode(key) {
                return reg1.test(key) ? prefix + key : key;
            },
                decode = function decode(key) {
                return key.replace(reg2, "");
            };

            return {
                length: attrs.length,
                getItem: function getItem(key) {
                    return (attrs.getNamedItem(encode(key)) || { nodeValue: null }).nodeValue || root.getAttribute(encode(key));
                },
                setItem: function setItem(key, value) {
                    root.setAttribute(encode(key), value);
                    o.save(n);
                    this.length = attrs.length;
                },
                removeItem: function removeItem(key) {
                    root.removeAttribute(encode(key));
                    o.save(n);
                    this.length = attrs.length;
                },
                clear: function clear() {
                    while (attrs.length) {
                        this.removeItem(attrs[0].nodeName);
                    }
                    this.length = 0;
                },
                key: function key(i) {
                    return attrs[i] ? decode(attrs[i].nodeName) : undefined;
                }
            };
        }();
        var exports = {
            length: localStorage.length,
            set: function set(key, value, options) {
                options = options || {};

                //iPhone/iPad 'QUOTA_EXCEEDED_ERR'
                if (this.get(key, false) !== undefined) {
                    this.remove(key);
                }

                //options.expires过期时间 单位天  使用一个独立的key来保存所有设置过期时间的键
                if (typeof options.expires == 'number') {
                    expiresData[key] = +new Date() + options.expires * 24 * 60 * 60 * 1000;
                    exports.set(expiresKey, JSON.stringify(expiresData));
                }

                localStorage.setItem(key, value, options);
                this.length = localStorage.length;
            },
            get: function get(key, isCheck) {
                //get时检测是否过期
                isCheck = isCheck === false ? false : true; //防止重复查询
                isCheck && expiresCheck();
                var v = localStorage.getItem(key);
                return v === null ? undefined : v;
            },
            remove: function remove(key) {
                localStorage.removeItem(key);
                this.length = localStorage.length;
            },
            clear: function clear() {
                localStorage.clear();
                this.length = 0;
            },
            key: function key(index) {
                //获取索引为index的key名称
                return localStorage.key(index);
            }
        },
            expiresKey = '__expireskey__',
            expiresData = exports.get(expiresKey, false);

        //检测是否过期
        function expiresCheck() {
            var key,
                i = 0;
            for (key in expiresData) {
                if (+new Date() > expiresData[key]) {
                    exports.remove(key);
                    delete expiresData[key];
                    continue;
                }
                i++;
            }
            if (i > 0) {
                exports.set(expiresKey, JSON.stringify(expiresData));
            } else {
                //全部过期 删除此key
                exports.remove(expiresKey);
            }
        }
        if (expiresData) {
            expiresData = JSON.parse(expiresData);
            expiresCheck();
        } else {
            expiresData = {};
        }
        exports.check = expiresCheck;

        return exports;
    }(),

    tmpl: function () {
        /*
         * js模版引擎
         * http://ejohn.org/blog/javascript-micro-templating/
         */
        var c = {};
        return function (s, d) {
            var fn = !/\W/.test(s) ? c[s] = c[s] || module.exports.tmpl(document.getElementById(s).innerHTML) : new Function("o", "var p=[];" + "with(o){p.push('" + s
            //.replace(/\\/g,"\\\\")//解决转义符bug
            .replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r")

            //.replace(/\t=(.*?)%>/g, "',$1,'")
            //将undefined的值置为''
            .replace(/\t=(.*?)%>/g, "',(typeof $1=='undefined'?'':$1),'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
            return d ? fn(d) : fn;
        };
    }(),

    /**
     * 将容器上自带属性拷贝到组件上
     */
    getAttributes: function getAttributes(node) {
        var attrs = node.attributes;
        var options = {};

        //部分属性需要替换为符合react规范
        var needReplace = _defineProperty({
            'class': 'className',
            'novalidate': 'noValidate',
            'cellpadding': 'cellPadding',
            'cellspacing': 'cellSpacing',
            'rowspan': 'rowSpan',
            'colspan': 'colSpan',
            'defaultvalue': 'defaultValue',
            'defaultchecked': 'defaultChecked',
            'enctype': 'encType',
            'readonly': 'readOnly',
            'checked': 'defaultChecked'
        }, 'enctype', 'encType');
        for (var i = 0, n = attrs.length; i < n; i++) {
            var attr = attrs[i];
            var name = attr.name;
            if (name == 'id') {
                continue;
            }

            // if( name=='value' && node.type=='text' ){
            //     options['defaultValue'] = attr.value
            //     continue
            // }
            var value = attr.value;
            value = /^(true|false)$/.test(value) ? eval(value) : value;
            if (needReplace[name]) {
                options[needReplace[name]] = value;
            } else {
                options[name] = value;
            }
        }
        return options;
    },


    /**
     * 时间格式化字符串
     * @format[string] 'yy/mm/dd hh:mm:ss'
     */
    dateParse: function dateParse(options) {
        options = options || {};
        // console.log(options.date,new Date(Number(options.date)))
        var date = options.date ? new Date(options.date) : new Date();
        var format = options.format || 'yy-mm-dd hh:mm:ss';
        var arr = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
        var strMaps = {
            'yy': '0',
            'mm': '1,4',
            'dd': '2',
            'hh': '3',
            'ss': '5'
        };
        if (typeof format == 'string') {
            var i = 0;
            format = format.replace(/\b(\w+)\b/g, function (a) {
                var index = (strMaps[a] || '').split(',');
                while (index.indexOf(String(i)) < 0) {
                    arr.shift();
                    i++;
                }
                var d = String(arr.shift());
                i++;
                return a.length > d.length ? '0' + d : d;
            });
        }
        return format;
    },


    //将类数组转换为真正的数组 如dom集合
    toArray: function toArray(data) {
        var array = [];
        for (var i = 0, n = data.length; i < n; i++) {
            array.push(data[i]);
        }
        return array;
    },
    joinClass: function joinClass() {
        var args = Array.prototype.slice.call(arguments, 0);
        var arrs = [];
        for (var i = 0; i < args.length; i++) {
            var c = args[i] || '';
            var arr = String(c).split(' ');
            Array.prototype.push.apply(arrs, arr);
        }
        return arrs.filter(function (c) {
            if (c) {
                return c;
            }
        }).join(' ');
    },


    //标准数组和json数组的转换
    arrayTransfor: function arrayTransfor(data) {},
    parseHash: function parseHash() {
        var hash = location.hash.replace(/^#/, '');
        var hashData = {};
        hash.split('&').forEach(function (h) {
            h = h.split('=');
            hashData[h[0]] = decodeURIComponent(h[1]);
        });
        return hashData;
    },


    //获取select选中项
    selectedOptions: function selectedOptions(select) {
        var selectedOption;
        if (select.selectedOptions) {
            selectedOption = select.selectedOptions[0];
        } else {
            //ie不支持selectedOptions
            this.toArray(select.options).forEach(function (option) {
                if (option.selected) {
                    selectedOption = option;
                }
            });
        }
        return {
            value: selectedOption.value,
            text: selectedOption.innerText
        };
    },
    getOptions: function getOptions(target, key) {
        var options = $.trim($(target).data(key || 'options')).replace(/[\r\n]/g, '');
        options = options ? eval('({' + options + '})') : {};
        return options;
    }
};
module.exports.action = actions(module.exports);

if (typeof Object.assign == 'undefined') {
    Object.assign = function (target) {
        var arr = Array.prototype.slice.call(arguments, 1);
        arr.forEach(function (item) {
            if (!item || (typeof item === 'undefined' ? 'undefined' : _typeof(item)) != 'object') {
                return;
            }
            for (var i in item) {
                target[i] = item[i];
            }
        });
        return target;
    };
}