'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _nojsReact = require('./nojs-react');

var _nojsReact2 = _interopRequireDefault(_nojsReact);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 分页组件
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Page = function (_React$Component) {
    _inherits(Page, _React$Component);

    function Page(props) {
        _classCallCheck(this, Page);

        var _this = _possibleConstructorReturn(this, (Page.__proto__ || Object.getPrototypeOf(Page)).call(this, props));

        _this.state = {
            start: 0,
            end: _this.props.perpage,
            page: _this.props.page || 1,
            pages: _this.getPages()
        };
        return _this;
    }

    _createClass(Page, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            this.setState({ pages: this.getPages(nextProps) });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var onChange = this.props.onChange;
            var page = this.state.page;

            setTimeout(function () {
                onChange && onChange(page, page, _this2.setData(_this2.state.page));
            }, 10);
        }
    }, {
        key: 'getPages',
        value: function getPages(props) {
            props = props || this.props;
            return Math.ceil(props.count / props.perpage);
        }
    }, {
        key: 'handleChange',
        value: function handleChange(action, e) {
            var _props = this.props,
                onChange = _props.onChange,
                perpage = _props.perpage,
                data = _props.data;
            var page = this.state.page;

            var _page = page;
            if (typeof action == 'number') {
                page = action;
            } else {
                switch (action) {
                    case 'next':
                        page++;
                        break;
                    case 'prev':
                        page--;
                        break;
                }
            }
            onChange && onChange(_page, page, this.setData(page));
            e.preventDefault();
        }
    }, {
        key: 'setData',
        value: function setData(page) {
            page = page || this.state.page;
            var _props2 = this.props,
                perpage = _props2.perpage,
                data = _props2.data;

            var start = (page - 1) * perpage;
            var end = start + perpage;
            end = end >= data.length ? data.length : end;
            this.setState({ page: page, start: start, end: end });
            var _data = data.slice(start, start + perpage);
            return _data;
        }
    }, {
        key: 'render',
        value: function render() {
            var page = this.state.page;

            var pages = this.getPages(); //总页数
            // console.log(page,pages,this.props.data.length,this.props.perpage)
            return _nojsReact.React.createElement(
                'div',
                { className: 'nj-page ' + this.props.className },
                page > 1 && _nojsReact.React.createElement(
                    'a',
                    { href: '', onClick: this.handleChange.bind(this, 1) },
                    '首页'
                ),
                page > 1 && _nojsReact.React.createElement(
                    'a',
                    { href: '', onClick: this.handleChange.bind(this, 'prev') },
                    '上一页'
                ),
                this.state.page,
                '/',
                pages,
                page < pages && pages > 1 && _nojsReact.React.createElement(
                    'a',
                    { href: '', onClick: this.handleChange.bind(this, 'next') },
                    '下一页'
                ),
                page < pages && pages > 1 && _nojsReact.React.createElement(
                    'a',
                    { href: '', onClick: this.handleChange.bind(this, pages) },
                    '尾页'
                )
            );
        }
    }]);

    return Page;
}(_nojsReact.React.Component);

Page.defaultProps = {
    data: [],
    //每页个数
    perpage: 10
    //page : 1//当前页码
    //pages : 
    //count : //数据数量
};
Page.propTypes = {
    data: _propTypes2.default.array,
    onChange: _propTypes2.default.func
};

module.exports = Page;