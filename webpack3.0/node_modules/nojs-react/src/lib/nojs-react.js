require('../../css/react.css');

//引入React和ReactDOM
var React = exports.React = require('react');
var ReactDOM = exports.ReactDOM = require('react-dom');
var $ = require('jquery')
exports.render = ReactDOM.render

//工具集
exports.utils = require('../utils/utils');

exports.mixins = {
    setDisplay : require('../mixins/effect'),
    childComponents : require('../mixins/childComponents')
};

/**
 * fetch: 针对IE低版本处理
 * https://github.com/camsong/blog/issues/2
 * 
 * 由于 IE8 是 ES3，需要引入 ES5 的 polyfill: es5-shim, es5-sham
 * 引入 Promise 的 polyfill: es6-promise
 * 引入 fetch 探测库：fetch-detector
 * 引入 fetch 的 polyfill: fetch-ie8
 * 可选：如果你还使用了 jsonp，引入 fetch-jsonp
 * 可选：开启 Babel 的 runtime 模式，现在就使用 async/await
 */
require('fetch-detector')
require('fetch-ie8')
require('es6-promise').polyfill()


/**
 * html标签指令组件 兼容ie处理
 * 保证nojs-react在head处引入并执行
 */
'form|input|input-group|select|scroll|scroll-items|scroll-page|switch|switch-menu|switch-item'
.split('|').forEach(dir=>document.createElement('nj-'+dir))

const isMobile = exports.isMobile = screen.width<=640
exports.clickEvent = isMobile ? 'tap' : 'click'

window.noJS = window.noJS || {}
window.noJS.ready = function(fn){
    fn(exports)
}

var muiTimer
function addMui(e){
    var mui = $('<div class="nj-mui"><span></span></div>')
    var self = $(this) 
    var mode = self.attr('data-mode')
    var className ='nj-mui-active nj-mui-item nj-mui-'+mode
               
    self.addClass(className).append(mui)
    mui.children().css(exports.Mui.style(e, this, mode))

    muiTimer && window.clearTimeout(muiTimer)
    muiTimer = window.setTimeout(e=>{
        self.removeClass(className).find('.nj-mui').remove()
    }, 2500)    
}

var nj_selector = 'button'

exports.mui = function(selector){
    nj_selector += ','+selector
}

$(function(){
    $(document).delegate(nj_selector, 'click', addMui)
})


class Mui extends React.Component{
    static style (e, node, mode) {
        if( mode=='circle' ){
            return {width:'100%', height:'100%', left:'0', top:'0'}
        }
        var self = $(node)
        var offset = self.offset()
        var size = self.outerWidth()
        
        var top = e.clientY - offset.top + $(window).scrollTop()
        var left = e.clientX - offset.left + $(window).scrollLeft()
        var radius = (left>size/2 ? left : size-left)+5

        return {
            'width' : radius*2,
            'height' : radius*2,
            'top' : top-radius,
            'left' : left-radius
        }
    }
    constructor(props) {
        super(props)
        this.state = {animate:[]}
    }    
    handleClick (e) {
        var {animate} = this.state
        var style = exports.Mui.style(e, ReactDOM.findDOMNode(this), this.props.mode)
        
        var timer = this.state.timer = window.setTimeout(e=>{
            animate.shift()
            this.setState({animate})
        }, 3000)
        animate.push(timer)
        
        this.setState({animate, style})
        var {onClick} = this.props
        onClick && onClick(e)
    }
    componentWillUnmount () {
        window.clearTimeout(this.state.timer)
    }
    render () {
        var {tag, mode} = this.props
        var {animate, style} = this.state
        var className = exports.utils.joinClass(
            this.props.className, 
            animate && 'nj-mui-active', 
            'nj-mui-item',
            'nj-mui-'+mode
        )
        return React.createElement(
            tag,
            Object.assign({}, this.props, { 
                onClick: this.handleClick.bind(this), 
                className: className 
            }),
            this.props.children,
            animate.map((item, i)=>
                <div className="nj-mui" key={item}><span style={style}></span></div>
            )
        )
    }
}

Mui.defaultProps = {tag:'div', mode:'rect'}

exports.Mui = Mui