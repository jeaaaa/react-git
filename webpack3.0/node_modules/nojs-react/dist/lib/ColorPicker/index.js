'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _nojsReact = require('../nojs-react');

var _popover = require('../popover');

var _popover2 = _interopRequireDefault(_popover);

var _color = require('./color');

var _color2 = _interopRequireDefault(_color);

var _utils = require('./utils');

require('../../../css/color.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 取色器
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 2017-12-15
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var ColorPicker = function (_React$Component) {
    _inherits(ColorPicker, _React$Component);

    function ColorPicker(props) {
        _classCallCheck(this, ColorPicker);

        var _this = _possibleConstructorReturn(this, (ColorPicker.__proto__ || Object.getPrototypeOf(ColorPicker)).call(this, props));

        var data = Object.assign({}, _this.props);
        data.color = (0, _utils.dealColor)(data.color);
        _this.state = {
            data: data
        };
        return _this;
    }

    _createClass(ColorPicker, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var _props = this.props,
                visible = _props.visible,
                children = _props.children,
                _onChange = _props.onChange,
                _onSubmit = _props.onSubmit;

            this.pop = _popover2.default.create({
                trigger: 'click',
                effect: 'normal',
                nearby: (0, _jquery2.default)(_nojsReact.ReactDOM.findDOMNode(this))

            }).onShow(function () {
                var template = _nojsReact.React.createElement(_color2.default, {
                    data: _this2.state.data,
                    onChange: function onChange(data) {
                        _this2.setState({ data: data });
                        _onChange && _onChange(data);
                    },
                    onSubmit: function onSubmit(data) {
                        _this2.setState({ data: data });
                        _this2.pop.setDisplay(false);
                        _onSubmit && _onSubmit(data);
                    },
                    onCancel: function onCancel(data) {
                        return _this2.pop.setDisplay(false);
                    }
                });
                _this2.pop.setState({ template: template });
            }).onHide(function () {
                _this2.pop.setState({ template: null });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var children = this.props.children;
            var data = this.state.data;

            if (!children) {
                return _nojsReact.React.createElement(
                    'span',
                    { className: 'color-picker' },
                    _nojsReact.React.createElement('span', { className: data.color ? 'inner' : 'transparent', style: { backgroundColor: '#' + data.color } })
                );
            }
            return children;
        }
    }]);

    return ColorPicker;
}(_nojsReact.React.Component);

exports.default = ColorPicker;