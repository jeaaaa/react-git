'use strict';

/**
 * 框架组件
 */
require('../../css/frame.css');

var nj = require('./nojs-react');
var React = nj.React;
var ReactDOM = nj.ReactDOM;
var Component = React.Component;

var $ = require('jquery');
var Tree = require('./tree');

exports.Frame = React.createClass({
    displayName: 'Frame',
    getInitialState: function getInitialState() {
        return {};
    },
    componentDidMount: function componentDidMount() {
        var self = this;
        var menu = this.props.menu;

        var menuTree = this.state.menu = Tree.init({
            data: menu,
            element: document.getElementById('frameMenu')
        }).onChange(function (node, e) {
            var link = node.link;
            // console.log(0,link,node.select,node)
            if (!link) {
                e && e.preventDefault();
                return;
            }
            self.jump(link, node);
        });

        this.state.menuFormatData = menuTree.state.dataFormat.databyid;

        var _nj$utils$parseHash = nj.utils.parseHash();

        var url = _nj$utils$parseHash.url;
        var id = _nj$utils$parseHash.id;

        if (!id) {
            menuTree.select(menu[1]);
        }

        function watchHash(e) {
            var _nj$utils$parseHash2 = nj.utils.parseHash();

            var url = _nj$utils$parseHash2.url;
            var id = _nj$utils$parseHash2.id;

            if (!url && !id) {
                return;
            }
            if (url) {
                self.jump(url);
            }
            if (id) {
                self.state.menu.select(self.state.menuFormatData[id]);
            }
        }
        window.onhashchange = watchHash;

        watchHash();

        $(this.refs.frameContent).delegate('a', 'click', function () {
            var url = this.getAttribute('href', 4);
            if (url.indexOf('javascript:') < 0) {
                self.jump(url);
                return false;
            }
        });
    },
    jump: function jump(url, node, e) {
        var _this = this;

        if (this.jump.start || !url) {
            return;
        }

        var hashData = nj.utils.parseHash();

        var nodeId = node ? node.id : hashData.id;
        this.jump.start = 1;
        setTimeout(function () {
            _this.jump.start = null;
        }, 10);

        var wrap = $(this.refs.frameContent);
        wrap.css({ 'visibility': 'hidden' }).fadeOut(100);

        var _props = this.props;
        var onChange = _props.onChange;
        var parseUrl = _props.parseUrl;
        var parseContent = _props.parseContent;


        url = typeof parseUrl == 'function' ? parseUrl(url, node) : url;

        //nj.pageframe.destoryEvent.complete()//.end()
        // iframeContainer.load(url, contentInit)
        $.get(url, function (json) {
            json = typeof parseContent == 'function' ? parseContent(json, url) : json;
            wrap.html(json).css('visibility', 'visible').fadeIn(100);
            onChange && onChange.call(_this, node, nj.utils.parseHash(), _this.refs.frameContent);
        }).error(function () {
            wrap.html('');
        });
        this.jump.url = url;

        var hash = [];
        if (nodeId) {
            hash.push('id=' + nodeId);
        }
        if (!node && url) {
            hash.push('url=' + encodeURIComponent(url));
        }
        location.hash = hash.join('&');
    },
    render: function render() {
        var logo = this.props.logo;

        logo = logo && React.createElement(
            'div',
            { className: 'nj-frame-logo' },
            logo
        );
        return React.createElement(
            'div',
            { className: 'nj-frame' },
            React.createElement(
                'div',
                { className: 'nj-frame-side' },
                logo,
                React.createElement('div', { id: 'frameMenu', className: 'nj-tree' })
            ),
            React.createElement(
                'div',
                { className: 'nj-frame-content' },
                React.createElement('div', { className: 'nj-frame-inner', ref: 'frameContent' })
            )
        );
    }
});