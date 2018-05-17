/**
 * 弹出层
 */
var nj = require('./nojs-react')
var {React, ReactDOM, mixins, clickEvent} = nj
var align = require('./align')
var $ = require('jquery');

var Popover = React.createClass({
    statics : {
        create (options) {
            var _container = nj.utils.createContainer()
            options = options || {};
            var pop = ReactDOM.render(
              <Popover {...options} />,
              _container
            )
            document.body.removeChild(_container)
            return pop
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
    getDefaultProps () {
        return {trigger:'hover', effect:'scale'}
    },
    getInitialState () {
        var nearby = nj.utils.dom(this.props.nearby)
        return {
            origin : '0 0', 
            nearby,
            target : nj.utils.dom(this.props.target),
            template : this.props.template
        }
    },
    componentWillReceiveProps (nextProps) {
        this.setState({
            template : nextProps.template
        })
    },
    getOrigin (position) {
        var pos = position || this.props.position || {}
        var origin = [0,0]
        var direction='top'//尖角图标指向的方向
        var _pos = 0
        for( var i in pos ){
            if( typeof pos[i]=='string' ){
                _pos = 100
                direction = i
            }
            if( parseInt(pos[i]) > _pos ){
                _pos = parseInt(pos[i])
                direction = i
            }
        }
        if( pos.left!=undefined ){
            origin[0] = 0            
        }else if( pos.right!=undefined ){
            origin[0] = '100%'
        }
        if( pos.top!=undefined ){
            origin[1] = 0
        }else if( pos.bottom!=undefined ){
            origin[1] = '100%'
        }
        
        this.state.direction = direction
        this.state.origin = origin.join(' ')
        this.setState({origin:this.state.origin})
        return this.state.origin
    },
    componentDidMount () {
        // var el = $(ReactDOM.findDOMNode(this))
        var self = this
        var {nearby, target}  = this.state
        var {delegate, trigger} = this.props
        var bindTarget = target || nearby

        // if( !nearby ){
        //     return
        // }
        
        // var layerEl = $(this.wrap)
        
        function show(element){
            if( !target ){
                self.state.nearby = element  
            }                
            self.setDisplay(true)
        }
        var delay
        var events = ''
        var eventSP = '.popover'
        var _event = ''
        var layerBind


        function hide(){     
            window.clearTimeout(delay)  
            if( self.keepVisible || !self.state.visible ){
                self.keepVisible = null
                return
            }
            delay = window.setTimeout(()=>{
                !self.keepVisible && self.setDisplay(false)
            }, 10)
        }
        if( trigger=='hover' ){
            function _show(e){
                let _this = this
                self.setDisplay(false)
                window.clearTimeout(delay)
                delay = setTimeout(()=>show(this), 40)
            }
            if( bindTarget ){
                _event = 'mouseenter'+eventSP
                events += _event
                bindTarget.on(_event, _show)

                _event = 'mouseleave'+eventSP
                events += ' '+_event
                bindTarget.on(_event, hide)

                // console.log(_event, events)

            }else if( delegate ){
                $(delegate[1]||document.body).delegate(delegate[0], 'mouseenter', _show)
                .delegate(delegate[0], 'mouseleave', hide)
            }

            layerBind = ()=>{
                $(this.wrap).hover(e=>{
                    window.clearTimeout(delay)
                }, hide)
            }       

        }else if( trigger=='click' ){
            function _show(e){
                self.keepVisible = true
                setTimeout(function(){
                    self.keepVisible = null;
                }, 100)
                if( self.state.visible && trigger=='click' ){
                    self.setDisplay(false)
                    delegate && setTimeout(()=>show(this), 5)
                }else{
                    setTimeout(()=>show(this), 5)
                }
                e.preventDefault()
            }
            if( bindTarget ){
                if( /text|textarea/.test(bindTarget[0].type) ){
                    trigger = 'focus'
                }
                bindTarget.on(clickEvent, _show)

            }else if( delegate ){
                $(delegate[1]||document.body).delegate(delegate[0], trigger, _show)
            }
            
            this.onDisplayChange(visible=>{
                if( !visible && this.keepVisible ){
                    this.keepVisible = null
                    return false
                }
            })

            if( trigger=='focus' ){
                bindTarget && bindTarget.on('blur', ()=>{
                    //当浮层上有单击事件发生时 blur会先触发 导致layerEl上的click事件没有执行 所以这里延迟
                    delay = setTimeout(hide, 150)
                })
            }
            docWatch.push(this)
            
            layerBind = ()=>{
                $(this.wrap)[clickEvent](e=>{
                    clearTimeout(delay)
                    this.keepVisible = true
                })
            }
        }

        this.state.trigger = trigger

        var showClassName = this.props.showClassName || 'nj-popover-nearby'
        var delayHideClass
        this.onShow(()=>{
            self.getOrigin()   
            window.clearTimeout(this.hidedelay)//nearby有多个元素集合时 鼠标快速滑过 pop显示在下一目标上 上次的element还未移除

            layerBind()

            if( this.align ){
                //当鼠标在多个相近得nearby间快速扫动时，align定位不会及时更新 所以加延时处理
                setTimeout(e=>{
                    this.align.set({
                        nearby : this.state.nearby
                    })
                }, 0)
            }else{
                setTimeout(()=>{
                    this.setAlign(Object.assign({}, this.props, {
                      nearby : this.state.nearby,
                      element : $(this.wrap),
                      onTurn (turnPosition) {
                        self.getOrigin(turnPosition)
                      }
                    }))
                })
            }
            
            clearTimeout(delayHideClass)
            $(this.state.nearby).addClass(showClassName)

        }).onHide(()=>{
            
            delayHideClass = setTimeout(()=>{
                $(this.state.nearby).removeClass(showClassName)
            }, 200)
            // Popover.destory(this)
            
            this.hidedelay = window.setTimeout(e=>{
                var {layer} = this.refs
                if( !layer ){//layer已被移除
                    return
                }
                document.body.removeChild(this.element)
                layer.layer = null
                this.align = null
            }, 200)
        })
    },
    renderLayer(){
        var {sharp, name} = this.props
        var {className, template, origin, direction} = this.state
        className = nj.utils.joinClass(
            'nj-popover', 
            sharp && 'nj-popover-sharp-'+direction,//窗体是否带尖角图标
            className, 
            name)
        var style = {transformOrigin:origin}        
        template = typeof template=='function' ? template.call(this) : template
        var body = template
        if( typeof template =='string' ){
          body = <span dangerouslySetInnerHTML={{__html:template}}></span>
        }
        var sharpClass = nj.utils.joinClass('nj-icon nj-icon-sharp', direction&&'nj-icon-sharp-'+direction)
        
        return (
        <div className={className} style={style}>
            <div className="nj-popover-inner" style={style}>
                {body}
            </div>
            {sharp ? (<i className={sharpClass}></i>) : null}
        </div>)
    },
    render () {
        return <Layer ref="layer" from={this} />
    }
})

//点击document隐藏所有pop
var docWatch = (function(){
    var initial
    var pops = []
    var delay
    var hide = (e)=>{
        // console.log(e.isDefaultPrevented())
        // window.clearTimeout(delay)
        // delay = window.setTimeout(i=>{
            pops.forEach(pop=>{
                if( e.target===pop.state.nearby ){
                    return
                }
                pop.setDisplay(false)
            })
        // }, 0)
    }
    return {
        push (pop) {
            if( !initial ){
                initial = true
                $(document).on(clickEvent, hide)
            }
            pops.push(pop)
        }
    }
}());

var Layer = React.createClass({
    renderLayer () {
        if( !this.layer ){
            this.layer = nj.utils.createContainer('nj-popover-container nj-layer-wrap')
        }
        var {from} = this.props
        var layerElement = from.renderLayer()
        ReactDOM.unstable_renderSubtreeIntoContainer(this, layerElement, this.layer);
        from.element = this.layer
        from.wrap = $(this.layer).children()[0]
    },
    componentDidMount () {
        // this.renderLayer()
    },
    componentDidUpdate (prevProps,prevState) {
        var {from} = this.props
        from.state.visible && this.renderLayer()
    },
    render : ()=>null
})

module.exports = Popover