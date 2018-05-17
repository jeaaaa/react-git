'use strict';

var _lib = require('../lib');

var _lib2 = _interopRequireDefault(_lib);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * html指令组件
 */
var React = _lib2.default.React,
    ReactDOM = _lib2.default.ReactDOM;

/**
 * 标记需要手动启动的组件
 * <nj-component start-id="mycomponent"></nj-component>
 * Component.startOne('mycomponent', {})
 */

var start_id = 'start-id';

var Directive = function Directive(options) {
    var _this = this;

    this.options = options || {};

    //exports 为某个或某类组件集合 对外提供的接口 
    var _options = this.options,
        exports = _options.exports,
        elementGroups = _options.elementGroups;

    //将指令对应的组件挂到exports上

    var rootComponent;
    for (var i in elementGroups) {
        var com = exports[getComponentName(i)] = elementGroups[i].component;
        if (!rootComponent) {
            //最外层的父组件
            this.rootComponent = rootComponent = com;
            this.rootDirective = i;
        }
        com.getByHandle = function (com) {
            return function (handle) {
                for (var n = com.instances.length, i = n - 1; i >= 0; i--) {
                    var item = com.instances[i].handle;
                    if (item.props.handle == handle) {
                        var target = (0, _jquery2.default)('body').find(ReactDOM.findDOMNode(item));
                        if (target.length) {
                            return item;
                        } else {
                            //组件已被移除
                            com.instances.splice(i, 1);
                            break;
                        }
                    }
                }
            };
        }(com);
    }

    rootComponent.start = this.start.bind(this);

    //手动启动
    rootComponent.startOne = function (id, props, context) {
        var node = (context || document.body).querySelector('[' + start_id + '="' + id + '"]');
        if (node) {
            node.removeAttribute(start_id);
            return _this.initial(node, _this.rootDirective, null, 0, props);
        }
    };

    //当脚本在头部运行时 则需要页面加载完成后运行一次 获取实例同样需要注意脚本所在位置
    // $(()=>window.setTimeout(e=>this.start(), 0))   
};

Directive.prototype = {
    start: function start(container) {
        return this.directiveInit(this.rootDirective, container || document.body);
    },
    directiveInit: function directiveInit(type, context, parentComponent) {
        var _this2 = this;

        var components = [];
        if (!context) {
            return components;
        }
        var formElements = _lib2.default.utils.toArray(context.getElementsByTagName('nj-' + type));
        formElements.forEach(function (node, i) {
            var c = _this2.initial(node, type, parentComponent, i);
            if (c) {
                components.push(c);
            }
        });
        return components;
    },
    initial: function initial(node, type, parentComponent, index, props) {

        var componentItem = this.options.elementGroups[type];
        var Component = componentItem.component;
        if (Component) {
            var options = parseAttrs(_lib2.default.utils.getAttributes(node));

            var noStart = options[start_id]; //需要传入复杂参数时 以手动方式启动
            if (noStart) {
                return;
            }
            var el = document.createElement('span');
            node.parentNode.insertBefore(el, node);
            node.parentNode.removeChild(node);

            Object.assign(options, props); //合并手动启动传入的参数

            options._childNodes = _lib2.default.utils.toArray(node.childNodes);
            options._componentType = type;
            options.text = options.text || node.innerText;
            options.html = options.html || node.innerHTML; //for <nj-input type="textarea">123<p>232</p></nj-input>
            options.index = options.index || index || 0;

            var componentInfo = this.options.elementGroups[type];
            var componentChildren = componentInfo.children || [];

            if (options._childNodes.length && componentItem.wrapItem) {
                options.children = [];
                //先在props.children中占位 必须是有效的元素节点
                options._children = options._childNodes.filter(function (n) {
                    if (n.nodeType == 1) {
                        var name = n.nodeName.toLowerCase().replace(/^nj-/, '');
                        componentChildren.indexOf(name) < 0 && options.children.push('');
                        return true;
                    }
                });
            }
            if (parentComponent) {
                options.parentComponent = parentComponent;
            }

            options.handle = options.handle || 'h-' + Math.round(Math.random() * 10000) + '-' + +new Date();
            // if( options.value!=undefined ){
            //     options.defaultValue = options.value
            //     delete options.value
            // }
            // options._node = el
            // if( type=='input-group' && parentComponent ){//继承form组件showicon属性
            //     options.showicon = parentComponent.props.showicon
            // }
            var instance = ReactDOM.render(React.createElement(Component, options), el);
            node.$handle = instance;
            return instance;
        }
    },

    //当前组件渲染完毕后 将dom移入组件 并且检测是否有子组件
    getChildComponents: function getChildComponents(component) {
        var _this3 = this;

        var _component$props = component.props,
            _childNodes = _component$props._childNodes,
            _componentType = _component$props._componentType,
            _children = _component$props._children;

        // console.log(_childNodes, _componentType, this.options)

        if (!_componentType) {
            //只适用于nj-html方式创建的组件
            return;
        }
        var wrap = this.options.wrap;

        if (typeof wrap == 'function') {
            wrap = wrap(component);
        } else {
            wrap = component.refs.wrap || ReactDOM.findDOMNode(component);
        }

        var _options$elementGroup = this.options.elementGroups[_componentType],
            children = _options$elementGroup.children,
            wrapItem = _options$elementGroup.wrapItem;


        var childNodes = _childNodes || []; //_children过滤了非元素节点
        (wrapItem ? _children : childNodes).forEach(function (n, i) {
            var w = wrap;
            if (typeof wrapItem == 'function') {
                w = wrapItem(component, n, i);
            }
            w && w.appendChild(n);
        });

        var components = [];

        children && children.forEach(function (type) {
            var c = _this3.directiveInit(type, ReactDOM.findDOMNode(component), component);
            components = components.concat(c);
        });
        component.state.childComponents = components;

        var instances = component.constructor.instances;
        for (var i = 0, n = instances.length; i < n; i++) {
            if (instances[i].handle === component) {
                Array.prototype.push.apply(instances[i].components, components);
                break;
            }
        }
    }
};

//<input required>将默认属性值为空的转化为required="required"
var sameAttrs = ['required', 'readOnly', 'checked', 'disabled'];
function parseAttrs(attrs) {
    for (var i in attrs) {
        if (attrs[i] === '' && sameAttrs.indexOf(i) >= 0) {
            attrs[i] = i;
        }
    }
    return attrs;
}
//nj-input => Input / nj-input-group => InputGroup
function getComponentName(name) {
    return name.replace('nj-', '').replace(/^(\w)/, function (a, b, c) {
        return b.toUpperCase();
    }).replace(/-(\w)/, function (a, b, c) {
        return b.toUpperCase();
    });
}

module.exports = Directive;