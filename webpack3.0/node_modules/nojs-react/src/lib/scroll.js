/*
 * 无间断滚动
 */
import $ from 'jquery'
import nj, {React, ReactDOM, mixins} from './nojs-react'
import Directive from '../mixins/directiveComponent'
import PropTypes from 'prop-types'
import './touch'


/* 
 * [jQuery animate动画扩展]
 * http://gsgd.co.uk/sandbox/jquery/easing/jquery.easing.1.3.js
 * easeIn：加速度缓动；
 * easeOut：减速度缓动；
 * easeInOut：先加速度至50%，再减速度完成动画
 */    
$.extend($.easing, {
    //指数曲线缓动
    easeOutExpo: function (x, t, b, c, d) {
        return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    }
});


var Scroll = React.createClass({
    mixins : [mixins.childComponents.config],
    getDefaultProps () {
        return {
            //滚动方向，默认纵向
            direction : 'y',
            children : []
        }
    },
    getInitialState () {
        var {step=1, time, repeat=true, auto=true} = this.props
        step = parseInt(step)
        return {            
            step,//滚动步长，0为连续滚动
            time : time || (step?6000:30),//滚动速度，连续推荐设置40ms ;间断滚动时，该值为滚动的间隔时间
            repeat,//是否重复循环无间断
            auto,

            index : 0,
            size : {},
            // totalLength : length,//总个数 包含追加
            scrollLength : 0//已滚动个数
        }
    },    
    componentDidMount () {
        this.scrollEvent = nj.utils.addEventQueue.call(this, 'onScroll')
        this.scrollEndEvent = nj.utils.addEventQueue.call(this, 'onScrollEnd')

        //React创建的组件 父组件完成后 首次要更新下page
        var {page} = this.state
        if( page ){
            this.onScrollEnd(e=>this.start())
            page.forceUpdate()
        }

        directive.getChildComponents(this)

        this.props.computed && $(window).on('resize', ()=>{
            this.reset();
        })
        setTimeout(()=>{//computed情况下 scroll-items组件必须先计算完成后 这里才reset
            this.reset()

            var {length, view, step, size, itemsComponent} = this.state
            // console.log(length,view)
            if( length <= view ) {
                return
            }
            var nextLast = length%view;
                
            //初始化的追加个数 保证next即可 
            //next所需:view-nextLast
            //step==0连续滚动时 拷贝view个即可
            nextLast && this.append(0, step ? view-nextLast : view);                
            
            var direction = this.props.direction
            if( direction == 'y' ) {
                size.total = $(itemsComponent.refs.items).height();
            }
            this.start();

            var wrap = $(itemsComponent.refs.wrap)
            wrap.hover(()=>{
                this.stop();
            }, ()=>{
                this.start();
            });   

            //mobile touch
            if( screen.width<=640 ){
                var prevAction = direction=='y' ? 'swipeDown' : 'swipeRight',
                    nextAction = direction=='y' ? 'swipeUp' : 'swipeLeft';
                
                wrap[prevAction](()=>{
                    this.scroll(false);
                    return false;
                })
                wrap[nextAction](()=>{
                    this.scroll();
                    return false;
                })
            }
        }, 1)

        createdEvents.complete(this)
    },
    append (start, appendLength) {
        /*
         * 使用向后追加元素的方式来实现不间断滚动
         * 初始化追加一次 ；每次滚动完毕后检测是否追加
         */
        var {repeat, length, size, itemsComponent} = this.state
        if( !repeat ){
            return;
        }
        var {children, _children} = itemsComponent.props
        var copy,
            //剩余一次可截取个数
            last = length - start,
            c;
      
        //以html指令方式创建的组件 这里要手动append dom
        var doms = _children, domSlice = []

        if( appendLength > last ){
            copy = children.slice(start);//从当前copy到结尾
            if( doms ){
                children.forEach((n,i)=>{
                    i>=start && domSlice.push(i)
                })
            }
            start = 0;
            appendLength = appendLength - copy.length;
            
        }
        c = children.slice(start, start+appendLength);
        if( doms ){
            children.forEach((n,i)=>{
                i>=start && i<start+appendLength && domSlice.push(i)
            })
        }
        if( copy ){
            Array.prototype.push.apply(copy,c)
        }else{
            copy = c
        }

        var _totalLength = this.state.totalLength //添加之前的个数

        Array.prototype.push.apply(children, copy)
        
        this.state.totalLength = children.length;//追加后的总个数
        
        if( this.props.direction == 'x' ) {
            size.total = this.state.totalLength * size.item;
        }
        this.setState({size})
        itemsComponent.setState({children}, (a)=>{
            if( doms ){
                domSlice.forEach(n=>{
                    itemsComponent.refs['item'+_totalLength].appendChild(doms[n].cloneNode(true))
                    _totalLength++                    
                })
            }
        })
    },
    start () {
        var {auto, length, view, time} = this.state
        // console.log(length,auto,view)
        if (auto && length>view ) {
            clearInterval(this.delay);
            this.delay = setInterval(()=>{
                this.scroll();
            }, time);
        }
    },
    stop () {
        this.delay = clearInterval(this.delay);
    },
    reset () {
        // var {childComponents} = this.state
        var {computed, direction, step} = this.props
        var itemsComponent = this.state.itemsComponent
        var horizontal = direction == 'x'
        var wrap = $(itemsComponent.refs.wrap)
        var content = $(itemsComponent.refs.items)
        var item = $(itemsComponent.refs.item0)
        
        var size = this.state.size = {
            box : horizontal ? wrap.width() : wrap.height(),//容器尺寸
            total : horizontal ? null : content.height(),//内容总尺寸
            item : horizontal ? item.outerWidth(true) : item.outerHeight(true)//单项尺寸
        }
        if( horizontal ) {
            size.total = this.state.totalLength * size.item;
        }
        this.state.view = Math.ceil(size.box/size.item);

        if( step=='view' ){
            this.state.step = this.state.view;
        }
        this.setState({size})
        itemsComponent.forceUpdate()
    },
    scroll (next) {
        if( $(ReactDOM.findDOMNode(this)).is(':hidden') ){
            return
        }
        /*
         * next 
         * boolean: 向前/后滚动 控制方向
         * number: 索引值 直接滚动到某一张 （若repeat=true 该索引是相对追加之前的）
         */
        var {size, step, scrollLength, totalLength, length, view, itemsComponent} = this.state
        var index;
        if( typeof next=='number' ){
            index = getIndex(next, length);
        }else{
            next = next===false ? false : true;
        }
        if( next!==undefined ){
            this.start()//外部控制滚动后 重新开始计时
        }
        var wrap = $(itemsComponent.refs.wrap)
        
        var {direction} = this.props
        
        //if( this.wrap.is(":animated") ) { return;}
        wrap.stop();

        var isExist = nj.utils.elementInDOM(ReactDOM.findDOMNode(this)) //组件是否被移除
        if( !isExist ){
            this.stop()
            wrap.stop();
            return
        }
        
        var T = this,
            m, speed = 0,
            //每次滚动距离，连续-每次增加1px，间隔-每次增加n个元素的宽高
            //计算最大滚动差
            max = size.total - size.box,
            scrollAttr = direction == 'x' ? 'scrollLeft' : 'scrollTop',
            attr = {},
            now = wrap[scrollAttr](),
            nowScroll,
            ratio = next ? 1 : -1;
        
        if ( step == 0 ) {
            m = 1;
        } else {
            m = step * size.item;
            speed = 800;
        }
        
        if( step ){
            m = ratio * m;
            
            //不足prev时 向后跳转this.len的个数
            if( !next && scrollLength<step && typeof index=='undefined' ){
                var prevLast = totalLength - (scrollLength+length);
                
                if( prevLast < view ){
                    this.append(totalLength%length, view-prevLast);
                    totalLength = this.state.totalLength
                    // scrollLength = this.state.scrollLength
                }
                wrap[scrollAttr](wrap[scrollAttr]()+size.item*length);
                scrollLength += length;
            }
            
            scrollLength += ratio * step;
            
        }else{
            //连续滚动
            scrollLength = Math.floor(now/size.item);
        }
        this.state.index = scrollLength % length;//当前开始index

        if( typeof index=='undefined' ){
            attr[scrollAttr] = '+='+m;
            this.state[scrollAttr] = nowScroll = now + ratio * m;
        }else{
            scrollLength = index;
            this.state.index = index;
            attr[scrollAttr] = this.state[scrollAttr] = nowScroll = now = size.item * index;
        }
        this.state.scrollLength = scrollLength
        this.state.endIndex = getIndex(this.state.index+view-1, length);//当前结束index
        
        wrap.animate(attr, speed, 'easeOutExpo', ()=>{
            if( nowScroll >= length * size.item ){
                //滚动过得距离超过总长度  则向前跳转一次
                var newPos = step ? size.item*this.state.index : 0;
                wrap[scrollAttr](newPos);
                scrollLength = this.state.scrollLength = this.state.index = step ? this.state.index : newPos;
                //T.step==0 && T.scroll();
            }
            var last = totalLength - scrollLength - view;
            if( last < view ){//需再次追加 此处step=0不会存在
                this.append(getIndex(this.state.endIndex+last+1, length), view-last);
            }
            this.scrollEndEvent.complete()
        });
        // this.setState({index:this.state.index})
        this.state.childComponents.forEach((c)=>{
            c.forceUpdate()
        })
        this.scrollEvent.complete(this.state.index)
    },   
    render () {
        var {className, children} = this.props        
        className = nj.utils.joinClass('nj-scroll', className)
        return (
        <div className={className}>
            {children}
        </div>
        )
    }
})
Scroll.PropTypes = {
    step : PropTypes.number,
    time : PropTypes.number,
    pageTemplate : PropTypes.func
}

let createdEvents = nj.utils.addEventQueue.call(Scroll, 'onCreated')

var ScrollItems = React.createClass({
    mixins : [mixins.childComponents.setParents([Scroll])],
    getInitialState () {
        return {}
    },
    componentDidMount () {
        directive.getChildComponents(this)

        var {parentComponent} = this.state
        parentComponent.state.totalLength = parentComponent.state.length = this.props.children.length
        //父组件中通过itemsComponent来调用
        parentComponent.state.itemsComponent = this

        //适应多分辨率时 设置computed=true可以自动为this.item设置尺寸 因为css中无法设置
        var {direction, computed, view=1} = parentComponent.props
        var horizontal = direction == 'x'
        var itemStyle = {display:horizontal?'inline-block':'block'}

        if( computed ){
            var value;
            var wrap = $(this.refs.wrap)
            if( horizontal ){
                value = wrap.width() / view;
                //view为初始设置的可视区域个数 此处计算适用于百分比设置的宽度
                itemStyle.width = value
                itemStyle.height = value / computed
            }else{
                value = wrap.height() / view;
                itemStyle.width = value * computed
                itemStyle.height = value
            }
        }
        this.setState({itemStyle})
    },    
    render () {
        var {parentComponent, itemStyle} = this.state
        // if( !parentComponent ){
        //     console.log(1)
        //     return null
        // }
        var {direction} = parentComponent.props
        var horizontal = direction == 'x'
        
        
        var {children, className} = this.props
        className = nj.utils.joinClass('nj-scroll-item clearfix', className)
        var {size} = parentComponent.state
        return (
        <div ref="wrap" className="nj-scroll-wrap">
            <div ref="items" className="nj-scroll-items clearfix" style={horizontal?{width:size.total}:{}}>
                {children.map((item,i)=>
                    <span className={className} ref={'item'+i} key={i} style={itemStyle}>{item}</span>
                )}
            </div>
        </div>
        )
    }
})

var ScrollPage = React.createClass({
    mixins : [mixins.childComponents.setParents([Scroll])],
    getDefaultProps () {
        return {pages:0}
    },
    handleClick (page) {
        var {parentComponent} = this.state
        var {step} = parentComponent.state
        var index = page*step
        parentComponent.stop()
        parentComponent.scroll(index)
    },
    componentDidMount () {
        directive.getChildComponents(this)

        var {parentComponent} = this.state
        parentComponent.state.page = this
    },    
    render () {
        // console.log(this.props)
        var {parentComponent} = this.state
        var {length, index, step} = parentComponent.state
        var items = []
        var pages = Math.ceil(length/step)
        for( var i=0; i<pages; i++ ){
            items.push(i+1)
        }
        var page = Math.ceil((index+1)/step)-1
        var {trigger, className} = this.props
        var template = this.props.template || parentComponent.props.pageTemplate
        
        return (
        <div className={'nj-scroll-page '+className}>
            <div className="-page-inner">
            {items.map((n,i)=>{
                var tmpl = typeof template=='function' && template.call(this,i)
                var child = tmpl || n
                var options = {
                    ref : 'item'+i,
                    className : nj.utils.joinClass('-page-item', page == i&&'-page-active'),
                    key : n
                }
                if( typeof tmpl=='string' ){
                    options.dangerouslySetInnerHTML = {__html:tmpl}
                    child = null
                }
                options[trigger=='hover'?'onMouseEnter':'onClick'] = this.handleClick.bind(this,i)
                return <span {...options}>{child}</span>
            })}
            </div>
        </div>
        )
    }
})
ScrollPage.PropTypes = {
    pages : PropTypes.number
}

function getIndex(index, total){
    index = index<0 ? 0 : index;
    index  = index>total ? index % total : index;
    return index;
}

var directive = new Directive({
    elementGroups : {
        'scroll' : {
            children : ['scroll-items', 'scroll-page'], 
            component : Scroll
        },
        'scroll-items' : {
            component:ScrollItems, 
            wrapItem : (component,element,i)=>component.refs['item'+i]
        },
        'scroll-page' : {
            component:ScrollPage
         }
    },   
    // wrap : component=>ReactDOM.findDOMNode(component),
    exports : exports
})

//当脚本在页面底部运行时 直接运行一次可以后续代码中立即获取实例
// directive.start()
