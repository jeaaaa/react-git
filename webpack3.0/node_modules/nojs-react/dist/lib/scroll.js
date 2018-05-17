'use strict';

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _nojsReact = require('./nojs-react');

var _nojsReact2 = _interopRequireDefault(_nojsReact);

var _directiveComponent = require('../mixins/directiveComponent');

var _directiveComponent2 = _interopRequireDefault(_directiveComponent);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

require('./touch');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* 
 * [jQuery animate动画扩展]
 * http://gsgd.co.uk/sandbox/jquery/easing/jquery.easing.1.3.js
 * easeIn：加速度缓动；
 * easeOut：减速度缓动；
 * easeInOut：先加速度至50%，再减速度完成动画
 */
_jquery2.default.extend(_jquery2.default.easing, {
    //指数曲线缓动
    easeOutExpo: function easeOutExpo(x, t, b, c, d) {
        return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    }
}); /*
     * 无间断滚动
     */


var Scroll = _nojsReact.React.createClass({
    displayName: 'Scroll',

    mixins: [_nojsReact.mixins.childComponents.config],
    getDefaultProps: function getDefaultProps() {
        return {
            //滚动方向，默认纵向
            direction: 'y',
            children: []
        };
    },
    getInitialState: function getInitialState() {
        var _props = this.props,
            _props$step = _props.step,
            step = _props$step === undefined ? 1 : _props$step,
            time = _props.time,
            _props$repeat = _props.repeat,
            repeat = _props$repeat === undefined ? true : _props$repeat,
            _props$auto = _props.auto,
            auto = _props$auto === undefined ? true : _props$auto;

        step = parseInt(step);
        return {
            step: step, //滚动步长，0为连续滚动
            time: time || (step ? 6000 : 30), //滚动速度，连续推荐设置40ms ;间断滚动时，该值为滚动的间隔时间
            repeat: repeat, //是否重复循环无间断
            auto: auto,

            index: 0,
            size: {},
            // totalLength : length,//总个数 包含追加
            scrollLength: 0 //已滚动个数
        };
    },
    componentDidMount: function componentDidMount() {
        var _this = this;

        this.scrollEvent = _nojsReact2.default.utils.addEventQueue.call(this, 'onScroll');
        this.scrollEndEvent = _nojsReact2.default.utils.addEventQueue.call(this, 'onScrollEnd');

        //React创建的组件 父组件完成后 首次要更新下page
        var page = this.state.page;

        if (page) {
            this.onScrollEnd(function (e) {
                return _this.start();
            });
            page.forceUpdate();
        }

        directive.getChildComponents(this);

        this.props.computed && (0, _jquery2.default)(window).on('resize', function () {
            _this.reset();
        });
        setTimeout(function () {
            //computed情况下 scroll-items组件必须先计算完成后 这里才reset
            _this.reset();

            var _state = _this.state,
                length = _state.length,
                view = _state.view,
                step = _state.step,
                size = _state.size,
                itemsComponent = _state.itemsComponent;
            // console.log(length,view)

            if (length <= view) {
                return;
            }
            var nextLast = length % view;

            //初始化的追加个数 保证next即可 
            //next所需:view-nextLast
            //step==0连续滚动时 拷贝view个即可
            nextLast && _this.append(0, step ? view - nextLast : view);

            var direction = _this.props.direction;
            if (direction == 'y') {
                size.total = (0, _jquery2.default)(itemsComponent.refs.items).height();
            }
            _this.start();

            var wrap = (0, _jquery2.default)(itemsComponent.refs.wrap);
            wrap.hover(function () {
                _this.stop();
            }, function () {
                _this.start();
            });

            //mobile touch
            if (screen.width <= 640) {
                var prevAction = direction == 'y' ? 'swipeDown' : 'swipeRight',
                    nextAction = direction == 'y' ? 'swipeUp' : 'swipeLeft';

                wrap[prevAction](function () {
                    _this.scroll(false);
                    return false;
                });
                wrap[nextAction](function () {
                    _this.scroll();
                    return false;
                });
            }
        }, 1);

        createdEvents.complete(this);
    },
    append: function append(start, appendLength) {
        /*
         * 使用向后追加元素的方式来实现不间断滚动
         * 初始化追加一次 ；每次滚动完毕后检测是否追加
         */
        var _state2 = this.state,
            repeat = _state2.repeat,
            length = _state2.length,
            size = _state2.size,
            itemsComponent = _state2.itemsComponent;

        if (!repeat) {
            return;
        }
        var _itemsComponent$props = itemsComponent.props,
            children = _itemsComponent$props.children,
            _children = _itemsComponent$props._children;

        var copy,

        //剩余一次可截取个数
        last = length - start,
            c;

        //以html指令方式创建的组件 这里要手动append dom
        var doms = _children,
            domSlice = [];

        if (appendLength > last) {
            copy = children.slice(start); //从当前copy到结尾
            if (doms) {
                children.forEach(function (n, i) {
                    i >= start && domSlice.push(i);
                });
            }
            start = 0;
            appendLength = appendLength - copy.length;
        }
        c = children.slice(start, start + appendLength);
        if (doms) {
            children.forEach(function (n, i) {
                i >= start && i < start + appendLength && domSlice.push(i);
            });
        }
        if (copy) {
            Array.prototype.push.apply(copy, c);
        } else {
            copy = c;
        }

        var _totalLength = this.state.totalLength; //添加之前的个数

        Array.prototype.push.apply(children, copy);

        this.state.totalLength = children.length; //追加后的总个数

        if (this.props.direction == 'x') {
            size.total = this.state.totalLength * size.item;
        }
        this.setState({ size: size });
        itemsComponent.setState({ children: children }, function (a) {
            if (doms) {
                domSlice.forEach(function (n) {
                    itemsComponent.refs['item' + _totalLength].appendChild(doms[n].cloneNode(true));
                    _totalLength++;
                });
            }
        });
    },
    start: function start() {
        var _this2 = this;

        var _state3 = this.state,
            auto = _state3.auto,
            length = _state3.length,
            view = _state3.view,
            time = _state3.time;
        // console.log(length,auto,view)

        if (auto && length > view) {
            clearInterval(this.delay);
            this.delay = setInterval(function () {
                _this2.scroll();
            }, time);
        }
    },
    stop: function stop() {
        this.delay = clearInterval(this.delay);
    },
    reset: function reset() {
        // var {childComponents} = this.state
        var _props2 = this.props,
            computed = _props2.computed,
            direction = _props2.direction,
            step = _props2.step;

        var itemsComponent = this.state.itemsComponent;
        var horizontal = direction == 'x';
        var wrap = (0, _jquery2.default)(itemsComponent.refs.wrap);
        var content = (0, _jquery2.default)(itemsComponent.refs.items);
        var item = (0, _jquery2.default)(itemsComponent.refs.item0);

        var size = this.state.size = {
            box: horizontal ? wrap.width() : wrap.height(), //容器尺寸
            total: horizontal ? null : content.height(), //内容总尺寸
            item: horizontal ? item.outerWidth(true) : item.outerHeight(true) //单项尺寸
        };
        if (horizontal) {
            size.total = this.state.totalLength * size.item;
        }
        this.state.view = Math.ceil(size.box / size.item);

        if (step == 'view') {
            this.state.step = this.state.view;
        }
        this.setState({ size: size });
        itemsComponent.forceUpdate();
    },
    scroll: function scroll(next) {
        var _this3 = this;

        if ((0, _jquery2.default)(_nojsReact.ReactDOM.findDOMNode(this)).is(':hidden')) {
            return;
        }
        /*
         * next 
         * boolean: 向前/后滚动 控制方向
         * number: 索引值 直接滚动到某一张 （若repeat=true 该索引是相对追加之前的）
         */
        var _state4 = this.state,
            size = _state4.size,
            step = _state4.step,
            scrollLength = _state4.scrollLength,
            totalLength = _state4.totalLength,
            length = _state4.length,
            view = _state4.view,
            itemsComponent = _state4.itemsComponent;

        var index;
        if (typeof next == 'number') {
            index = getIndex(next, length);
        } else {
            next = next === false ? false : true;
        }
        if (next !== undefined) {
            this.start(); //外部控制滚动后 重新开始计时
        }
        var wrap = (0, _jquery2.default)(itemsComponent.refs.wrap);

        var direction = this.props.direction;

        //if( this.wrap.is(":animated") ) { return;}

        wrap.stop();

        var isExist = _nojsReact2.default.utils.elementInDOM(_nojsReact.ReactDOM.findDOMNode(this)); //组件是否被移除
        if (!isExist) {
            this.stop();
            wrap.stop();
            return;
        }

        var T = this,
            m,
            speed = 0,

        //每次滚动距离，连续-每次增加1px，间隔-每次增加n个元素的宽高
        //计算最大滚动差
        max = size.total - size.box,
            scrollAttr = direction == 'x' ? 'scrollLeft' : 'scrollTop',
            attr = {},
            now = wrap[scrollAttr](),
            nowScroll,
            ratio = next ? 1 : -1;

        if (step == 0) {
            m = 1;
        } else {
            m = step * size.item;
            speed = 800;
        }

        if (step) {
            m = ratio * m;

            //不足prev时 向后跳转this.len的个数
            if (!next && scrollLength < step && typeof index == 'undefined') {
                var prevLast = totalLength - (scrollLength + length);

                if (prevLast < view) {
                    this.append(totalLength % length, view - prevLast);
                    totalLength = this.state.totalLength;
                    // scrollLength = this.state.scrollLength
                }
                wrap[scrollAttr](wrap[scrollAttr]() + size.item * length);
                scrollLength += length;
            }

            scrollLength += ratio * step;
        } else {
            //连续滚动
            scrollLength = Math.floor(now / size.item);
        }
        this.state.index = scrollLength % length; //当前开始index

        if (typeof index == 'undefined') {
            attr[scrollAttr] = '+=' + m;
            this.state[scrollAttr] = nowScroll = now + ratio * m;
        } else {
            scrollLength = index;
            this.state.index = index;
            attr[scrollAttr] = this.state[scrollAttr] = nowScroll = now = size.item * index;
        }
        this.state.scrollLength = scrollLength;
        this.state.endIndex = getIndex(this.state.index + view - 1, length); //当前结束index

        wrap.animate(attr, speed, 'easeOutExpo', function () {
            if (nowScroll >= length * size.item) {
                //滚动过得距离超过总长度  则向前跳转一次
                var newPos = step ? size.item * _this3.state.index : 0;
                wrap[scrollAttr](newPos);
                scrollLength = _this3.state.scrollLength = _this3.state.index = step ? _this3.state.index : newPos;
                //T.step==0 && T.scroll();
            }
            var last = totalLength - scrollLength - view;
            if (last < view) {
                //需再次追加 此处step=0不会存在
                _this3.append(getIndex(_this3.state.endIndex + last + 1, length), view - last);
            }
            _this3.scrollEndEvent.complete();
        });
        // this.setState({index:this.state.index})
        this.state.childComponents.forEach(function (c) {
            c.forceUpdate();
        });
        this.scrollEvent.complete(this.state.index);
    },
    render: function render() {
        var _props3 = this.props,
            className = _props3.className,
            children = _props3.children;

        className = _nojsReact2.default.utils.joinClass('nj-scroll', className);
        return _nojsReact.React.createElement(
            'div',
            { className: className },
            children
        );
    }
});
Scroll.PropTypes = {
    step: _propTypes2.default.number,
    time: _propTypes2.default.number,
    pageTemplate: _propTypes2.default.func
};

var createdEvents = _nojsReact2.default.utils.addEventQueue.call(Scroll, 'onCreated');

var ScrollItems = _nojsReact.React.createClass({
    displayName: 'ScrollItems',

    mixins: [_nojsReact.mixins.childComponents.setParents([Scroll])],
    getInitialState: function getInitialState() {
        return {};
    },
    componentDidMount: function componentDidMount() {
        directive.getChildComponents(this);

        var parentComponent = this.state.parentComponent;

        parentComponent.state.totalLength = parentComponent.state.length = this.props.children.length;
        //父组件中通过itemsComponent来调用
        parentComponent.state.itemsComponent = this;

        //适应多分辨率时 设置computed=true可以自动为this.item设置尺寸 因为css中无法设置
        var _parentComponent$prop = parentComponent.props,
            direction = _parentComponent$prop.direction,
            computed = _parentComponent$prop.computed,
            _parentComponent$prop2 = _parentComponent$prop.view,
            view = _parentComponent$prop2 === undefined ? 1 : _parentComponent$prop2;

        var horizontal = direction == 'x';
        var itemStyle = { display: horizontal ? 'inline-block' : 'block' };

        if (computed) {
            var value;
            var wrap = (0, _jquery2.default)(this.refs.wrap);
            if (horizontal) {
                value = wrap.width() / view;
                //view为初始设置的可视区域个数 此处计算适用于百分比设置的宽度
                itemStyle.width = value;
                itemStyle.height = value / computed;
            } else {
                value = wrap.height() / view;
                itemStyle.width = value * computed;
                itemStyle.height = value;
            }
        }
        this.setState({ itemStyle: itemStyle });
    },
    render: function render() {
        var _state5 = this.state,
            parentComponent = _state5.parentComponent,
            itemStyle = _state5.itemStyle;
        // if( !parentComponent ){
        //     console.log(1)
        //     return null
        // }

        var direction = parentComponent.props.direction;

        var horizontal = direction == 'x';

        var _props4 = this.props,
            children = _props4.children,
            className = _props4.className;

        className = _nojsReact2.default.utils.joinClass('nj-scroll-item clearfix', className);
        var size = parentComponent.state.size;

        return _nojsReact.React.createElement(
            'div',
            { ref: 'wrap', className: 'nj-scroll-wrap' },
            _nojsReact.React.createElement(
                'div',
                { ref: 'items', className: 'nj-scroll-items clearfix', style: horizontal ? { width: size.total } : {} },
                children.map(function (item, i) {
                    return _nojsReact.React.createElement(
                        'span',
                        { className: className, ref: 'item' + i, key: i, style: itemStyle },
                        item
                    );
                })
            )
        );
    }
});

var ScrollPage = _nojsReact.React.createClass({
    displayName: 'ScrollPage',

    mixins: [_nojsReact.mixins.childComponents.setParents([Scroll])],
    getDefaultProps: function getDefaultProps() {
        return { pages: 0 };
    },
    handleClick: function handleClick(page) {
        var parentComponent = this.state.parentComponent;
        var step = parentComponent.state.step;

        var index = page * step;
        parentComponent.stop();
        parentComponent.scroll(index);
    },
    componentDidMount: function componentDidMount() {
        directive.getChildComponents(this);

        var parentComponent = this.state.parentComponent;

        parentComponent.state.page = this;
    },
    render: function render() {
        var _this4 = this;

        // console.log(this.props)
        var parentComponent = this.state.parentComponent;
        var _parentComponent$stat = parentComponent.state,
            length = _parentComponent$stat.length,
            index = _parentComponent$stat.index,
            step = _parentComponent$stat.step;

        var items = [];
        var pages = Math.ceil(length / step);
        for (var i = 0; i < pages; i++) {
            items.push(i + 1);
        }
        var page = Math.ceil((index + 1) / step) - 1;
        var _props5 = this.props,
            trigger = _props5.trigger,
            className = _props5.className;

        var template = this.props.template || parentComponent.props.pageTemplate;

        return _nojsReact.React.createElement(
            'div',
            { className: 'nj-scroll-page ' + className },
            _nojsReact.React.createElement(
                'div',
                { className: '-page-inner' },
                items.map(function (n, i) {
                    var tmpl = typeof template == 'function' && template.call(_this4, i);
                    var child = tmpl || n;
                    var options = {
                        ref: 'item' + i,
                        className: _nojsReact2.default.utils.joinClass('-page-item', page == i && '-page-active'),
                        key: n
                    };
                    if (typeof tmpl == 'string') {
                        options.dangerouslySetInnerHTML = { __html: tmpl };
                        child = null;
                    }
                    options[trigger == 'hover' ? 'onMouseEnter' : 'onClick'] = _this4.handleClick.bind(_this4, i);
                    return _nojsReact.React.createElement(
                        'span',
                        options,
                        child
                    );
                })
            )
        );
    }
});
ScrollPage.PropTypes = {
    pages: _propTypes2.default.number
};

function getIndex(index, total) {
    index = index < 0 ? 0 : index;
    index = index > total ? index % total : index;
    return index;
}

var directive = new _directiveComponent2.default({
    elementGroups: {
        'scroll': {
            children: ['scroll-items', 'scroll-page'],
            component: Scroll
        },
        'scroll-items': {
            component: ScrollItems,
            wrapItem: function wrapItem(component, element, i) {
                return component.refs['item' + i];
            }
        },
        'scroll-page': {
            component: ScrollPage
        }
    },
    // wrap : component=>ReactDOM.findDOMNode(component),
    exports: exports
});

//当脚本在页面底部运行时 直接运行一次可以后续代码中立即获取实例
// directive.start()