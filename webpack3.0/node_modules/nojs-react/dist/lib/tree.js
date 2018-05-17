'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * 树形菜单组件
 */
require('../../css/tree.css');
var nj = require('./nojs-react');
var React = nj.React,
    ReactDOM = nj.ReactDOM,
    mixins = nj.mixins,
    utils = nj.utils,
    Mui = nj.Mui;

var $ = require('jquery');
var Popover = require('./popover');

var Tree = React.createClass({
    displayName: 'Tree',

    statics: {
        parse: function parse(options) {
            var arr = [];
            var data = options.data;
            var openLevel = options.openLevel; //Number 初始展开的级数
            var keymap = Object.assign(_keymap, options.keymap);
            options.rootID = options.rootID === undefined ? '0' : options.rootID;
            if (!data) {
                return arr;
            }
            var _data = {};
            var noParent = [];
            data.forEach(function (item, i) {
                var pid = item[keymap.parentid];
                var level;

                if (!pid || pid == options.rootID) {
                    level = item.level = 0;
                } else if (_data[pid]) {
                    level = item.level = _data[pid].level + 1;
                    _data[pid].children.push(item);
                } else {
                    //子节点出现在父节点前面
                    noParent.push(item);
                }
                if (openLevel && level < openLevel) {
                    item.open = true;
                }

                item.display = true;
                item.children = [];
                if (level !== undefined) {
                    arr[level] = arr[level] || [];
                    arr[level].push(item);
                }
                _data[item[keymap.id]] = item;
            });

            noParent.forEach(function (item, i) {
                var pid = item[keymap.parentid];
                var pnode = _data[pid];
                if (pnode) {
                    var level = item.level = pnode.level + 1;
                    pnode.children.push(item);

                    arr[level] = arr[level] || [];
                    arr[level].push(item);
                }
            });

            return {
                databyid: _data,
                databylevel: arr
            };
        },
        init: function init(options) {
            return ReactDOM.render(React.createElement(Tree, options), options.element);
        },

        //显示一个层级select菜单
        levelSelect: function levelSelect(options) {
            var el = options.element;
            if (!el || el['$$levelselect']) {
                return;
            }
            options.keymap = $.extend({
                'id': 'id',
                'name': 'name',
                'parentid': 'parentid'
            }, options.keymap);

            options.rootID = options.rootID === undefined ? '0' : options.rootID;

            var data = options.dataFormat = Tree.parse(options);
            el['$$levelselect'] = 1;

            return ReactDOM.render(React.createElement(LevelSelect, options), options.element);
        },

        //显示select级联菜单
        treeSelect: function treeSelect(options) {
            options.keymap = $.extend({
                'id': 'id',
                'name': 'name',
                'parentid': 'parentid'
            }, options.keymap);

            options.rootID === undefined ? '0' : options.rootID;

            var data = options.data;
            if (typeof data == 'string') {
                options.async = true;
            } else {
                options.dataFormat = Tree.parse(data);
            }

            var LinkSelect = Tree.LinkTree;
            return ReactDOM.render(React.createElement(LinkSelect, options), options.element);
        }
    },
    getDefaultProps: function getDefaultProps() {
        return { level: 0, allowSelect: true, allowToggle: true };
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (!nextProps.level) {
            var options = this.rootInit(nextProps);
            //this.setState(options)
        } else {
                //this.setState(nextProps)
            }
    },
    rootInit: function rootInit(props) {
        var options = Object.assign({}, props);
        options.keymap = Object.assign(_keymap, options.keymap);

        options.rootID = options.rootID === undefined ? '0' : options.rootID;

        var level = options.level || 0;

        if (typeof options.data == 'string') {
            options.async = true;
            options.dataFormat = {
                databyid: {},
                databylevel: []
            };
            options.source = options.data;
            options.data = [];
        } else {
            var data = Tree.parse(options);
            var children = data.databylevel[level];
            options.data = children;
            options.dataFormat = data;
        }
        return options;
    },
    getInitialState: function getInitialState() {
        var options = Object.assign({}, this.props);
        if (!options.level) {
            options = this.rootInit(options);
        }
        return options;
    },
    componentWillMount: function componentWillMount() {
        var _this = this;

        //添加事件
        this.toggleEvent = utils.addEventQueue.call(this, 'onToggle');
        this.changeEvent = utils.addEventQueue.call(this, 'onChange');
        if (!this.state.level) {
            this.pullEvent = utils.addEventQueue.call(this, 'onPull');
            this.fetchEvent = utils.addEventQueue.call(this, 'onFetch');
            this.fetchCompleteEvent = utils.addEventQueue.call(this, 'onFetchComplete');
            this.checkEvent = utils.addEventQueue.call(this, 'onChecked');
        }
        //这里还处于外部render过程 外部还未完成 添加事件动作
        setTimeout(function () {
            _this.getData(null, null, 0);
        }, 1);
    },
    componentDidMount: function componentDidMount() {
        var _state = this.state,
            level = _state.level,
            dataFormat = _state.dataFormat,
            defaultNode = _state.defaultNode;

        defaultNode = dataFormat && dataFormat.databyid[defaultNode];
        if (!level && defaultNode) {
            this.select(defaultNode);
        }
    },
    toggle: function toggle(node, event) {
        //阻止事件冒泡到select事件
        if (event && event.stopPropagation) {
            event.stopPropagation();
        } else if (window.event) {
            window.event.cancelBubble = true;
        }
        if (!this.props.allowToggle) {
            return;
        }
        node.open = !node.open;
        var rootScope = this.props.rootScope || this;
        var KEY_ID = this.state.keymap.id;
        if (node.open) {
            if (rootScope.state.async) {
                this.getData(node, this.state.level + 1, 1);
            } else {
                node.complete = true;
            }
        }
        this.setState({ change: !this.state.change });
        event && this.toggleEvent.complete(node, event);

        //event.preventDefault()
    },

    //选中节点
    select: function select(node, event) {
        var _this2 = this;

        if (!node || !this.props.allowSelect) {
            return;
        }

        event && this.changeEvent.complete(node, event);

        if (event && event.isDefaultPrevented()) {
            //调用preventDefault阻止选中
            return;
        }
        var _node = this.state.node;
        if (_node) {
            //取消上个选中节点的select状态
            delete _node.select;
        }
        //打开所有父节点
        this.getParents(node).reverse().forEach(function (parent) {
            !parent.open && _this2.toggle(parent);
        });
        // if( !node.select ){
        //     var allnodes = this.state.dataFormat.databyid
        //     for( var i in allnodes ){
        //         allnodes[i].select = null
        //     }
        // }
        node.select = true;
        this.setState({ node: node });
        return this;
    },

    //获取所有父节点
    getParents: function getParents(node) {
        var parents = [];
        var _state2 = this.state,
            keymap = _state2.keymap,
            dataFormat = _state2.dataFormat;

        var KEY_ID = keymap.id;
        var id = node[KEY_ID];
        var allnodes = dataFormat.databyid;
        if (!allnodes[id]) {
            return parents;
        }
        var KEY_PID = keymap.parentid;
        var parentNode = allnodes[node[KEY_PID]];
        while (parentNode) {
            parents.push(parentNode);
            parentNode = allnodes[parentNode[KEY_PID]];
        }
        return parents;
    },

    //获取所有子节点
    getChildren: function getChildren(node) {
        var _this3 = this;

        var children = node.children || [];
        var _state3 = this.state,
            keymap = _state3.keymap,
            dataFormat = _state3.dataFormat;

        var KEY_ID = keymap.id;
        var id = node[KEY_ID];
        var allnodes = dataFormat.databyid;
        if (!allnodes[id]) {
            return children;
        }
        children.forEach(function (item) {
            children = children.concat(_this3.getChildren(item));
        });
        return children;
    },

    //设置节点显示状态
    setNodeDisplay: function setNodeDisplay(node, display) {
        if (!node) {
            return;
        }
        node.display = display;

        if (display) {
            //需要检测其父级是否为显示状态
            var KEY_PID = this.props.keymap.parentid;
            var allnodes = this.props.dataFormat.databyid;
            var parentNode = allnodes[node[KEY_PID]];
            while (parentNode) {
                parentNode.display = display;
                parentNode.open = 1;
                parentNode = allnodes[parentNode[KEY_PID]];
            }
        }
        this.setState({ change: !this.state.change });
    },
    getData: function getData(parentNode, level, from) {
        var _this4 = this;

        var rootScope = this.props.rootScope || this;
        if (!rootScope.state.async) {
            return;
        }
        // console.log(parentNode, level,from)
        level = level || 0;

        var parentid = rootScope.state.rootID;
        var KEY_ID = rootScope.state.keymap.id;
        var KEY_PID = rootScope.state.keymap.parentid;

        var databyid = rootScope.state.dataFormat.databyid;
        parentNode = parentNode || this.state.parentNode;

        if (parentNode) {
            if (parentNode.complete) {
                return;
            }
            parentNode.pending = true;
            parentid = parentNode[KEY_ID];
        }

        var source = rootScope.state.source;
        var promise = $.getJSON(source + parentid);

        promise = rootScope.fetchEvent.complete(promise, parentid, level) || promise;

        promise.then(function (json) {
            var data = json || [];
            //this.state.data[level] = json.data
            data = data.filter(function (node) {
                if (!node[KEY_PID] || String(node[KEY_PID]) == parentid) {
                    //筛选parentid正确的节点
                    databyid[node[KEY_ID]] = node;
                    node[KEY_PID] = parentid; //返回的数据可能没有指定pid 
                    return true;
                }
            });

            rootScope.pullEvent.complete(_this4, data); //暂时保留
            rootScope.fetchCompleteEvent.complete(data, parentid, level, _this4);

            if (parentNode) {
                parentNode.pending = null;
                parentNode.children = data;
                parentNode.complete = true;
                _this4.setState({ change: !_this4.state.change });
            } else {
                _this4.setState({ data: data });
            }
        });
    },
    checkHandle: function checkHandle(item, e) {
        item.checked = e.target.checked;
        this.checkEvent.complete(item, e);
        this.forceUpdate();
    },

    //获取所有已选的ids
    getChecked: function getChecked() {
        var dataFormat = this.state.dataFormat;

        var allnodes = dataFormat.databyid;
        var checked = [];
        for (var i in allnodes) {
            allnodes[i].checked && checked.push(i);
        }
        return checked;
    },
    render: function render() {
        var _this5 = this;

        var _state4 = this.state,
            data = _state4.data,
            level = _state4.level,
            parentNode = _state4.parentNode,
            keymap = _state4.keymap;

        var visible = !parentNode || parentNode.open ? ' d_show' : ' d_hide';
        var rootScope = this.props.rootScope || this;
        var _rootScope$state = rootScope.state,
            async = _rootScope$state.async,
            node = _rootScope$state.node,
            textClick = _rootScope$state.textClick,
            allowSelect = _rootScope$state.allowSelect,
            checkbox = _rootScope$state.checkbox;


        return data ? React.createElement(
            'ul',
            { className: 'level' + level + visible },
            (
            //对于父节点没有打开的暂时不渲染其子节点
            !parentNode || parentNode.open || parentNode.complete) && data.map(function (item, i) {
                if (item.display === false) {
                    //隐藏节点
                    return;
                }
                var children = item.children = item.children || [];

                if (!children) {
                    //return
                }
                var holder = [];
                for (var j = 0; j < level; j++) {
                    holder.push(j);
                }
                var nodeClass = ['item'];
                var childOptions = {
                    keymap: keymap, level: level
                };
                var nochild;

                if (children.length || async) {
                    Object.assign(childOptions, _this5.props, { level: level + 1, parentNode: item, rootScope: rootScope });
                    childOptions.data = children;
                }
                if (async) {
                    if (item.complete && !children.length) {
                        nochild = true;
                    } else if (!item.complete && item.open && !item.pending) {
                        //初次需要打开的节点
                        window.setTimeout(function () {
                            _this5.getData(item, _this5.state.level + 1, 2);
                        }, 10);
                    }
                } else if (!children.length) {
                    nochild = true;
                }
                nochild && nodeClass.push('no-child');

                item.pending && nodeClass.push('pending');
                item.open && nodeClass.push('open');
                node && item.select && nodeClass.push('selected');

                //节点显示名称可以通过函数自定义
                var nodeName = item[keymap.name];
                var defineName = rootScope.props.defineName;
                if (typeof defineName == 'function') {
                    nodeName = defineName.call(rootScope, item);
                }

                // console.log(this.level,children,children.length,parentNode)

                var KEY_ID = keymap.id;
                // var className = utils.joinClass('level'+level+'-item', i==data.length-1 && 'last-item')

                i == data.length - 1 && nodeClass.push('last-item');

                var itemOptions = {
                    key: i,
                    'data-id': item[KEY_ID],
                    className: utils.joinClass('level' + level + '-item', 'has-children')
                };
                if (rootScope.props.style == 'menu' && !nochild) {
                    //下拉菜单 添加hover 展示子菜单
                    itemOptions.onMouseEnter = function (e) {
                        item.open = false;
                        _this5.toggle.call(_this5, item, e);
                    };
                    itemOptions.onMouseLeave = function (e) {
                        item.open = true;
                        _this5.toggle.call(_this5, item, e);
                    };
                }
                return React.createElement(
                    'li',
                    itemOptions,
                    React.createElement(allowSelect ? Mui : 'span', {
                        onClick: function onClick(e) {
                            rootScope.select.call(rootScope, item, e);
                            !nochild && textClick && this.toggle.call(this, item, e);
                        },

                        className: nodeClass.join(' ')
                    }, rootScope.props.style != 'menu' && holder.map(function (h, j) {
                        return React.createElement('span', { key: j, className: '_line' + (j + 1 >= level ? ' _line_begin _line' + (j - level + 1) : '') });
                    }), rootScope.props.style != 'menu' && React.createElement('span', { className: '_icon', onClick: !nochild && _this5.toggle.bind(_this5, item) }), checkbox ? React.createElement(
                        'span',
                        { className: '_checkbox' },
                        React.createElement('input', { type: 'checkbox',
                            name: checkbox.name,
                            checked: !!item.checked,
                            onChange: rootScope.checkHandle.bind(rootScope, item),
                            value: item[KEY_ID],
                            disabled: item.disabled })
                    ) : null, typeof nodeName == 'string' ? React.createElement('span', { className: '_text', dangerouslySetInnerHTML: { __html: nodeName } }) : React.createElement(
                        'span',
                        { className: '_text' },
                        nodeName
                    ), rootScope.props.style == 'menu' && !nochild && React.createElement('i', { className: 'nj-icon nj-icon-right' })),
                    children.length ? React.createElement(Tree, childOptions) : null
                );
            })
        ) : null;
    }
});

var _keymap = {
    'id': 'id',
    'name': 'name',
    'parentid': 'parentid'
};

//显示一个层级select菜单
var LevelSelect = React.createClass({
    displayName: 'LevelSelect',
    getInitialState: function getInitialState() {
        var options = Object.assign({}, this.props);
        options.keymap = $.extend({
            'id': 'id',
            'name': 'name',
            'parentid': 'parentid'
        }, options.keymap);

        options.rootID = options.rootID === undefined ? '0' : options.rootID;
        options.dataFormat = Tree.parse(options);

        return options;
    },
    handleChange: function handleChange(e) {
        var node = this.state.dataFormat.databyid[e.target.value];
        this.setState({ value: e.target.value });
        this.changeEvent.complete(node, e);
    },
    componentWillMount: function componentWillMount() {
        this.changeEvent = nj.utils.addEventQueue.call(this, 'onChange');
    },
    render: function render() {
        var keymap = this.state.keymap;

        var levels = this.state.dataFormat.databylevel;
        var items = [];
        var KEY_ID = keymap.id;
        var KEY_NAME = keymap.name;

        function getlines(level) {
            var line = '';
            while (--level >= 0) {
                line += '--';
            }
            return line;
        }

        var key = 0;
        var maxlevel = this.props.maxlevel;
        maxlevel = typeof maxlevel == 'function' ? maxlevel.call(this) : maxlevel;

        function getItems(nodes) {
            if (!nodes || !nodes.length) {
                return;
            }
            var level = nodes[0].level;
            if (maxlevel && level >= maxlevel) {
                return;
            }
            nodes.forEach(function (node, j) {
                items.push(React.createElement(
                    'option',
                    { value: node[KEY_ID], disabled: node.disabled, key: ++key },
                    getlines(node.level) + node[KEY_NAME]
                ));
                getItems(node.children);
            });
        }
        var _props = this.props,
            rootNode = _props.rootNode,
            size = _props.size,
            name = _props.name,
            className = _props.className,
            value = _props.value;

        rootNode = rootNode === false ? false : true;

        rootNode && items.push(React.createElement(
            'option',
            { value: this.state.rootID, key: ++key, className: 'root-node', style: { color: '#999' } },
            '----根节点----'
        ));
        getItems(levels[0]);

        return React.createElement(
            'select',
            {
                size: size,
                name: name,
                className: className,
                onChange: this.handleChange,
                defaultValue: value },
            items
        );
    }
});

Tree.SelectTree = LevelSelect;

//select级联菜单
Tree.LinkTree = React.createClass({
    displayName: 'LinkTree',

    statics: {
        cache: {}
    },
    getDefaultProps: function getDefaultProps() {
        return {
            selected: [],
            listRows: 7,
            type: 'select',
            trigger: 'click'
        };
    },
    initState: function initState(props) {
        var _this6 = this;

        var options = Object.assign({
            ids: []
        }, props || this.props);
        options.keymap = $.extend({
            'id': 'id',
            'name': 'name',
            'parentid': 'parentid'
        }, options.keymap);

        options.rootID = options.rootID === undefined ? '0' : options.rootID;
        options.style = options.type.indexOf('list') == 0 ? 'list' : 'select';

        var data = options.data;
        if (typeof data == 'string') {
            options.async = true;
            options.dataFormat = {
                databyid: {},
                databylevel: []
            };
            options.cache = {}; //缓存远程数据
        } else {
            options.dataFormat = Tree.parse(options);
        }

        //this.state.menuData: Array 存放输入状态下每级的数据列表 
        var data = [];
        if (!options.async) {
            var levels = options.dataFormat.databylevel;
            data.push(levels[0]);
        }
        options.menuData = data;
        window.setTimeout(function () {
            _this6.select(options.selected.filter(function (p) {
                return p;
            }));
        }, 1);

        return options;
    },
    getInitialState: function getInitialState() {
        return this.initState();
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        (nextProps.data !== this.props.data || nextProps.selected !== this.props.selected) && this.setState(this.initState(nextProps));
    },
    componentWillMount: function componentWillMount() {
        var _this7 = this;

        this.changeEvent = nj.utils.addEventQueue.call(this, 'onChange');
        this.fetchEvent = nj.utils.addEventQueue.call(this, 'onFetch');
        this.fetchCompleteEvent = nj.utils.addEventQueue.call(this, 'onFetchComplete');

        setTimeout(function (e) {
            _this7.state.async ? _this7.getData() : _this7.getListSize();
        }, 1);
    },
    componentDidMount: function componentDidMount() {
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
    getListSize: function getListSize() {
        var _state5 = this.state,
            listHeight = _state5.listHeight,
            style = _state5.style;

        if (style == 'list' && !listHeight) {
            var list = this.refs['select-0'];
            if (list) {
                var item = list.firstChild;
                this.setState({ listHeight: item.offsetHeight });
            }
        }
    },
    getData: function getData(parentid, level) {
        var _this8 = this;

        var _state6 = this.state,
            menuData = _state6.menuData,
            async = _state6.async,
            keymap = _state6.keymap;

        if (!async) {
            return;
        }
        level = level || 0;

        var KEY_ID = keymap.id;
        var KEY_PID = keymap.parentid;
        parentid = parentid || this.state.rootID;

        var next = function next(data) {
            menuData[level] = [].concat(data);
            _this8.setState({ menuData: menuData }, _this8.getListSize);
        };
        var cache = this.constructor.cache;

        var source = this.props.data + parentid;
        var cacheData = cache[source];
        var databyid = this.state.dataFormat.databyid;

        if (cacheData) {
            cacheData.forEach(function (node) {
                databyid[node[KEY_ID]] = node;
            });
            next(cacheData);
            return;
        }
        var promise = $.getJSON(source);
        promise = this.fetchEvent.complete(promise, parentid) || promise;

        promise.then(function (json) {
            var data = json || [];
            data = data.filter(function (node) {
                if (!node[KEY_PID] || String(node[KEY_PID]) == parentid) {
                    databyid[node[KEY_ID]] = node;
                    return true;
                }
            });
            _this8.fetchCompleteEvent.complete(data);

            cache[source] = data;
            next(data);
        });
    },

    //选中节点 selected 选中的节点id
    select: function select(selected, update) {
        this.resetData(0);
        // console.log(selected)
        update = update === false ? false : true;
        this.state.ids = selected && selected.length ? selected : [];
        selected = selected || [];
        if (!selected.length) {}
        selected = selected.map(function (id) {
            return { id: id };
        });
        // console.log(selected,this.state.ids)
        this.state.selected = selected;
        update && this.setState({ selected: selected, ids: this.state.ids });
    },

    //清空数据
    resetData: function resetData(fromLevel) {
        var _this9 = this;

        this.state.menuData.forEach(function (data, i) {
            if (i > fromLevel) {
                //选择空值时 清空所有下级
                data.length = 0;
                _this9.state.selected[i] = {};
                _this9.setState({ menuData: _this9.state.menuData });
            }
        });
    },
    handleChange: function handleChange(parentid, level, e) {
        var maxlevel = this.props.maxlevel;

        var select = this.refs['select-' + level];

        var maxlevel = parseInt(maxlevel);
        var _state7 = this.state,
            selected = _state7.selected,
            style = _state7.style;


        this.resetData(level);

        if (!select) {
            return;
        }

        var _state8 = this.state,
            menuData = _state8.menuData,
            dataFormat = _state8.dataFormat,
            async = _state8.async,
            keymap = _state8.keymap;

        // var parentid = select.value

        selected[level] = parentid != undefined && dataFormat.databyid[parentid] ? {
            id: parentid,
            name: dataFormat.databyid[parentid][keymap.name]
            // style=='select' ? 
            //     nj.utils.selectedOptions(select).text :
            //     e.target.innerText
        } : {};

        if (!maxlevel || level + 1 < maxlevel) {
            if (async) {
                parentid != undefined && this.getData(parentid, level + 1);
            } else {
                var parentNode = dataFormat.databyid[parentid];
                var data = parentNode ? [].concat(parentNode.children) : [];
                menuData[level + 1] = data;
                this.setState({ menuData: menuData });
            }
        } else {
            this.setState({ selected: selected });
        }
        var node = dataFormat.databyid[parentid];

        this.changeEvent.complete(node, level, e);

        // this.props.onChange && this.props.onChange.call(this,parentid,level,e)
    },
    render: function render() {
        var _this10 = this;

        var _state9 = this.state,
            keymap = _state9.keymap,
            ids = _state9.ids,
            menuData = _state9.menuData,
            selected = _state9.selected,
            style = _state9.style,
            listHeight = _state9.listHeight;

        var KEY_ID = keymap.id;
        var KEY_NAME = keymap.name;
        var _props2 = this.props,
            maxlevel = _props2.maxlevel,
            type = _props2.type,
            listRows = _props2.listRows,
            _props2$infos = _props2.infos,
            infos = _props2$infos === undefined ? [] : _props2$infos,
            trigger = _props2.trigger;

        var listCols = maxlevel || 3;
        //infos = infos || []//附加信息 如name

        var className = nj.utils.joinClass('nj-tree-select clearfix', type == 'list-ios' && 'nj-tree-select-ios');
        return React.createElement(
            'div',
            { className: className },
            menuData.map(function (level, i) {
                if (maxlevel && i + 1 > maxlevel) {
                    return;
                }
                if (!level || !level.length) {
                    return;
                }
                var id = ids[i]; //默认选中节点

                var info = infos[i] || {};
                var valid;

                var el = level && level.length ? React.createElement(
                    'span',
                    { key: i, className: style + '-item', style: type == 'list-ios' ? { width: 100 / listCols + '%' } : {} },
                    style == 'list' ? React.createElement(
                        'div',
                        { className: 'inner' },
                        React.createElement(
                            'ul',
                            { ref: 'select-' + i,
                                className: info.className,
                                style: type == 'list-ios' ? { padding: listHeight * (listRows - 1) / 2 + 'px 0' } : {}
                            },
                            level.map(function (item, j) {
                                var _itemOptions;

                                if (id && item[KEY_ID] == id) {
                                    //检测被设置的默认选中id是否有效
                                    valid = true;
                                }
                                var itemOptions = (_itemOptions = {
                                    key: item[KEY_ID],
                                    className: selected[i] && selected[i].id == item[KEY_ID] ? 'active' : ''
                                }, _defineProperty(_itemOptions, trigger == 'click' ? 'onClick' : 'onMouseOver', function (e) {
                                    return type == 'list' && _this10.handleChange(item[KEY_ID], i, e);
                                }), _defineProperty(_itemOptions, 'value', item[KEY_ID]), _itemOptions);
                                return React.createElement(
                                    'li',
                                    itemOptions,
                                    item[KEY_NAME],
                                    item.children.length ? React.createElement('i', { className: 'nj-icon nj-icon-right' }) : null
                                );
                            })
                        )
                    ) : React.createElement(
                        'select',
                        _extends({}, info, {
                            ref: 'select-' + i,
                            value: id || selected[i] && selected[i].id,
                            onChange: function onChange(e) {
                                return _this10.handleChange(e.target.value, i, e);
                            }
                        }),
                        React.createElement(
                            'option',
                            { value: '' },
                            '请选择'
                        ),
                        level.map(function (item, i) {
                            if (id && item[KEY_ID] == id) {
                                //检测被设置的默认选中id是否有效
                                valid = true;
                            }
                            return React.createElement(
                                'option',
                                { key: item[KEY_ID], value: item[KEY_ID] },
                                item[KEY_NAME]
                            );
                        })
                    )
                ) : null;

                var _el = el && el.props.children;
                // console.log(el)

                if (id && _el) {
                    ids[i] = null; //选中后清空 防止重复
                    valid && setTimeout(function () {
                        _this10.handleChange(id, i);
                        // _el.props.onChange()
                    }, 1);
                }
                return el;
            })
        );
    }
});

//无限级下拉菜单
Tree.MenuTree = function (props) {
    var target = props.target,
        trigger = props.trigger,
        data = props.data;

    var pop = Popover.create({
        trigger: trigger,
        nearby: target,
        name: 'nj-menu',
        template: React.createElement(
            'div',
            { className: 'nj-tree nj-menu-tree' },
            React.createElement(Tree, _extends({}, props, {
                style: 'menu'
            }))
        )
    });
    pop.onHide(function () {
        data.forEach(function (n) {
            n.open = false;
        });
    });
    return pop;
};
Tree._MenuTree = React.createClass({
    displayName: '_MenuTree',
    getInitialState: function getInitialState() {
        var options = Object.assign({
            keymap: {
                'id': 'id',
                'name': 'name',
                'parentid': 'parentid'
            },
            rootID: '0'
        }, this.props);
        var dataFormat = Tree.parse(options);
        return { pops: [], dataFormat: dataFormat, options: options, selected: [] };
    },
    componentDidMount: function componentDidMount() {
        var _props3 = this.props,
            target = _props3.target,
            trigger = _props3.trigger;
        var _state10 = this.state,
            pops = _state10.pops,
            dataFormat = _state10.dataFormat;


        pops[0] = Popover.create({
            trigger: trigger,
            nearby: target,
            name: 'nj-menu nj-menu-0',
            template: this.renderMenu(dataFormat.databylevel[0], 0)
        });
        this.bindPop(pops[0], 0);
    },
    createPop: function createPop(level) {
        var _this11 = this;

        var trigger = this.props.trigger;
        var _state11 = this.state,
            pops = _state11.pops,
            dataFormat = _state11.dataFormat;


        var parentPop = pops[level - 1];
        var pop = pops[level] = Popover.create({
            trigger: trigger,
            name: 'nj-menu nj-menu-' + level,
            position: { left: 100, top: 0 },
            nearby: $(parentPop.wrap).find('li.has-children')
            // delegate : ['li.has-children', parentPop.wrap]            
        }).onShow(function () {
            var parentid = $(pop.state.nearby).data('id');
            var parentNode = dataFormat.databyid[parentid];
            var template = _this11.renderMenu(parentNode.children, level);
            pop.setState({ template: template });
        });
        pop.parentPop = parentPop;
        this.bindPop(pop, level);
    },
    bindPop: function bindPop(pop, level) {
        var _this12 = this;

        var pops = this.state.pops;

        var parentPop = pop.parentPop;
        pop.onShow(function () {
            _this12.createPop(level + 1);
            // pops[level+1].setState({nearby:$(pop.wrap).find('li.has-children')})

            $(pop.wrap).on('mouseenter.relation', function (e) {
                clearTimeout(pop.delayhide);
                if (!parentPop) return;
                parentPop.keepVisible = true;
                //stop hide parents
                pops.forEach(function (p, i) {
                    i < level && clearTimeout(p.delayhide);
                });
            }).on('mouseleave.relation', function (e) {
                //hide self
                pop.delayhide = setTimeout(function () {
                    pop.keepVisible = null;
                    pop.setDisplay(false);
                }, 40);
                //hide parents
                if (!parentPop) return;
                pops.forEach(function (p, i) {
                    if (i < level) {
                        p.delayhide = setTimeout(function () {
                            p.keepVisible = null;
                            p.setDisplay(false);
                        }, 40);
                    }
                });
            });
        });
    },
    renderMenu: function renderMenu(data, level) {
        var _this13 = this;

        var onChange = this.props.onChange;
        var _state12 = this.state,
            keymap = _state12.options.keymap,
            dataFormat = _state12.dataFormat,
            selected = _state12.selected,
            pops = _state12.pops;

        var KEY_ID = keymap.id;
        var KEY_PID = keymap.parentid;
        var KEY_NAME = keymap.name;
        return React.createElement(
            'ul',
            null,
            data.map(function (item) {
                var id = item[KEY_ID];
                var n = item.children.length;
                return React.createElement(
                    'li',
                    {
                        key: id,
                        'data-id': id,
                        className: utils.joinClass(n && 'has-children', selected[level] === item && 'active'),
                        onClick: function onClick(e) {
                            selected = selected.slice(0, level + 1); //清空level所有下级
                            selected[level] = item;
                            _this13.setState({ selected: selected }, function () {
                                pops[level].setState({ template: _this13.renderMenu(data, level) });
                            });
                            onChange && onChange(item, level);
                        }
                    },
                    item[KEY_NAME],
                    n ? React.createElement('i', { className: 'nj-icon nj-icon-right' }) : null
                );
            })
        );
    },
    render: function render() {
        return null;
    }
});
//json or array
Tree.JsonTree = React.createClass({
    displayName: 'JsonTree',
    getDefaultProps: function getDefaultProps() {
        return { data: [] };
    },
    getId: function getId() {
        return Math.random().toString(16).substring(2);
    },
    parseData: function parseData(data, parentid, parentkey) {
        parentid = parentid || 0;
        parentkey = parentkey || '';
        var type = $.type(data);
        var arr = [];
        var id = this.getId();

        if (type == 'object' || type == 'array') {
            var name;
            if (type == 'object') {
                name = 'Object {}';
                if (data.nodeType) {
                    name = 'HTMLElement';
                }
            } else {
                name = 'Array [' + data.length + ']';
            }
            if (parentkey) {
                name = '<i class="key">' + parentkey + '</i>: ' + name;
            }
            arr.push({ id: id, name: name, parentid: parentid });

            for (var i in data) {
                var val = this.parseData(data[i], id, i);
                arr = arr.concat(val);
            }
        } else {
            data = type == 'function' ? '[Function]' : String(data);
            var _data = data;
            data = '<i class="datatype ' + type + '" title="' + data + '">';
            if (type == 'string') {
                data = '"' + data + _data.substring(0, 46) + (_data.length > 46 ? '...' : '') + '"';
            } else {
                data += _data;
            }
            data += '</i>';
            arr.push({ id: id, name: '<i class="key">' + parentkey + '</i>: ' + data, parentid: parentid });
        }
        return arr;
    },
    render: function render() {
        var options = Object.assign({
            allowSelect: false,
            textClick: true
        }, this.props);
        options.data = this.parseData(options.data);
        return React.createElement(Tree, options);
    }
});

module.exports = Tree;