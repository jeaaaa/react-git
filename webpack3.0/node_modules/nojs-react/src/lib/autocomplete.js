/**
 * auto-complete
 */
var nj = require('./nojs-react')
var {React, ReactDOM, mixins, utils, Mui} = nj
var $ = require('jquery')
var Popover = require('./popover')
var {Form, Input} = require('./form')
// var fetch = require('isomorphic-fetch')
var Directive = require('../mixins/directiveComponent')

var Autocomplete = module.exports = React.createClass({
    mixins : [mixins.childComponents.config], 
    getDefaultProps () {
        return {getItem : item=>String(item), disableEnter:false, max:20}
    },
    getInitialState () {  
        let {results=[], disable, value=''} = this.props
        return {
            results,
            value,
            disable,
            //缓存远程数据
            cache : {}
        }
    },
    keyup (e) {
        var self = this
        var key = e.keyCode, value = e.target.value;
        // 有效输入键
        // [8 : backspace] [32 : space] [46: delete]
        if( key==8 || key==32 || key==46         
            || key==229                // 中文键或全角 部分可输入字符
            || (key>47 && key<58)     // [48-57 : 0-9]
            || (key>64 && key<91)     // [65-90 : a-z]
            || (key>95 && key<112)    // [96-111 : 小键盘]
            || (key>185 && key<193)   // [186-192 : ;=<->/`]
            || (key>218 && key<223)   // [219-222 : [\]' ]
        ){
            clearTimeout(this._delay);            
            function search() {
                self.filter(value);
                self.keyupEvent.complete(value, key);
            }
            this._delay = setTimeout(search, this.props.source ? 300 : 0);
        }
    },
    keydown (e) {
        var key = e.keyCode
        switch(key){
            case 13://enter
                this.move('enter');
                if( this.props.disableEnter ){//阻止触发表单事件 
                                
                }
                e.preventDefault()        
                break;                
            case 38://up
                this.move("up");
                break;
            case 40://down
                this.move("down");
                break;
        }
    },
    //移动鼠标选中结果项
    move (direction) {
        var {index, results} = this.state
        var length = results.length
        var value, item
        index = typeof index=='number' ? index : -1

        if( direction=='enter' ){ 
            item = results[index]
            value = item ? this.props.getItem(item) : this.state.value
            this.enterEvent.complete(index, value);           
            index>=0 && this.select(index, 'enter')
            return
        }
        
        if( direction=='up' ){
            index = index<=0 ? length-1 : --index
        }else if( direction=='down' ){
            index = index>=length-1 ? 0 : ++index
        }
        item = results[index]
        value = item ? this.props.getItem(item) : this.state.value
        this.setState({index, value})
        this.moveEvent.complete(index, value)

        var onChange = this.props.onChange
        onChange && onChange(value, index)
    },
    select (index, type, e) {
        var item = this.state.results[index]
        if( !item ){
            return
        }
        var {text, container} = this.refs
        var {input} = text.refs
        var value = this.props.getItem(item)
        var onChange = this.props.onChange
        onChange && onChange(value)
        
        this.state.value = value
        this.state.index = index

        this.setState({value, index})  
        this.chooseEvent.complete(item, type==='enter')
        type=='click' && input.focus() 
        this.setDisplay(false)
        window.setTimeout(e=>this.setDisplay(false), 450)
    },
    componentDidMount () {
        var {results} = this.state//默认传入的results
        if(results){
            this.forceUpdate(()=>{
                //var {container} = this.refs                
            })            
        }
        this.fetchBeforeEvent = utils.addEventQueue.call(this, 'onFetchBefore')
        this.fetchEvent = utils.addEventQueue.call(this, 'onFetch')
        this.fetchCompleteEvent = utils.addEventQueue.call(this, 'onFetchComplete')

        this.completeEvent = utils.addEventQueue.call(this, 'onComplete')//筛选完成后触发

        this.chooseEvent = utils.addEventQueue.call(this, 'onChoose')        
        this.enterEvent = utils.addEventQueue.call(this, 'onEnter')
        this.moveEvent = utils.addEventQueue.call(this, 'onMove')
        this.keyupEvent = utils.addEventQueue.call(this, 'onKeyup')//输入时触发
    },
    componentDidUpdate () {
        var {text, container} = this.refs
        var {input} = text.refs
        
        if( container && !container._init_ ){
            container._init_ = true
            container.onShow(e=>{
                $(container.wrap).width($(input).outerWidth())                
            }).onDisplayChange(visible=>{
                var {results} = this.state
                if( visible && (!results.length || !input.value) ){//没有结果 阻止显示
                    return false
                }
            })
        }
    },
    componentWillReceiveProps (nextProps) {
        let {value, disable} = nextProps
        this.setState({disable})
        value!==undefined && this.setState({value})
    },
    setDisplay (display) {
        var container = this.refs.container
        if( container ){
            container.setDisplay(display);
            display && container.align.set()
        }
    },
    filter (value) {
        var {text, container} = this.refs
        var {input} = text.refs
        
        var done = results => {
            results = results.slice(0,max)
            this.setState({results, index:null})
            this.setDisplay(results.length&&input.value?true:false)
            this.completeEvent.complete(results, input.value)
        }

        if( !value ){
            var results = this.props.results || []
            done(results)            
            return
        }
        var {data, source, getItem, max} = this.props
        data = data && typeof data=='string' ? JSON.parse(data) : data

        if( data ){
            var results = data.filter(item=>{
                return getItem(item).indexOf(value)>=0
            })
            done(results)

        }else if( source ){//remote fetch
            var {cache} = this.state
            var _data = cache[source+value]

            var res = this.fetchBeforeEvent.complete(value, _data)
            if( res===false ){
                return
            }

            if( _data ){
                done(_data)
                return
            }
            var promise = $.getJSON(source+value)
            // var promise = fetch(source+value, {
            //     credentials: 'include',
            //     method : 'GET',
            //     mode: "no-cors",
            //     headers : {'X-Requested-With':'XMLHttpRequest'}
            // }).then(res=>res.json())

            promise = this.fetchEvent.complete(promise, value) || promise

            promise.then(json=>{
                json = this.fetchCompleteEvent.complete(json) || json || []
                cache[source+value] = json
                if( input.value ){
                    done(json);
                }else{
                    this.setDisplay(false)
                }   
            })
        }
    },
    change (e) {
        let {onChange} = this.props
        let value = e.target.value
        this.setState({value})
        onChange && onChange(value)
        e.stopPropagation()//onChange事件会影响到父组件 阻止冒泡
    },
    render () {

        var {container, getItem, name} = this.props
        var {index, value, results, disable} = this.state
        var {text} = this.refs
        
        if( !container && value ){
            var list = <ul>{
                results.map((item,i)=>{
                    item = getItem(item)
                    return <li key={item} onClick={this.select.bind(this,i,'click')} className={i===index?'active nj-mui-active':''}><Mui>{item}</Mui></li>
                })
            }</ul>
        }
        return (
        <span>
            <Input {...this.props} 
                ref="text" 
                value={value}
                onChange={this.change} 
                onKeyDown={this.keydown} 
                onKeyUp={!disable && this.keyup} />

            {!container && text && !disable &&
                <Popover 
                    nearby={text.refs.input} 
                    trigger="click"
                    ref="container" 
                    name={'auto-complete-pop auto-complete-'+name}
                    template={list} />
            }
        </span>
        )
    }
})

var directive = new Directive({
    elementGroups : {
        'autocomplete' : {component:Autocomplete}        
    },
    exports : exports
})
