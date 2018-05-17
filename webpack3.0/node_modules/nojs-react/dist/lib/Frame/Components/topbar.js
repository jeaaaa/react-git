'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ = require('../../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * topbar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var joinClass = _.utils.joinClass;

var Topbar = function (_React$Component) {
    _inherits(Topbar, _React$Component);

    function Topbar() {
        _classCallCheck(this, Topbar);

        return _possibleConstructorReturn(this, (Topbar.__proto__ || Object.getPrototypeOf(Topbar)).apply(this, arguments));
    }

    _createClass(Topbar, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var items = this.props.items;

            items.forEach(function (item) {
                item.index = item.index || 0;
            });
            items.sort(function (a, b) {
                return a.index > b.index;
            });
            var topbarLeft = items.filter(function (item) {
                return item.align == 'left';
            });
            var topbarRight = items.filter(function (item) {
                return item.align == 'right' || !item.align;
            });

            var getItem = function getItem(_ref, i) {
                var content = _ref.content,
                    type = _ref.type,
                    handle = _ref.handle;

                var options = { key: i, className: joinClass('item', type && 'item-' + type), onClick: handle };
                return typeof content == 'string' ? _.React.createElement('div', _extends({}, options, { dangerouslySetInnerHTML: { __html: content } })) : typeof content == 'function' ? content(options, _this2) || null : _.React.createElement(
                    'div',
                    options,
                    content
                );
            };
            return _.React.createElement(
                'div',
                { className: 'grid-topbar' },
                _.React.createElement(
                    'div',
                    { className: '_inner clearfix' },
                    _.React.createElement(
                        'div',
                        { className: 'fl l' },
                        topbarLeft.map(getItem)
                    ),
                    _.React.createElement(
                        'div',
                        { className: 'fr r' },
                        topbarRight.map(getItem)
                    )
                )
            );
        }
    }]);

    return Topbar;
}(_.React.Component);

module.exports = Topbar;