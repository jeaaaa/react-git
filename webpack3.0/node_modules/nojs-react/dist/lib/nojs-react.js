'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

require('../../css/react.css');

//引入React和ReactDOM
var React = exports.React = require('react');
var ReactDOM = exports.ReactDOM = require('react-dom');
var $ = require('jquery');
exports.render = ReactDOM.render;

//工具集
exports.utils = require('../utils/utils');

exports.mixins = {
    setDisplay: require('../mixins/effect'),
    childComponents: require('../mixins/childComponents')
};

/**
 * fetch: 针对IE低版本处理
 * https://github.com/camsong/blog/issues/2
 * 
 * 由于 IE8 是 ES3，需要引入 ES5 的 polyfill: es5-shim, es5-sham
 * 引入 Promise 的 polyfill: es6-promise
 * 引入 fetch 探测库：fetch-detector
 * 引入 fetch 的 polyfill: fetch-ie8
 * 可选：如果你还使用了 jsonp，引入 fetch-jsonp
 * 可选：开启 Babel 的 runtime 模式，现在就使用 async/await
 */
require('fetch-detector');
require('fetch-ie8');
require('es6-promise').polyfill();

/**
 * html标签指令组件 兼容ie处理
 * 保证nojs-react在head处引入并执行
 */
'form|input|input-group|select|scroll|scroll-items|scroll-page|switch|switch-menu|switch-item'.split('|').forEach(function (dir) {
    return document.createElement('nj-' + dir);
});

var isMobile = exports.isMobile = screen.width <= 640;
exports.clickEvent = isMobile ? 'tap' : 'click';

window.noJS = window.noJS || {};
window.noJS.ready = function (fn) {
    fn(exports);
};

var muiTimer;
function addMui(e) {
    var mui = $('<div class="nj-mui"><span></span></div>');
    var self = $(this);
    var mode = self.attr('data-mode');
    var className = 'nj-mui-active nj-mui-item nj-mui-' + mode;

    self.addClass(className).append(mui);
    mui.children().css(exports.Mui.style(e, this, mode));

    muiTimer && window.clearTimeout(muiTimer);
    muiTimer = window.setTimeout(function (e) {
        self.removeClass(className).find('.nj-mui').remove();
    }, 2500);
}

var nj_selector = 'button';

exports.mui = function (selector) {
    nj_selector += ',' + selector;
};

$(function () {
    $(document).delegate(nj_selector, 'click', addMui);
});

var Mui = function (_React$Component) {
    _inherits(Mui, _React$Component);

    _createClass(Mui, null, [{
        key: 'style',
        value: function style(e, node, mode) {
            if (mode == 'circle') {
                return { width: '100%', height: '100%', left: '0', top: '0' };
            }
            var self = $(node);
            var offset = self.offset();
            var size = self.outerWidth();

            var top = e.clientY - offset.top + $(window).scrollTop();
            var left = e.clientX - offset.left + $(window).scrollLeft();
            var radius = (left > size / 2 ? left : size - left) + 5;

            return {
                'width': radius * 2,
                'height': radius * 2,
                'top': top - radius,
                'left': left - radius
            };
        }
    }]);

    function Mui(props) {
        _classCallCheck(this, Mui);

        var _this = _possibleConstructorReturn(this, (Mui.__proto__ || Object.getPrototypeOf(Mui)).call(this, props));

        _this.state = { animate: [] };
        return _this;
    }

    _createClass(Mui, [{
        key: 'handleClick',
        value: function handleClick(e) {
            var _this2 = this;

            var animate = this.state.animate;

            var style = exports.Mui.style(e, ReactDOM.findDOMNode(this), this.props.mode);

            var timer = this.state.timer = window.setTimeout(function (e) {
                animate.shift();
                _this2.setState({ animate: animate });
            }, 3000);
            animate.push(timer);

            this.setState({ animate: animate, style: style });
            var onClick = this.props.onClick;

            onClick && onClick(e);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.clearTimeout(this.state.timer);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                tag = _props.tag,
                mode = _props.mode;
            var _state = this.state,
                animate = _state.animate,
                style = _state.style;

            var className = exports.utils.joinClass(this.props.className, animate && 'nj-mui-active', 'nj-mui-item', 'nj-mui-' + mode);
            return React.createElement(tag, Object.assign({}, this.props, {
                onClick: this.handleClick.bind(this),
                className: className
            }), this.props.children, animate.map(function (item, i) {
                return React.createElement(
                    'div',
                    { className: 'nj-mui', key: item },
                    React.createElement('span', { style: style })
                );
            }));
        }
    }]);

    return Mui;
}(React.Component);

Mui.defaultProps = { tag: 'div', mode: 'rect' };

exports.Mui = Mui;