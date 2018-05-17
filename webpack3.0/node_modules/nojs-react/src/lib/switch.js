/**
 * Switch组件
 */
var nj = require('./nojs-react'), {React, ReactDOM, mixins} = nj
var $ = require('jquery')

var Directive = require('../mixins/directiveComponent')

var Switch = React.createClass({  
    mixins : [mixins.childComponents.config],
    getInitialState () {
        return {index:0, trigger:this.props.trigger||'click'}
    },
    componentDidMount () {
        directive.getChildComponents(this)
        
        //自动切换
        var interval = this.props.interval
        interval && window.setInterval(()=>{
            this.change(++this.state.index)
        }, interval)

        this.changeEvent = nj.utils.addEventQueue.call(this, 'onChange')//.add(this.props.onChange)

        this.readyEvent = nj.utils.addEventQueue.call(this, 'onReady')
        setTimeout(e=>this.readyEvent.complete(), 1)
    },
    change (index,e) {
        var length = this.state.length 
        index = index <0 ? length-1 : index
        index = index>= length ? 0 : index
        this.state.index = index
        this.setState({index:index})

        this.state.childComponents.forEach((c)=>{
            c.forceUpdate()
        })
        this.changeEvent.complete(index,e)
    },
    render () {
        var className = nj.utils.joinClass('nj-switch', this.props.className)
        return (
        <div {...this.props} className={className}>
            {this.props.children}
        </div>
        )
    }
})

var SwitchMenu = React.createClass({
    mixins : [mixins.childComponents.setParents([Switch], 1)],    
    componentDidMount () {
        directive.getChildComponents(this)
    },
    render () {
        var parentComponent = this.state.parentComponent
        var index = parentComponent.state.index
        var className = nj.utils.joinClass('nj-switch-menu', index==this.state.index&&'nj-switch-menu-active')
        
        var options = {className:className}
        
        var trigger = parentComponent.state.trigger
        var eventType = trigger=='hover' ? 'onMouseEnter' : 'onClick'
        //调用父组件的change方法
        options[eventType] = parentComponent.change.bind(parentComponent, this.state.index)

        options = Object.assign({}, this.props, options)

        return (
        <div {...options} >
            {this.props.children}
        </div>
        )
    }
})

var SwitchItem = React.createClass({
    mixins : [mixins.childComponents.setParents([Switch], 1)],
    componentDidMount () {
        directive.getChildComponents(this)
        //以SwitchItem的数量来更新Switch组件的切换子项个数
        this.state.parentComponent.state.length = this.state.index+1
    },
    render () {
        var index = this.state.parentComponent.state.index
        var className = nj.utils.joinClass('nj-switch-item', index==this.state.index?'nj-switch-item-active':'d_hide')
        return (
        <div {...this.props} className={className}>
            {this.props.children}
        </div>
        )
    }
})

var directive = new Directive({
    elementGroups : {
        'switch' : {children:['switch-menu','switch-item'], component:Switch},
        'switch-menu' : {component:SwitchMenu},
        'switch-item' : {component:SwitchItem}
    },
    exports : exports
})
// directive.start()
