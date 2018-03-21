'use strict';

/**
 * 控制组件显示方式及事件
 */
var nj = require('../lib/nojs-react');

module.exports = {
    getInitialState: function getInitialState() {
        this._showEvents = nj.utils.addEventQueue.call(this, 'onShow');
        this._hideEvents = nj.utils.addEventQueue.call(this, 'onHide');
        this._changeDisplay = nj.utils.addEventQueue.call(this, 'onDisplayChange');

        return {
            visible: false,
            className: this.effects()[2] || this.effects()[0]
        };
    },
    setDisplay: function setDisplay(visible, data) {
        if (this.state.visible == visible) {
            return;
        }
        if (this._changeDisplay.complete(visible, data) === false) {
            return;
        }
        this.state.visible = visible;
        var effect = this.effects();
        var className = nj.utils.joinClass(effect[visible ? 1 : 0], visible ? 'nj-show' : 'nj-hide', effect[2]);
        //effect[2]始终存在的样式
        this.setState({ visible: visible, className: className });

        this[visible ? '_showEvents' : '_hideEvents'].complete(data);
    },
    effects: function effects() {
        var effects = {
            'normal': ['d_hide', 'd_show'],
            'fade': ['fade-out', 'fade-in'],
            'drop': ['nj_hide', 'drop_pop_show', 'drop_pop'],
            'scale': ['scale-out', 'scale-in', 'scale-pop']
        };
        return effects[this.props.effect] || effects.normal;
    }
};