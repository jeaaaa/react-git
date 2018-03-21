'use strict';

/**
 * 弹出层
 */
var nj = require('./nojs-react');
var React = nj.React,
    ReactDOM = nj.ReactDOM,
    mixins = nj.mixins,
    clickEvent = nj.clickEvent;

var align = require('./align');
var $ = require('jquery');

var Popover = React.createClass({
    displayName: 'Popover',

    statics: {
        create: function create(options) {
            var _container = nj.utils.createContainer();
            options = options || {};
            var pop = ReactDOM.render(React.createElement(Popover, options), _container);
            document.body.removeChild(_container);
            return pop;
        }
        // destory (component) {
        //     if( !component || !component.isMounted() ){
        //         return
        //     }
        //     var {nearby} = component.state

        //     document.body.removeChild(component.element)
        // }

    },
    mixins: [align, mixins.setDisplay],
    getDefaultProps: function getDefaultProps() {
        return { trigger: 'hover', effect: 'scale' };
    },
    getInitialState: function getInitialState() {
        var nearby = nj.utils.dom(this.props.nearby);
        return {
            origin: '0 0',
            nearby: nearby,
            target: nj.utils.dom(this.props.target),
            template: this.props.template
        };
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        this.setState({
            template: nextProps.template
        });
    },
    getOrigin: function getOrigin(position) {
        var pos = position || this.props.position || {};
        var origin = [0, 0];
        var direction = 'top'; //尖角图标指向的方向
        var _pos = 0;
        for (var i in pos) {
            if (typeof pos[i] == 'string') {
                _pos = 100;
                direction = i;
            }
            if (parseInt(pos[i]) > _pos) {
                _pos = parseInt(pos[i]);
                direction = i;
            }
        }
        if (pos.left != undefined) {
            origin[0] = 0;
        } else if (pos.right != undefined) {
            origin[0] = '100%';
        }
        if (pos.top != undefined) {
            origin[1] = 0;
        } else if (pos.bottom != undefined) {
            origin[1] = '100%';
        }

        this.state.direction = direction;
        this.state.origin = origin.join(' ');
        this.setState({ origin: this.state.origin });
        return this.state.origin;
    },
    componentDidMount: function componentDidMount() {
        var _this3 = this;

        // var el = $(ReactDOM.findDOMNode(this))
        var self = this;
        var _state = this.state,
            nearby = _state.nearby,
            target = _state.target;
        var _props = this.props,
            delegate = _props.delegate,
            trigger = _props.trigger;

        var bindTarget = target || nearby;

        // if( !nearby ){
        //     return
        // }

        // var layerEl = $(this.wrap)

        function show(element) {
            if (!target) {
                self.state.nearby = element;
            }
            self.setDisplay(true);
        }
        var delay;
        var events = '';
        var eventSP = '.popover';
        var _event = '';
        var layerBind;

        function hide() {
            window.clearTimeout(delay);
            if (self.keepVisible || !self.state.visible) {
                self.keepVisible = null;
                return;
            }
            delay = window.setTimeout(function () {
                !self.keepVisible && self.setDisplay(false);
            }, 10);
        }
        if (trigger == 'hover') {
            var _show = function _show(e) {
                var _this2 = this;

                var _this = this;
                self.setDisplay(false);
                window.clearTimeout(delay);
                delay = setTimeout(function () {
                    return show(_this2);
                }, 40);
            };

            if (bindTarget) {
                _event = 'mouseenter' + eventSP;
                events += _event;
                bindTarget.on(_event, _show);

                _event = 'mouseleave' + eventSP;
                events += ' ' + _event;
                bindTarget.on(_event, hide);

                // console.log(_event, events)
            } else if (delegate) {
                $(delegate[1] || document.body).delegate(delegate[0], 'mouseenter', _show).delegate(delegate[0], 'mouseleave', hide);
            }

            layerBind = function layerBind() {
                $(_this3.wrap).hover(function (e) {
                    window.clearTimeout(delay);
                }, hide);
            };
        } else if (trigger == 'click') {
            var _show2 = function _show2(e) {
                var _this4 = this;

                self.keepVisible = true;
                setTimeout(function () {
                    self.keepVisible = null;
                }, 100);
                self.state.visible && trigger == 'click' ? self.setDisplay(false) : setTimeout(function () {
                    return show(_this4);
                }, 5);
                e.preventDefault();
            };

            if (bindTarget) {
                if (/text|textarea/.test(bindTarget[0].type)) {
                    trigger = 'focus';
                }
                bindTarget.on(clickEvent, _show2);
            } else if (delegate) {
                $(delegate[1] || document.body).delegate(delegate[0], trigger, _show2);
            }

            this.onDisplayChange(function (visible) {
                if (!visible && _this3.keepVisible) {
                    _this3.keepVisible = null;
                    return false;
                }
            });

            if (trigger == 'focus') {
                bindTarget && bindTarget.on('blur', function () {
                    //当浮层上有单击事件发生时 blur会先触发 导致layerEl上的click事件没有执行 所以这里延迟
                    delay = setTimeout(hide, 150);
                });
            }
            docWatch.push(this);

            layerBind = function layerBind() {
                $(_this3.wrap)[clickEvent](function (e) {
                    clearTimeout(delay);
                    _this3.keepVisible = true;
                });
            };
        }

        this.state.trigger = trigger;

        var showClassName = this.props.showClassName || 'nj-popover-nearby';
        var delayHideClass;
        this.onShow(function () {
            self.getOrigin();
            window.clearTimeout(_this3.hidedelay); //nearby有多个元素集合时 鼠标快速滑过 pop显示在下一目标上 上次的element还未移除

            layerBind();

            if (_this3.align) {
                //当鼠标在多个相近得nearby间快速扫动时，align定位不会及时更新 所以加延时处理
                setTimeout(function (e) {
                    _this3.align.set({
                        nearby: _this3.state.nearby
                    });
                }, 0);
            } else {
                setTimeout(function () {
                    _this3.setAlign(Object.assign({}, _this3.props, {
                        nearby: _this3.state.nearby,
                        element: $(_this3.wrap),
                        onTurn: function onTurn(turnPosition) {
                            self.getOrigin(turnPosition);
                        }
                    }));
                });
            }

            clearTimeout(delayHideClass);
            $(_this3.state.nearby).addClass(showClassName);
        }).onHide(function () {

            delayHideClass = setTimeout(function () {
                $(_this3.state.nearby).removeClass(showClassName);
            }, 200);
            // Popover.destory(this)

            _this3.hidedelay = window.setTimeout(function (e) {
                var layer = _this3.refs.layer;

                if (!layer) {
                    //layer已被移除
                    return;
                }
                document.body.removeChild(_this3.element);
                layer.layer = null;
                _this3.align = null;
            }, 200);
        });
    },
    renderLayer: function renderLayer() {
        var _props2 = this.props,
            sharp = _props2.sharp,
            name = _props2.name;
        var _state2 = this.state,
            className = _state2.className,
            template = _state2.template,
            origin = _state2.origin,
            direction = _state2.direction;

        className = nj.utils.joinClass('nj-popover', sharp && 'nj-popover-sharp-' + direction, //窗体是否带尖角图标
        className, name);
        var style = { transformOrigin: origin };
        template = typeof template == 'function' ? template.call(this) : template;
        var body = template;
        if (typeof template == 'string') {
            body = React.createElement('span', { dangerouslySetInnerHTML: { __html: template } });
        }
        var sharpClass = nj.utils.joinClass('nj-icon nj-icon-sharp', direction && 'nj-icon-sharp-' + direction);

        return React.createElement(
            'div',
            { className: className, style: style },
            React.createElement(
                'div',
                { className: 'nj-popover-inner', style: style },
                body
            ),
            sharp ? React.createElement('i', { className: sharpClass }) : null
        );
    },
    render: function render() {
        return React.createElement(Layer, { ref: 'layer', from: this });
    }
});

//点击document隐藏所有pop
var docWatch = function () {
    var initial;
    var pops = [];
    var delay;
    var hide = function hide(e) {
        // console.log(e.isDefaultPrevented())
        // window.clearTimeout(delay)
        // delay = window.setTimeout(i=>{
        pops.forEach(function (pop) {
            if (e.target === pop.state.nearby) {
                return;
            }
            pop.setDisplay(false);
        });
        // }, 0)
    };
    return {
        push: function push(pop) {
            if (!initial) {
                initial = true;
                $(document).on(clickEvent, hide);
            }
            pops.push(pop);
        }
    };
}();

var Layer = React.createClass({
    displayName: 'Layer',
    renderLayer: function renderLayer() {
        if (!this.layer) {
            this.layer = nj.utils.createContainer('nj-popover-container nj-layer-wrap');
        }
        var from = this.props.from;

        var layerElement = from.renderLayer();
        ReactDOM.unstable_renderSubtreeIntoContainer(this, layerElement, this.layer);
        from.element = this.layer;
        from.wrap = $(this.layer).children()[0];
    },
    componentDidMount: function componentDidMount() {
        // this.renderLayer()
    },
    componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
        var from = this.props.from;

        from.state.visible && this.renderLayer();
    },

    render: function render() {
        return null;
    }
});

module.exports = Popover;