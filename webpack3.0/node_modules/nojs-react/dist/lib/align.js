'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var $ = require('jquery');
var nj = require('./nojs-react');
var dom = nj.utils.dom;
/*
 * 将对象对齐到某个参考元素nearby
 * nearby是window对象,即固定在屏幕上
 * relative为true可设置为类似css的背景图定位方式,只限百分比
 */
var Align = function Align(options) {
    this.options = options = options || {};
    this.element = dom(options.element);
    this.nearby = dom(options.nearby);

    var screen = this.nearby && this.nearby[0] === window;
    //this.position = options.position || (screen ? {top:50, left:50} : {top:100, left:0});
    this.position = $.extend(screen ? { top: 50, left: 50 } : { top: 100, left: 0 }, options.position);
    if (this.position.right !== undefined) {
        delete this.position.left;
    }
    if (this.position.bottom !== undefined) {
        delete this.position.top;
    }

    //relative=true 表示定位方式同css背景定位方式
    this.relative = options.relative != undefined ? options.relative : screen ? true : false;

    this.fixed = options.fixed === undefined && screen ? 'fixed' : options.fixed; //null fixed animate

    this.cssFixed = this.fixed == 'fixed' && screen; //可以直接使用position:fixed来定位

    this.offset = options.offset || [0, 0];
    this.isWrap = this.nearby && (screen || this.nearby.find(this.element).length); //对象是否在参考对象内部
    this.autoAdjust = options.autoAdjust; //超出屏幕后是否自动调整位置

    this.element && this.bind();
};
Align.prototype = {
    bind: function bind() {
        var self = this,
            ns = this.element.data('align'),
            type;

        if (ns) {
            this.nearby.add(window).off(ns);
        } else {
            ns = '.align' + new Date().getTime();
            this.element.data('align', ns);
        }

        var scrollby = this.options.scrollby || !this.cssFixed && this.fixed && this.nearby;

        scrollby && $(scrollby).on('scroll' + ns, function () {
            self.set();
        });
        $(window).on('resize' + ns, function () {
            self.set();
        });

        this.set();
    },
    get: function get(nearby) {
        nearby = nearby || this.nearby;
        var offset = nearby.offset(),
            size = {
            width: nearby.outerWidth(),
            height: nearby.outerHeight(),
            x: offset ? offset.left : 0,
            y: offset ? offset.top : 0,
            scrollLeft: this.cssFixed ? 0 : nearby.scrollLeft(),
            scrollTop: this.cssFixed ? 0 : nearby.scrollTop(),
            WIDTH: this.element.outerWidth(true),
            HEIGHT: this.element.outerHeight(true)
        };
        return size;
    },
    set: function set(options) {
        //可设置nearby position offset relative等参数覆盖初始选项
        if (!this.element) {
            return;
        }

        options = options || {};

        var nearby = dom(options.nearby) || this.nearby;

        if (!nearby || this.element.is(':hidden')) {
            return;
        }
        var position = options.position || this.position;
        this.element.css('position', this.cssFixed ? 'fixed' : 'absolute'); //设置在get方法之前

        var size = this.get(nearby),
            Attr = {
            x: {}, y: {}
        },
            _Attr,
            attr,
            value,
            _value,
            type,
            direction,
            style = {},
            wrapSize;

        if (this.isWrap) {
            size.x = size.y = 0;
        }
        Attr.x.element = 'WIDTH';
        Attr.y.element = 'HEIGHT';
        Attr.x.nearby = 'width';
        Attr.y.nearby = 'height';
        Attr.x.offset = 0;
        Attr.y.offset = 1;
        Attr.x.scroll = 'scrollLeft';
        Attr.y.scroll = 'scrollTop';

        for (attr in position) {
            value = _value = position[attr];
            type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
            if (type == 'function') {
                value = value(size);
                type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
            }
            direction = attr == 'top' || attr == 'bottom' ? 'y' : 'x';
            _Attr = Attr[direction];

            value = type == 'number' ? (size[_Attr.nearby] - (this.relative ? size[_Attr.element] : 0)) * value / 100 : parseInt(value, 10);

            if (attr == 'bottom' || attr == 'right') {
                value *= -1;
                value -= size[_Attr.element] - size[_Attr.nearby];
            }

            value += size[direction] + this.offset[_Attr.offset] + size[_Attr.scroll];

            style[direction == 'x' ? 'left' : 'top'] = value;
        }
        var turnPosition = !this.isWrap && this.checkBorder(size, position, style); //屏幕边界限制
        if (turnPosition) {
            this.options.onTurn && this.options.onTurn.call(this, turnPosition);
            this.set({ position: turnPosition, nearby: nearby });
            return;
        }

        if (this.fixed == 'animate') {
            this.element.stop().animate(style, 200);
            return;
        }
        this.element.css(style);
    },
    checkBorder: function checkBorder(size, position, style) {
        if (this.turnPosition) {
            this.turnPosition = null;
            return;
        }
        var turn;
        var turnPosition = {};
        var win = $(window);
        for (var i in position) {
            turnPosition[i] = position[i];
        }
        if (style.left < 0 || style.left > size.WIDTH && size.WIDTH + style.left - win.scrollLeft() > win.width()) {
            var left = position.left;
            var right = position.right;
            if (left != undefined) {
                delete turnPosition.left;
                turnPosition.right = left;
            } else if (right != undefined) {
                delete turnPosition.right;
                turnPosition.left = right;
            }
            turn = true;
        }
        if (style.top < 0 || style.top > size.HEIGHT && size.HEIGHT + style.top - win.scrollTop() > win.height()) {
            var top = position.top;
            var bottom = position.bottom;
            if (top != undefined) {
                delete turnPosition.top;
                turnPosition.bottom = top;
            } else if (bottom != undefined) {
                delete turnPosition.bottom;
                turnPosition.top = bottom;
            }
            turn = true;
        }
        if (turn) {
            return this.turnPosition = turnPosition;
        }
    }
};

var mixins = nj.mixins;

module.exports = mixins.align = {
    getDefaultProps: function getDefaultProps() {
        return {};
    },
    // componentDidMount : function(){
    //     console.log(1,this.align,this.onShow)
    // },
    setAlign: function setAlign(options) {
        var align = this.isMounted ? this.align : null;
        this.align = align || new Align(options);
        this.align.set(options);
    }
};