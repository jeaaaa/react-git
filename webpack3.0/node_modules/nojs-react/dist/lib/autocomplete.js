'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * auto-complete
 */
var nj = require('./nojs-react');
var React = nj.React,
    ReactDOM = nj.ReactDOM,
    mixins = nj.mixins,
    utils = nj.utils,
    Mui = nj.Mui;

var $ = require('jquery');
var Popover = require('./popover');

var _require = require('./form'),
    Form = _require.Form,
    Input = _require.Input;
// var fetch = require('isomorphic-fetch')


var Directive = require('../mixins/directiveComponent');

var Autocomplete = module.exports = React.createClass({
    displayName: 'exports',

    mixins: [mixins.childComponents.config],
    getDefaultProps: function getDefaultProps() {
        return { getItem: function getItem(item) {
                return String(item);
            }, disableEnter: false, max: 20 };
    },
    getInitialState: function getInitialState() {
        var _props = this.props,
            _props$results = _props.results,
            results = _props$results === undefined ? [] : _props$results,
            disable = _props.disable,
            _props$value = _props.value,
            value = _props$value === undefined ? '' : _props$value;

        return {
            results: results,
            value: value,
            disable: disable,
            //缓存远程数据
            cache: {}
        };
    },
    keyup: function keyup(e) {
        var self = this;
        var key = e.keyCode,
            value = e.target.value;
        // 有效输入键
        // [8 : backspace] [32 : space] [46: delete]
        if (key == 8 || key == 32 || key == 46 || key == 229 // 中文键或全角 部分可输入字符
        || key > 47 && key < 58 // [48-57 : 0-9]
        || key > 64 && key < 91 // [65-90 : a-z]
        || key > 95 && key < 112 // [96-111 : 小键盘]
        || key > 185 && key < 193 // [186-192 : ;=<->/`]
        || key > 218 && key < 223 // [219-222 : [\]' ]
        ) {
                var search = function search() {
                    self.filter(value);
                    self.keyupEvent.complete(value, key);
                };

                clearTimeout(this._delay);

                this._delay = setTimeout(search, this.props.source ? 300 : 0);
            }
    },
    keydown: function keydown(e) {
        var key = e.keyCode;
        switch (key) {
            case 13:
                //enter
                this.move('enter');
                if (this.props.disableEnter) {//阻止触发表单事件 

                }
                e.preventDefault();
                break;
            case 38:
                //up
                this.move("up");
                break;
            case 40:
                //down
                this.move("down");
                break;
        }
    },

    //移动鼠标选中结果项
    move: function move(direction) {
        var _state = this.state,
            index = _state.index,
            results = _state.results;

        var length = results.length;
        var value, item;
        index = typeof index == 'number' ? index : -1;

        if (direction == 'enter') {
            item = results[index];
            value = item ? this.props.getItem(item) : this.state.value;
            this.enterEvent.complete(index, value);
            index >= 0 && this.select(index, 'enter');
            return;
        }

        if (direction == 'up') {
            index = index <= 0 ? length - 1 : --index;
        } else if (direction == 'down') {
            index = index >= length - 1 ? 0 : ++index;
        }
        item = results[index];
        value = item ? this.props.getItem(item) : this.state.value;
        this.setState({ index: index, value: value });
        this.moveEvent.complete(index, value);

        var onChange = this.props.onChange;
        onChange && onChange(value, index);
    },
    select: function select(index, type, e) {
        var _this = this;

        var item = this.state.results[index];
        if (!item) {
            return;
        }
        var _refs = this.refs,
            text = _refs.text,
            container = _refs.container;
        var input = text.refs.input;

        var value = this.props.getItem(item);
        var onChange = this.props.onChange;
        onChange && onChange(value);

        this.state.value = value;
        this.state.index = index;

        this.setState({ value: value, index: index });
        this.chooseEvent.complete(item, type === 'enter');
        type == 'click' && input.focus();
        this.setDisplay(false);
        window.setTimeout(function (e) {
            return _this.setDisplay(false);
        }, 450);
    },
    componentDidMount: function componentDidMount() {
        var results = this.state.results; //默认传入的results

        if (results) {
            this.forceUpdate(function () {
                //var {container} = this.refs                
            });
        }
        this.fetchBeforeEvent = utils.addEventQueue.call(this, 'onFetchBefore');
        this.fetchEvent = utils.addEventQueue.call(this, 'onFetch');
        this.fetchCompleteEvent = utils.addEventQueue.call(this, 'onFetchComplete');

        this.completeEvent = utils.addEventQueue.call(this, 'onComplete'); //筛选完成后触发

        this.chooseEvent = utils.addEventQueue.call(this, 'onChoose');
        this.enterEvent = utils.addEventQueue.call(this, 'onEnter');
        this.moveEvent = utils.addEventQueue.call(this, 'onMove');
        this.keyupEvent = utils.addEventQueue.call(this, 'onKeyup'); //输入时触发
    },
    componentDidUpdate: function componentDidUpdate() {
        var _this2 = this;

        var _refs2 = this.refs,
            text = _refs2.text,
            container = _refs2.container;
        var input = text.refs.input;


        if (container && !container._init_) {
            container._init_ = true;
            container.onShow(function (e) {
                $(container.wrap).width($(input).outerWidth());
            }).onDisplayChange(function (visible) {
                var results = _this2.state.results;

                if (visible && (!results.length || !input.value)) {
                    //没有结果 阻止显示
                    return false;
                }
            });
        }
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        var value = nextProps.value,
            disable = nextProps.disable;

        this.setState({ disable: disable });
        value !== undefined && this.setState({ value: value });
    },
    setDisplay: function setDisplay(display) {
        var container = this.refs.container;
        if (container) {
            container.setDisplay(display);
            display && container.align.set();
        }
    },
    filter: function filter(value) {
        var _this3 = this;

        var _refs3 = this.refs,
            text = _refs3.text,
            container = _refs3.container;
        var input = text.refs.input;


        var done = function done(results) {
            results = results.slice(0, max);
            _this3.setState({ results: results, index: null });
            _this3.setDisplay(results.length && input.value ? true : false);
            _this3.completeEvent.complete(results, input.value);
        };

        if (!value) {
            var results = this.props.results || [];
            done(results);
            return;
        }
        var _props2 = this.props,
            data = _props2.data,
            source = _props2.source,
            getItem = _props2.getItem,
            max = _props2.max;

        data = data && typeof data == 'string' ? JSON.parse(data) : data;

        if (data) {
            var results = data.filter(function (item) {
                return getItem(item).indexOf(value) >= 0;
            });
            done(results);
        } else if (source) {
            //remote fetch
            var cache = this.state.cache;

            var _data = cache[source + value];

            var res = this.fetchBeforeEvent.complete(value, _data);
            if (res === false) {
                return;
            }

            if (_data) {
                done(_data);
                return;
            }
            var promise = $.getJSON(source + value);
            // var promise = fetch(source+value, {
            //     credentials: 'include',
            //     method : 'GET',
            //     mode: "no-cors",
            //     headers : {'X-Requested-With':'XMLHttpRequest'}
            // }).then(res=>res.json())

            promise = this.fetchEvent.complete(promise, value) || promise;

            promise.then(function (json) {
                json = _this3.fetchCompleteEvent.complete(json) || json || [];
                cache[source + value] = json;
                if (input.value) {
                    done(json);
                } else {
                    _this3.setDisplay(false);
                }
            });
        }
    },
    change: function change(e) {
        var onChange = this.props.onChange;

        var value = e.target.value;
        this.setState({ value: value });
        onChange && onChange(value);
        e.stopPropagation(); //onChange事件会影响到父组件 阻止冒泡
    },
    render: function render() {
        var _this4 = this;

        var _props3 = this.props,
            container = _props3.container,
            getItem = _props3.getItem,
            name = _props3.name;
        var _state2 = this.state,
            index = _state2.index,
            value = _state2.value,
            results = _state2.results,
            disable = _state2.disable;
        var text = this.refs.text;


        if (!container && value) {
            var list = React.createElement(
                'ul',
                null,
                results.map(function (item, i) {
                    item = getItem(item);
                    return React.createElement(
                        'li',
                        { key: item, onClick: _this4.select.bind(_this4, i, 'click'), className: i === index ? 'active nj-mui-active' : '' },
                        React.createElement(
                            Mui,
                            null,
                            item
                        )
                    );
                })
            );
        }
        return React.createElement(
            'span',
            null,
            React.createElement(Input, _extends({}, this.props, {
                ref: 'text',
                value: value,
                onChange: this.change,
                onKeyDown: this.keydown,
                onKeyUp: !disable && this.keyup })),
            !container && text && !disable && React.createElement(Popover, {
                nearby: text.refs.input,
                trigger: 'click',
                ref: 'container',
                name: 'auto-complete-pop auto-complete-' + name,
                template: list })
        );
    }
});

var directive = new Directive({
    elementGroups: {
        'autocomplete': { component: Autocomplete }
    },
    exports: exports
});