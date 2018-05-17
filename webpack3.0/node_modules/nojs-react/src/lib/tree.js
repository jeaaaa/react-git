/**
 * 树形菜单组件
 */
require('../../css/tree.css')
var nj = require('./nojs-react') 
var {React, ReactDOM, mixins, utils, Mui} = nj;
var $ = require('jquery')
var Popover = require('./popover')

var Tree = React.createClass({
    statics : {
        parse (options) {
            var arr = []
            var data = options.data
            var openLevel = options.openLevel //Number 初始展开的级数
            var keymap = Object.assign(_keymap, options.keymap)
            options.rootID = options.rootID === undefined ? '0' : options.rootID
            if( !data ){
                return arr
            }
            var _data = {}
            var noParent = []
            data.forEach(function(item,i){
                var pid = item[keymap.parentid]
                var level

                if( !pid || pid==options.rootID ){
                    level = item.level = 0
                }else if( _data[pid] ){
                    level = item.level = _data[pid].level+1
                    _data[pid].children.push(item)
                }else{//子节点出现在父节点前面
                    noParent.push(item)
                }
                if( openLevel && level<openLevel ){
                    item.open = true
                }

                item.display = true
                item.children = []
                if( level!==undefined ){
                    arr[level] = arr[level] || []
                    arr[level].push(item)
                }
                _data[item[keymap.id]] = item
            })

            noParent.forEach(function(item,i){
                var pid = item[keymap.parentid]
                var pnode = _data[pid]
                if( pnode ){
                    var level = item.level = pnode.level+1
                    pnode.children.push(item)

                    arr[level] = arr[level] || []
                    arr[level].push(item)
                }
            })

            return {
                databyid : _data,
                databylevel : arr
            }
        },
        init (options) {
            return ReactDOM.render(
              <Tree {...options} />,
              options.element
            )
        },        
        //显示一个层级select菜单
        levelSelect (options) {
            var el = options.element
            if( !el || el['$$levelselect'] ){
                return
            }
            options.keymap = $.extend({
                'id' : 'id',
                'name' : 'name',
                'parentid' : 'parentid'
            }, options.keymap)

            options.rootID = options.rootID === undefined ? '0' : options.rootID

            var data = options.dataFormat = Tree.parse(options)
            el['$$levelselect'] = 1

            return ReactDOM.render(
              <LevelSelect {...options} />,
              options.element
            )
        },
        //显示select级联菜单
        treeSelect (options) {
            options.keymap = $.extend({
                'id' : 'id',
                'name' : 'name',
                'parentid' : 'parentid'
            }, options.keymap)

            options.rootID === undefined ? '0' : options.rootID

            var data = options.data
            if( typeof data=='string' ){
                options.async = true
            }else{
                options.dataFormat = Tree.parse(data)
            }            

            var LinkSelect = Tree.LinkTree
            return ReactDOM.render(
              <LinkSelect {...options} />,
              options.element
            )
        }
    },
    getDefaultProps () {
        return {level:0, allowSelect:true, allowToggle:true}
    },
    componentWillReceiveProps (nextProps) {
        if( !nextProps.level ){
            var options = this.rootInit(nextProps)
            //this.setState(options)
        }else{
            //this.setState(nextProps)
        }   
    },
    rootInit (props) {
        var options = Object.assign({}, props)
        options.keymap = Object.assign(_keymap, options.keymap)

        options.rootID = options.rootID === undefined ? '0' : options.rootID
        
        var level = options.level || 0

        if( typeof options.data=='string' ){
            options.async = true
            options.dataFormat = {
                databyid : {},
                databylevel : []
            }
            options.source = options.data
            options.data = []
        }else{
            var data = Tree.parse(options)
            var children = data.databylevel[level]
            options.data = children
            options.dataFormat = data
        }
        return options
    },
    getInitialState () {
        var options = Object.assign({}, this.props)
        if( !options.level ){
            options = this.rootInit(options)
        }
        return options
    },
    componentWillMount (){
        //添加事件
        this.toggleEvent = utils.addEventQueue.call(this, 'onToggle')
        this.changeEvent = utils.addEventQueue.call(this, 'onChange')
        if( !this.state.level ){            
            this.pullEvent = utils.addEventQueue.call(this, 'onPull')
            this.fetchEvent = utils.addEventQueue.call(this, 'onFetch')
            this.fetchCompleteEvent = utils.addEventQueue.call(this, 'onFetchComplete')
            this.checkEvent = utils.addEventQueue.call(this, 'onChecked')
        }
        //这里还处于外部render过程 外部还未完成 添加事件动作
        setTimeout(()=>{
            this.getData(null,null,0)
        }, 1)
    },
    componentDidMount () {
        var {level, dataFormat, defaultNode} = this.state
        defaultNode = dataFormat && dataFormat.databyid[defaultNode]
        if( !level && defaultNode ){
            this.select(defaultNode)
        }
    },
    toggle (node, event) {
        //阻止事件冒泡到select事件
        if( event && event.stopPropagation ){
            event.stopPropagation()
        }else if(window.event){
            window.event.cancelBubble = true
        }
        if( !this.props.allowToggle ){
            return
        }
        node.open = !node.open
        var rootScope = this.props.rootScope || this
        var KEY_ID = this.state.keymap.id
        if( node.open ){
            if( rootScope.state.async ){
                this.getData(node, this.state.level+1, 1)
            }else{
                node.complete = true
            }
        }
        this.setState({change:!this.state.change})
        event && this.toggleEvent.complete(node, event)
        
        //event.preventDefault()
    },
    //选中节点
    select (node, event) {
        if( !node || !this.props.allowSelect ){
            return
        }

        event && this.changeEvent.complete(node, event)

        if( event && event.isDefaultPrevented() ){//调用preventDefault阻止选中
            return
        }
        var _node = this.state.node
        if( _node ){//取消上个选中节点的select状态
            delete _node.select
        }
        //打开所有父节点
        this.getParents(node).reverse().forEach((parent)=>{
            !parent.open && this.toggle(parent)
        })
        // if( !node.select ){
        //     var allnodes = this.state.dataFormat.databyid
        //     for( var i in allnodes ){
        //         allnodes[i].select = null
        //     }
        // }
        node.select = true
        this.setState({node:node})
        return this
    },
    //获取所有父节点
    getParents (node) {
        var parents = []
        var {keymap, dataFormat} = this.state
        var KEY_ID = keymap.id
        var id = node[KEY_ID]
        var allnodes = dataFormat.databyid
        if( !allnodes[id] ){
            return parents
        } 
        var KEY_PID = keymap.parentid
        var parentNode = allnodes[node[KEY_PID]]
        while( parentNode ){
            parents.push(parentNode)
            parentNode = allnodes[parentNode[KEY_PID]]
        }
        return parents
    },  
    //获取所有子节点
    getChildren (node) {
        var children = node.children || []
        var {keymap, dataFormat} = this.state
        var KEY_ID = keymap.id
        var id = node[KEY_ID]
        var allnodes = dataFormat.databyid
        if( !allnodes[id] ){
            return children
        } 
        children.forEach(item=>{
            children = children.concat(this.getChildren(item))
        })
        return children
    },  
    //设置节点显示状态
    setNodeDisplay (node, display) {
        if( !node ){
            return
        }
        node.display = display

        if( display ){//需要检测其父级是否为显示状态
            var KEY_PID = this.props.keymap.parentid
            var allnodes = this.props.dataFormat.databyid
            var parentNode = allnodes[node[KEY_PID]]
            while( parentNode ){
                parentNode.display = display
                parentNode.open = 1
                parentNode = allnodes[parentNode[KEY_PID]]
            }
        }
        this.setState({change:!this.state.change})

    },
    getData (parentNode, level, from) {
        var rootScope = this.props.rootScope || this
        if( !rootScope.state.async ){
            return
        }
        // console.log(parentNode, level,from)
        level = level || 0
        
        var parentid = rootScope.state.rootID
        var KEY_ID = rootScope.state.keymap.id
        var KEY_PID = rootScope.state.keymap.parentid

        var databyid = rootScope.state.dataFormat.databyid
        parentNode = parentNode || this.state.parentNode

        if( parentNode ){
            if( parentNode.complete ){
                return
            }
            parentNode.pending = true
            parentid = parentNode[KEY_ID]            
        }

        var source = rootScope.state.source
        var promise = $.getJSON(source+parentid)

        promise = rootScope.fetchEvent.complete(promise, parentid, level) || promise

        promise.then(json=>{
            var data = json || []
            //this.state.data[level] = json.data
            data = data.filter((node)=>{            
                if( !node[KEY_PID] || String(node[KEY_PID])==parentid ){//筛选parentid正确的节点
                    databyid[node[KEY_ID]] = node
                    node[KEY_PID] = parentid//返回的数据可能没有指定pid 
                    return true
                }
            })
            
            rootScope.pullEvent.complete(this, data)//暂时保留
            rootScope.fetchCompleteEvent.complete(data, parentid, level, this)

            if( parentNode ){
                parentNode.pending = null
                parentNode.children = data
                parentNode.complete = true
                this.setState({change:!this.state.change}) 
            }else{
                this.setState({data:data}) 
            }
        })
    },
    checkHandle (item, e) {
        item.checked = e.target.checked
        this.checkEvent.complete(item, e)
        this.forceUpdate()
    },
    //获取所有已选的ids
    getChecked () {
        let {dataFormat} = this.state
        let allnodes = dataFormat.databyid
        let checked = []
        for( let i in allnodes ){
            allnodes[i].checked && checked.push(i)
        }
        return checked
    },
    render(){
        var {data, level, parentNode, keymap} = this.state        
        var visible = !parentNode || parentNode.open ? ' d_show' : ' d_hide'
        var rootScope = this.props.rootScope || this
        var {async, node, textClick, allowSelect, checkbox} = rootScope.state

        return data ? (
            <ul className={'level'+level+visible}>
                {
                    //对于父节点没有打开的暂时不渲染其子节点
                    (!parentNode || parentNode.open || parentNode.complete) && data.map((item,i) => {
                        if( item.display===false ){//隐藏节点
                            return
                        }
                        var children = item.children = item.children || []

                        if( !children ){
                            //return
                        }
                        var holder = [];
                        for( var j=0;j<level;j++){
                            holder.push(j)
                        }
                        var nodeClass = ['item']
                        var childOptions = {
                            keymap, level
                        }
                        var nochild

                        if( children.length  || async ){
                            Object.assign(
                                childOptions, 
                                this.props, 
                                {level:level+1, parentNode:item, rootScope:rootScope}
                            )
                            childOptions.data = children
                        }
                        if( async ){
                            if( item.complete && !children.length ){
                                nochild = true

                            }else if( !item.complete && item.open && !item.pending ){//初次需要打开的节点
                                window.setTimeout(()=>{
                                    this.getData(item, this.state.level+1, 2)
                                }, 10)
                            }

                        }else if(!children.length) {
                            nochild = true
                        }
                        nochild && nodeClass.push('no-child')

                        item.pending && nodeClass.push('pending')
                        item.open && nodeClass.push('open')
                        node && item.select && nodeClass.push('selected')

                        //节点显示名称可以通过函数自定义
                        var nodeName = item[keymap.name]
                        var defineName = rootScope.props.defineName
                        if( typeof defineName=='function' ){
                            nodeName = defineName.call(rootScope,item)
                        }

                        // console.log(this.level,children,children.length,parentNode)

                        var KEY_ID = keymap.id
                        // var className = utils.joinClass('level'+level+'-item', i==data.length-1 && 'last-item')

                        i==data.length-1 && nodeClass.push('last-item')

                        var itemOptions = {
                            key : i,
                            'data-id' : item[KEY_ID],
                            className : utils.joinClass('level'+level+'-item', 'has-children')
                        }
                        if( rootScope.props.style=='menu' && !nochild ){//下拉菜单 添加hover 展示子菜单
                            itemOptions.onMouseEnter = e=>{
                                item.open = false
                                this.toggle.call(this, item, e)
                            }
                            itemOptions.onMouseLeave = e=>{
                                item.open = true
                                this.toggle.call(this, item, e)
                            }
                        }
                        return (
                        <li {...itemOptions}>
                        {React.createElement(
                            allowSelect ? Mui : 'span',
                            {
                                onClick (e) {
                                    rootScope.select.call(rootScope,item,e);
                                    !nochild&&textClick&&this.toggle.call(this,item,e)
                                },
                                className:nodeClass.join(' ')
                            },
                            rootScope.props.style!='menu' && holder.map((h,j) => 
                                <span key={j} className={'_line'+(j+1>=level?' _line_begin _line'+(j-level+1):'')}></span>
                            ),
                            rootScope.props.style!='menu' && <span className="_icon" onClick={!nochild&&this.toggle.bind(this,item)}></span>,
                            checkbox ? (
                                <span className="_checkbox">
                                    <input type="checkbox" 
                                        name={checkbox.name} 
                                        checked={!!item.checked} 
                                        onChange={rootScope.checkHandle.bind(rootScope, item)}
                                        value={item[KEY_ID]} 
                                        disabled={item.disabled}/>
                                </span>
                            ) : null,
                            
                            typeof nodeName=='string' ?  
                                <span className="_text" dangerouslySetInnerHTML={{__html:nodeName}}></span> : 
                                <span className="_text">{nodeName}</span>,

                            rootScope.props.style=='menu' && !nochild && <i className="nj-icon nj-icon-right"></i>
                        )}
                        {/*
                        <Mui 
                            onClick={e=>{
                                rootScope.select.call(rootScope,item,e);
                                !nochild&&textClick&&this.toggle.call(this,item,e)}
                            } 
                            className={nodeClass.join(' ')}
                        >

                            {holder.map((h,j) => 
                                <span key={j} className={'_line'+(j+1>=level?' _line_begin _line'+(j-level+1):'')}></span>
                            )}
                            
                            <span className="_icon" onClick={!nochild&&this.toggle.bind(this,item)}></span>
                            {checkbox ? (
                                <span className="_checkbox">
                                    <input type="checkbox" 
                                        name={checkbox.name} 
                                        defaultChecked={item.checked} 
                                        value={item[KEY_ID]} 
                                        disabled={item.disabled}/>
                                </span>
                            ) : null}
                            
                            {typeof nodeName=='string' ?  
                                <span className="_text" dangerouslySetInnerHTML={{__html:nodeName}}></span> : 
                                <span className="_text">{nodeName}</span>
                            }   
                        </Mui>
                        */}
                        {children.length ? (<Tree {...childOptions} />) : null}
                        </li>
                        )
                    })
                }
            </ul>
        ) : null
    }
})

var _keymap = {
    'id' : 'id',
    'name' : 'name',
    'parentid' : 'parentid'
}


//显示一个层级select菜单
var LevelSelect = React.createClass({
    getInitialState () {
        var options = Object.assign({}, this.props)
        options.keymap = $.extend({
            'id' : 'id',
            'name' : 'name',
            'parentid' : 'parentid'
        }, options.keymap)

        options.rootID = options.rootID === undefined ? '0' : options.rootID
        options.dataFormat = Tree.parse(options)

        return options
    },
    handleChange (e) {       
        var node = this.state.dataFormat.databyid[e.target.value]
        this.setState({value:e.target.value})
        this.changeEvent.complete(node, e)
    },
    componentWillMount () {
        this.changeEvent = nj.utils.addEventQueue.call(this, 'onChange')
    },
    render () {
        var {keymap} = this.state
        var levels = this.state.dataFormat.databylevel
        var items = []
        var KEY_ID = keymap.id
        var KEY_NAME = keymap.name

        function getlines(level){
            var line = ''
            while(--level>=0 ){
                line += '--'
            }
            return line
        }

        var key = 0
        var maxlevel = this.props.maxlevel
        maxlevel = typeof maxlevel=='function' ? maxlevel.call(this) : maxlevel

        function getItems(nodes){
            if( !nodes || !nodes.length ){
                return
            }
            var level = nodes[0].level
            if( maxlevel && level>=maxlevel ){
                return
            }
            nodes.forEach(function(node,j){
                items.push(<option value={node[KEY_ID]} disabled={node.disabled} key={++key}>{getlines(node.level)+node[KEY_NAME]}</option>)
                getItems(node.children)
            })
        }
        var {rootNode, size, name, className, value} = this.props
        rootNode = rootNode===false ? false : true

        rootNode && items.push(<option value={this.state.rootID} key={++key} className="root-node" style={{color:'#999'}}>{'----根节点----'}</option>)
        getItems(levels[0])
        
        return (
            <select 
                size={size} 
                name={name} 
                className={className} 
                onChange={this.handleChange}
                defaultValue={value}>

                {items}
            </select>
        )
    }
})

Tree.SelectTree = LevelSelect

//select级联菜单
Tree.LinkTree = React.createClass({
    statics : {
        cache : {}
    },
    getDefaultProps () {
        return {
            selected : [],
            listRows : 7,
            type : 'select',
            trigger : 'click'
        }
    },
    initState (props) {
        var options = Object.assign({
            ids : []
        }, props || this.props)
        options.keymap = $.extend({
            'id' : 'id',
            'name' : 'name',
            'parentid' : 'parentid'
        }, options.keymap)

        options.rootID = options.rootID === undefined ? '0' : options.rootID
        options.style = options.type.indexOf('list')==0 ? 'list' : 'select'

        var data = options.data
        if( typeof data=='string' ){
            options.async = true
            options.dataFormat = {
                databyid : {},
                databylevel : []
            }
            options.cache = {}//缓存远程数据
        }else{
            options.dataFormat = Tree.parse(options)
        }  

        //this.state.menuData: Array 存放输入状态下每级的数据列表 
        var data = []
        if( !options.async ){
            var levels = options.dataFormat.databylevel 
            data.push(levels[0])
        }
        options.menuData = data
        window.setTimeout(()=>{
            this.select(options.selected.filter(p=>p));
        }, 1)

        return options;
    },
    getInitialState () {
        return this.initState()
    },
    componentWillReceiveProps(nextProps){
        (nextProps.data!==this.props.data || nextProps.selected!==this.props.selected ) && 
            this.setState(this.initState(nextProps));
    },
    componentWillMount () {
        this.changeEvent = nj.utils.addEventQueue.call(this, 'onChange')
        this.fetchEvent = nj.utils.addEventQueue.call(this, 'onFetch')
        this.fetchCompleteEvent = nj.utils.addEventQueue.call(this, 'onFetchComplete')

        setTimeout(e=>{
            this.state.async ? this.getData() : this.getListSize()
        }, 1)
    },
    componentDidMount () {
        // $(ReactDOM.findDOMNode(this)).on('touchmove', function(e){
        //     e = e.originalEvent ? e.originalEvent : e;
        //     console.log(e.target)
        // })
        // $(ReactDOM.findDOMNode(this)).delegate('span.list-item', 'slideY', function(e, touch){
        //     let {el, y1, y2} = touch
        //     let distance = y2 - y1
            
        //     // el.children().animate({
        //     //     scrollTop: distance*-1
        //     // }, 50)

        // }).on('touchend', function(e){
        //     console.log(123, e)
        // })
    },
    getListSize () {
        let {listHeight, style} = this.state
        if( style=='list' && !listHeight){
            let list = this.refs['select-0']
            if( list ){
                let item = list.firstChild
                this.setState({listHeight:item.offsetHeight})   
            }                     
        }  
    },
    getData (parentid, level) {
        var {menuData, async, keymap} = this.state
        if( !async ){
            return
        }
        level = level || 0

        var KEY_ID = keymap.id
        var KEY_PID = keymap.parentid
        parentid = parentid || this.state.rootID

        var next = (data)=>{
            menuData[level] = [].concat(data)
            this.setState({menuData}, this.getListSize)
        }
        var {cache} = this.constructor
        var source = this.props.data+parentid
        var cacheData = cache[source]
        var databyid = this.state.dataFormat.databyid

        if( cacheData ){
            cacheData.forEach(function(node){
                databyid[node[KEY_ID]] = node
            })
            next(cacheData)
            return
        }
        var promise = $.getJSON(source)
        promise = this.fetchEvent.complete(promise, parentid) || promise

        promise.then(json=>{
            var data = json || []
            data = data.filter((node)=>{
                if( !node[KEY_PID] || String(node[KEY_PID])==parentid ){
                    databyid[node[KEY_ID]] = node
                    return true
                }
            })
            this.fetchCompleteEvent.complete(data)

            cache[source] = data
            next(data) 
        })
    },
    //选中节点 selected 选中的节点id
    select (selected, update){
        this.resetData(0)
        // console.log(selected)
        update = update===false ? false : true
        this.state.ids = selected && selected.length ? selected : []
        selected = selected || [];
        if( !selected.length ){

        }
        selected = selected.map(function(id){
            return {id:id}
        })
        // console.log(selected,this.state.ids)
        this.state.selected = selected
        update && this.setState({selected:selected, ids:this.state.ids})
    },
    //清空数据
    resetData (fromLevel) {
        this.state.menuData.forEach((data,i)=>{
            if( i>fromLevel ){//选择空值时 清空所有下级
                data.length = 0
                this.state.selected[i] = {}
                this.setState({menuData:this.state.menuData})
            }
        })
    },
    handleChange (parentid, level, e) {
        var {maxlevel} = this.props
        var select = this.refs['select-'+level]
        
        var maxlevel = parseInt(maxlevel)
        var {selected, style} = this.state

        this.resetData(level)

        if(!select){
            return
        }

        var {menuData, dataFormat, async, keymap} = this.state

        // var parentid = select.value
        selected[level] = parentid!=undefined && dataFormat.databyid[parentid] ? {
            id : parentid,
            name : dataFormat.databyid[parentid][keymap.name]
            // style=='select' ? 
            //     nj.utils.selectedOptions(select).text :
            //     e.target.innerText
        } : {}
        

        if( !maxlevel || level+1<maxlevel ){
            if( async ){
                parentid!=undefined && this.getData(parentid, level+1)
            }else{
                var parentNode = dataFormat.databyid[parentid]      
                var data = parentNode ? [].concat(parentNode.children) : []
                menuData[level+1] = data
                this.setState({menuData}) 
            }
        }else{
            this.setState({selected})
        }
        var node = dataFormat.databyid[parentid]

        this.changeEvent.complete(node, level, e)

        // this.props.onChange && this.props.onChange.call(this,parentid,level,e)
    },
    render () {
        var {keymap, ids, menuData, selected, style, listHeight} = this.state
        var KEY_ID = keymap.id
        var KEY_NAME = keymap.name
        var {maxlevel, type, listRows, infos=[], trigger} = this.props
        var listCols = maxlevel || 3
        //infos = infos || []//附加信息 如name
        
        let className = nj.utils.joinClass(
            'nj-tree-select clearfix', 
            type=='list-ios'&&'nj-tree-select-ios'
        )
        return (
        <div className={className}>
            {menuData.map((level,i)=>{
                if( maxlevel && i+1>maxlevel ){
                    return
                }
                if( !level || !level.length ){
                    return
                }
                var id = ids[i]//默认选中节点
                
                var info = infos[i] || {}
                var valid

                var el = level && level.length ? (
                    <span key={i} className={style+'-item'} style={type=='list-ios' ? {width:100/listCols+'%'} : {}}>
                    {style=='list' ?
                    <div className="inner">
                        <ul ref={'select-'+i} 
                            className={info.className} 
                            style={type=='list-ios' ? {padding:(listHeight*(listRows-1)/2)+'px 0'} : {}}
                        >
                            {level.map((item,j)=>{
                                if( id && item[KEY_ID]==id ){//检测被设置的默认选中id是否有效
                                    valid = true
                                }
                                let itemOptions = {
                                    key : item[KEY_ID],
                                    className : selected[i] && selected[i].id==item[KEY_ID]?'active':'',
                                    [trigger=='click'?'onClick':'onMouseOver'] : e=>type=='list' && this.handleChange(item[KEY_ID], i, e),
                                    value : item[KEY_ID]
                                }
                                return (<li {...itemOptions}>
                                    {item[KEY_NAME]}
                                    {item.children.length ? <i className="nj-icon nj-icon-right"></i> : null}
                                </li>
                                )
                            })}
                        </ul>
                    </div>
                    :
                    <select 
                        {...info}
                        ref={'select-'+i} 
                        value={id || selected[i] && selected[i].id} 
                        onChange={e=>this.handleChange(e.target.value, i, e)}
                    >
                        <option value="">请选择</option>
                        {level.map((item,i)=>{
                            if( id && item[KEY_ID]==id ){//检测被设置的默认选中id是否有效
                                valid = true
                            }
                            return (<option key={item[KEY_ID]} value={item[KEY_ID]}>{item[KEY_NAME]}</option>)
                        })}
                    </select>
                    }
                    </span>
                ) : null 

                var _el = el && el.props.children
                // console.log(el)

                if( id && _el ){
                    ids[i] = null//选中后清空 防止重复
                    valid && setTimeout(()=>{
                        this.handleChange(id, i)
                        // _el.props.onChange()
                    }, 1)
                }               
                return el
            })}            
        </div>
        )
    }
})

//无限级下拉菜单
Tree.MenuTree = props=>{
    let {target, trigger, data} = props
    let pop = Popover.create({
        trigger,
        nearby : target,
        name : 'nj-menu',
        template : <div className="nj-tree nj-menu-tree">
            <Tree 
                {...props}
                style='menu'
            />
        </div>
    })
    pop.onHide(()=>{
        data.forEach(n=>{
            n.open = false
        })
    })
    return pop
}
Tree._MenuTree = React.createClass({
    getInitialState () {
        let options = Object.assign({
            keymap : {
                'id' : 'id',
                'name' : 'name',
                'parentid' : 'parentid'
            },
            rootID : '0'
        }, this.props)
        let dataFormat = Tree.parse(options)
        return {pops:[], dataFormat, options, selected:[]}
    },
    componentDidMount () {
        let {target, trigger} = this.props
        let {pops, dataFormat} = this.state

        pops[0] = Popover.create({
            trigger,
            nearby : target,
            name : 'nj-menu nj-menu-0',
            template : this.renderMenu(dataFormat.databylevel[0], 0)
        })
        this.bindPop(pops[0], 0)
    },    
    createPop (level) {
        let {trigger} = this.props
        let {pops, dataFormat} = this.state

        let parentPop = pops[level-1]
        let pop = pops[level] = Popover.create({
            trigger,
            name : 'nj-menu nj-menu-'+level,
            position : {left:100, top:0},
            nearby : $(parentPop.wrap).find('li.has-children')
            // delegate : ['li.has-children', parentPop.wrap]            
        })
        .onShow(()=>{
            let parentid  = $(pop.state.nearby).data('id')
            let parentNode = dataFormat.databyid[parentid]
            let template = this.renderMenu(parentNode.children, level)
            pop.setState({template})            
        })
        pop.parentPop = parentPop
        this.bindPop(pop, level)    
    },
    bindPop (pop, level) {
        let {pops} = this.state
        let parentPop = pop.parentPop
        pop.onShow(()=>{
            this.createPop(level+1)
            // pops[level+1].setState({nearby:$(pop.wrap).find('li.has-children')})

            $(pop.wrap)           
            .on('mouseenter.relation', e=>{
                clearTimeout(pop.delayhide)
                if( !parentPop ) return
                parentPop.keepVisible = true
                //stop hide parents
                pops.forEach((p,i)=>{
                    i<level && clearTimeout(p.delayhide)
                })
            })
            .on('mouseleave.relation', e=>{
                //hide self
                pop.delayhide = setTimeout(()=>{
                    pop.keepVisible = null
                    pop.setDisplay(false)
                }, 40)
                //hide parents
                if( !parentPop ) return
                pops.forEach((p,i)=>{
                    if( i<level ){
                        p.delayhide = setTimeout(()=>{
                            p.keepVisible = null
                            p.setDisplay(false)    
                        }, 40)
                    }                    
                })                
            })
        })
    },
    renderMenu (data, level) {
        let {onChange} = this.props
        let {options:{keymap}, dataFormat, selected, pops} = this.state
        let KEY_ID = keymap.id
        let KEY_PID = keymap.parentid
        let KEY_NAME = keymap.name
        return <ul>
            {data.map(item=>{
                let id = item[KEY_ID]
                let n = item.children.length
                return <li 
                    key={id} 
                    data-id={id} 
                    className={utils.joinClass(n && 'has-children', selected[level]===item&&'active')}
                    onClick={e=>{
                        selected = selected.slice(0, level+1)//清空level所有下级
                        selected[level] = item
                        this.setState({selected}, ()=>{
                            pops[level].setState({template:this.renderMenu(data,level)})  
                        })
                        onChange && onChange(item, level)
                    }}
                >
                    {item[KEY_NAME]}
                    {n ? <i className="nj-icon nj-icon-right"></i> : null}
                </li>
            })}
        </ul>
    },
    render () {
        return null
    }
})
//json or array
Tree.JsonTree = React.createClass({
    getDefaultProps () {
        return {data:[]}
    },    
    getId () {
        return Math.random().toString(16).substring(2)
    },
    parseData (data, parentid, parentkey) {
        parentid = parentid || 0
        parentkey = parentkey || ''
        var type = $.type(data)
        var arr = []        
        var id = this.getId()
        
        if( type=='object' || type=='array' ){
            var name
            if( type=='object' ){
                name = 'Object {}'
                if( data.nodeType ){
                    name = 'HTMLElement'
                }
            }else{
                name = 'Array ['+data.length+']'
            }
            if( parentkey ){
                name = '<i class="key">'+parentkey + '</i>: ' + name
            }
            arr.push({id, name, parentid})

            for( var i in data ){
                var val = this.parseData(data[i], id, i)
                arr = arr.concat(val)
            }
        }else{
            data = type=='function' ? '[Function]' : String(data)  
            var _data = data
            data = '<i class="datatype '+type+'" title="'+data+'">'
            if( type=='string' ){
                data = '"' + data + _data.substring(0,46) + (_data.length>46?'...':'') + '"'
            }else{
                data += _data
            }
            data += '</i>'
            arr.push({id, name:'<i class="key">'+parentkey+'</i>: '+data, parentid})
        }
        return arr
    },
    render () {
        let options = Object.assign({
            allowSelect : false,
            textClick : true
        }, this.props)
        options.data = this.parseData(options.data)
        return <Tree {...options}  />
    }
})

module.exports = Tree