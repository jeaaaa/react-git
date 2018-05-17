'use strict';

var nj = require('./nojs-react');
var React = nj.React,
    ReactDOM = nj.ReactDOM,
    utils = nj.utils;
/**
 * 遮罩层组件
 * 提供show/hide 2个事件 
 */

var Mask = React.createClass({
  displayName: 'Mask',

  mixins: [nj.mixins.setDisplay],
  getDefaultProps: function getDefaultProps() {
    return { effect: 'fade' };
  },

  statics: function () {
    var mask,
        wrap,
        first = true;
    return {
      show: function show(name) {
        wrap = wrap || nj.utils.createContainer('nj-mask ng-layer-wrap');
        this.mask = mask = ReactDOM.render(React.createElement(Mask, null), wrap);
        mask.setState({ name: name });
        mask.setDisplay(true);

        if (first) {
          initEvents.complete(mask);
        }
        first = null;
      },
      hide: function hide() {
        if (mask) {
          mask.setDisplay(false);
          mask.setState({ 'name': '' });
        }
      }
    };
  }(),
  componentDidMount: function componentDidMount() {
    utils.stopScroll(ReactDOM.findDOMNode(this), function (e) {
      e.preventDefault();
    });
  },
  render: function render() {
    var _state = this.state,
        name = _state.name,
        className = _state.className;

    return React.createElement('div', { ref: 'layer', className: utils.joinClass(name, className) });
  }
});

module.exports = Mask;

var initEvents = utils.addEventQueue.call(Mask, 'onInit');