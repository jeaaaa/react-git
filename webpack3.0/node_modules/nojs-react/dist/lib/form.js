'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /*
                                                                                                                                                                                                                                                                   * form 表单验证
                                                                                                                                                                                                                                                                   */


require('../../css/form.css');

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _nojsReact = require('./nojs-react');

var _nojsReact2 = _interopRequireDefault(_nojsReact);

var _directiveComponent = require('../mixins/directiveComponent');

var _directiveComponent2 = _interopRequireDefault(_directiveComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var formDirectives = {};

var getRules = function getRules(props) {
    var attrs = props || this.props;
    var type = attrs.type;
    var rules = [];

    if (formRules[type]) {
        //type="email"
        rules.push({
            key: 'type',
            name: type,
            target: attrs.type,
            fn: formRules[type]
        });
    }

    for (var i in attrs) {
        var name = i.replace(/^nj-/, '');
        var rule = formRules[i] || formRules[name];
        if (attrs[i] === false) continue; //required={false}
        if (rule) {
            //有效规则
            if (formRules[i]) {
                name = i;
            }
            rules[i == 'required' ? 'unshift' : 'push']({
                key: i,
                name: name,
                target: attrs[i],
                fn: rule
            });
        }
    }

    if (type == 'input-group' && attrs['nj-minlength'] || attrs['required']) {
        rules.required = true;
    }

    return rules;
};

var formMixin = {
    //在组件外部手动更新验证状态 如异步场景
    setValid: function setValid(valid, nextState) {
        var _this = this;

        this.setState(Object.assign(nextState || {}, { valid: valid, status: valid ? 'ok' : 'error' }));
        this.verifyEvent.complete(valid);

        //若这里修改了errortext 会影响其他rule 通过延时清空的方法可解决(不能用setState)
        nextState && nextState.errortext && setTimeout(function (e) {
            _this.state.errortext = '';
        });
    }
};

//验证当前组件的所有子组件的状态
var verifyChildComponents = function verifyChildComponents(real) {
    var valid = true;
    this.state.childComponents.forEach(function (item) {
        if (item.verify) {
            var _valid = item.verify(real, true);
            if (!_valid) {
                // console.log(1, item.props.name, item.state.status)
                valid = _valid;
            }
        }
    });
    this.setState({ valid: valid });
    return valid;
};

//验证单个组件
var verifyField = function verifyField(real, fromParent) {
    var textField;

    var _state = this.state,
        validing = _state.validing,
        status = _state.status,
        value = _state.value,
        _value = _state._value,
        dirty = _state.dirty,
        isEditor = _state.isEditor;

    var el = (0, _jquery2.default)(_nojsReact.ReactDOM.findDOMNode(this));
    var type = this.props.type;

    var visible = el.is(':visible') || type == 'hidden'; //隐藏的元素不验证

    if (!visible) {
        this.setState({ status: null, valid: true });
        return true;
    }

    value = isEditor ? this.state.text : value;

    //status存在表示用户未再次手动更改 value和_value不等表示从外部修改了value值（相等就是value没变）
    if (validing || status && value === _value && dirty) {
        // console.log(2,this.props.name, this.state.validing , this.state.status, this.state.valid)
        return this.state.valid;
    }

    real = real === false ? false : real || true;
    this.state.validing = true;

    //status有值用来保存状态 不重复验证 输入后清除状态 重新验证
    // this.state.status = null
    this.state.status = 'ok';

    var valid = true;
    var rules = this.state.rules;

    for (var i = 0, n = rules.length; i < n; i++) {
        var rule = rules[i];
        valid = !visible ? true : rule.fn.call(this, value, rule.target);
        // console.log(3,valid,this.props.name, visible)
        if (!valid || valid == 'pending') {
            this.state.novalid = rule;
            this.state.novalidName = rule.name;
            // console.log(this.props.name)            
            break;
        }
    }

    if (!rules.required && !value && value !== 0) {
        //非必填项
        valid = true;
    }

    //'input-group' 验证子项是否全部通过
    if (valid && type == 'input-group') {
        valid = this.state.valid_all;
    }

    // console.log(valid,this.refs.input, this.state.value, this.state.status)
    var isFetching = valid == 'pending';
    this.state.status = isFetching ? 'pending' : valid ? 'ok' : 'error';
    this.state.valid = valid = isFetching ? false : valid;

    //input-group类 子组件输入时 需要更新父组件状态
    var parentComponent = this.state.parentComponent;
    if (parentComponent && !fromParent) {
        //父组件是form时 有个特殊情况：更新form或导致所有子组件全部更新 为了减少干扰 引入real参数
        //real为false时 只验证其状态 不更新ui
        parentComponent.verify(parentComponent.props.type == 'form' ? false : true);
    }
    this.state.validing = null;
    this.state._value = value; //记录此次验证时的value
    // fromParent && console.log(real,valid)
    real && this.setState({ valid: valid });
    return valid;
};

var Form = formDirectives['form'] = _nojsReact.React.createClass({
    mixins: [_nojsReact.mixins.childComponents.config],
    getDefaultProps: function getDefaultProps() {
        return { type: 'form', showicon: 'error', noValidate: true };
    },
    handleSubmit: function handleSubmit(e) {
        var _this2 = this;

        e = e || window.event;
        this.state.action = 'submit';
        window.setTimeout(function () {
            _this2.state.action = null;
        }, 1);
        this.submitBeforeEvent.complete(e);
        if (e.isDefaultPrevented()) {
            return;
        }

        var valid = this.verify();

        if (!valid) {
            //未通过 阻止提交
            e.preventDefault();
            return;
        }
        // if( this.props.ajaxsubmit ){
        //     var method = this.props.method.toLowerCase()
        //     var formEl = this.refs.wrap
        //     $.ajax({
        //         url : formEl.action,
        //         type : method,
        //         data : $(formEl).serialize(),
        //         dataType : 'json',
        //         success (json) {

        //         }
        //     })
        //     e.preventDefault()
        // }
        this.submitEvent.complete(e);
    },
    submit: function submit(options) {
        //从外部触发submit动作
        var el = this.refs.wrap;
        _nojsReact2.default.utils.fireEvent('submit', el);
        //表单提交是异步的 所以下面return不是正确的valid
        return this.state.valid;
    },
    reset: function reset() {
        this.state.childComponents.forEach(function (item) {
            item.setState({ value: item.state.defaultValue, status: null, dirty: null });
        });
    },
    componentDidMount: function componentDidMount() {
        directive.getChildComponents(this);
        // console.log(this.state.childComponents) 

        this.submitBeforeEvent = _nojsReact2.default.utils.addEventQueue.call(this, 'onSubmitBefore');
        this.submitEvent = _nojsReact2.default.utils.addEventQueue.call(this, 'onSubmit');
        this.verifyEvent = _nojsReact2.default.utils.addEventQueue.call(this, 'onVerify');

        this.state.verifyCode = Form.verifyCode((0, _jquery2.default)(this.refs.wrap).find('#verify_img')[0], (0, _jquery2.default)(this.refs.wrap).find('#verify_refresh')[0]);

        var parentComponent = this.props.parentComponent; //form表单所处的父组件

        if (parentComponent) {
            //将表单状态同步到外部
            this.onVerify(function (valid) {
                parentComponent.setState({ valid: valid });
            });
        }
        createdEvents.complete(this);
        this.refs.wrap.$handle = this;
    },
    verify: function verify(real) {
        var valid = verifyChildComponents.call(this, real);
        this.verifyEvent.complete(valid);
        return valid;
    },
    render: function render() {
        return _nojsReact.React.createElement(
            'form',
            _extends({}, this.props, { ref: 'wrap',
                onSubmit: this.handleSubmit }),
            this.props.children
        );
    }
});

formDirectives['input-group'] = _nojsReact.React.createClass({
    mixins: [_nojsReact.mixins.childComponents.setParents([formDirectives['form']])],
    getInitialState: function getInitialState() {
        return {
            valid: true,
            dirty: false,
            rules: getRules.call(this)
        };
    },
    getDefaultProps: function getDefaultProps(a) {
        return { type: 'input-group', showicon: 'error' };
    },
    componentDidMount: function componentDidMount() {
        _nojsReact.mixins.childComponents.getParentComponent.call(this);
        directive.getChildComponents(this);
    },
    verify: function verify(real, fromParent) {
        if (this.state.validing) {
            return this.state.valid;
        }
        var valid; //= verifyChildComponents.call(this)
        //取出选中的checkbox
        var checked = [];
        var hasnovalid;
        this.state.childComponents.forEach(function (item) {
            var ischeck = /checkbox|radio/.test(item.props.type);
            var _valid = ischeck ? item.refs.input.checked : item.state.valid && item.state.value;

            // console.log(!item.state.value, ',' , item.state.valid, ',' , item.refs.input)
            if (_valid) {
                checked.push(item);
            } else if (!item.state.valid) {
                hasnovalid = true;
            }
        });
        //this.state.status = null
        //子项是否全部验证通过[隐形规则]
        //当chekced满足了个数验证时 其中有非必填项输入了错误的值时 通过该属性检测group整体状态
        this.state.valid_all = !hasnovalid;

        // console.log(checked, this.state.valid_all)
        this.state.value = checked.length ? checked : null; //没选中时 兼顾required
        var valid = verifyField.call(this, real, fromParent);
        return valid;
    },
    render: function render() {
        return _nojsReact.React.createElement(
            'span',
            null,
            _nojsReact.React.createElement(
                'span',
                { className: 'nj-input-group', ref: 'wrap' },
                this.props.children
            ),
            _nojsReact.React.createElement(VerifyStatus, { field: this })
        );
    }
});

formDirectives['input'] = _nojsReact.React.createClass({
    //React.addons.LinkedStateMixin
    mixins: [formMixin, _nojsReact.mixins.childComponents.setParents([formDirectives['input-group'], formDirectives['form']])],
    getInitialState: function getInitialState() {
        var _props = this.props,
            type = _props.type,
            defaultValue = _props.defaultValue,
            value = _props.value,
            html = _props.html;

        var isEditor = type == 'editor';
        defaultValue = defaultValue || value || html || '';
        return {
            isEditor: isEditor,
            dirty: false,
            valid: true,
            rules: getRules.call(this),
            value: defaultValue,
            defaultValue: defaultValue
        };
    },
    getDefaultProps: function getDefaultProps() {
        return { type: 'text', trigger: 'keyup' };
    },
    verify: function verify(real, fromParent) {
        if (this.state.validing || /ok|pending/.test(this.state.status) && this.state.valid) {
            return this.state.valid;
        }

        //更新input-group
        var parentComponent = this.state.parentComponent;
        if (parentComponent) {
            parentComponent.setState({ dirty: true });
        }

        var valid = verifyField.call(this, real, fromParent);

        this.verifyEvent.complete(valid);
        if (!valid && this.state.status != 'pending' && parentComponent && parentComponent.state.action == 'submit') {
            this.refs.input.focus();
            if (this.props.type == 'hidden') {
                (0, _jquery2.default)(window).scrollTop((0, _jquery2.default)(this.refs.input).parent().offset().top - 90);
            }
        }
        return valid;
    },
    componentDidMount: function componentDidMount() {
        var _this3 = this;

        var input = this.refs.input;
        var isEditor = this.state.isEditor;
        //异步载入编辑器

        isEditor && System.import('./Editor').then(function (Editor) {
            return _this3.setState({ Editor: Editor });
        });
        _nojsReact.mixins.childComponents.getParentComponent.call(this);

        // this.changeEvent = nj.utils.addEventQueue.call(this, 'onChange')
        this.verifyEvent = _nojsReact2.default.utils.addEventQueue.call(this, 'onVerify');
        this.fetchCompleteEvent = _nojsReact2.default.utils.addEventQueue.call(this, 'onFetchComplete'); //for async rule
        //对外引用组件
        input.$handle = this;
    },

    //外部value改变状态后 同步到内部value
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        //这里必须检测是否value发生变化 否则由Form组件默认添加的onVerify事件(将表单状态同步到外部) 会引发死循环
        var _value = nextProps.value;
        if (_value !== undefined && this.state.value !== _value) {
            this.state.value = nextProps.value;
            this.valueLink().requestChange();
            this.state.status = null;
        }
        this.state.rules = getRules.call(this, nextProps);
    },
    valueLink: function valueLink() {
        var _this4 = this;

        var _onChange = this.props.onChange;
        var _value = this.props.value;

        var _props2 = this.props,
            type = _props2.type,
            trigger = _props2.trigger;
        var isEditor = this.state.isEditor;


        var valueLink = this.state.valueLink = {
            value: this.state.value,
            requestChange: function requestChange(e, text) {
                var newValue;

                if (typeof e == 'string') {
                    newValue = e;
                    _this4.state.text = text.replace(/^[\s\t]+|[\s\t]+$/g, '');
                } else if (typeof e == 'boolean') {
                    newValue = e;
                } else {
                    newValue = e ? e.target.value : _this4.state.value;
                }

                var textField = textReg.test(type);
                e && _onChange && _onChange(e);

                _this4.state.value = newValue;
                _this4.state.status = null;

                // update = update===false ? false : (update||!textField)

                var parentComponent = _this4.state.parentComponent;
                if (parentComponent) {
                    parentComponent.state.status = null;
                    parentComponent.state.dirty = true;
                }
                // update && this.verify.call(this,false); 

                //使用blur类型验证的文本框 在onChange事件中就不用重复执行verify了
                trigger != 'blur' && _this4.verify(false);

                _this4.setState({
                    value: newValue,
                    dirty: true
                });
                // this.changeEvent.complete()
            }
        };
        return valueLink;
    },
    render: function render() {
        var _this5 = this;

        var attrs = this.props;
        var type = attrs.type;
        var _state2 = this.state,
            rules = _state2.rules,
            dirty = _state2.dirty,
            status = _state2.status,
            value = _state2.value,
            parentComponent = _state2.parentComponent,
            isEditor = _state2.isEditor,
            Editor = _state2.Editor;

        //触发验证的事件类型

        var trigger = {
            keyup: 'onKeyUp',
            blur: 'onBlur'
        }[this.props.trigger || parentComponent.props.trigger];

        var options = Object.assign({}, attrs, {
            ref: 'input'
        });

        options.value = this.state.value;
        options.onChange = this.valueLink().requestChange.bind(this);

        if (type == 'checkbox' || type == 'radio') {
            //options.checkedLink = this.valueLink()
            options.text = options.text || options.children;
            delete options.children;
        } else {
            var mark;
            if (rules.length && status) {
                mark = true;
                if (!rules.required && !value) {
                    mark = false;
                }
                if (!dirty && (!parentComponent || parentComponent.state.action != 'submit')) {
                    mark = false;
                }
            }

            options.className = _nojsReact2.default.utils.joinClass(this.props.className, mark && 'input-' + status);
            var _event = options[trigger];

            options[trigger] = function (e) {
                _event && _event(e); //外部添加的事件
                _this5.verify(true);
            };
        }
        var hasTextarea = isEditor || type == 'textarea';
        if (hasTextarea) {
            // console.log(1, options.value ,2, options.html , 3,options.children)
            //options.value = options.value || options.html || options.children || ''
            delete options.defaultValue;
            delete options.children;
            // console.log(options)
        }
        var editOptions = Object.assign({}, options);

        return _nojsReact.React.createElement(isEditor ? 'span' : 'label', { className: 'nj-input-' + type }, hasTextarea ? _nojsReact.React.createElement('textarea', _extends({}, options, { style: isEditor ? { display: 'none' } : undefined })) : _nojsReact.React.createElement('input', options), (type == 'checkbox' || type == 'radio') && _nojsReact.React.createElement('span', { className: '_holder' }), !hasTextarea && _nojsReact.React.createElement(
            'span',
            { className: '_c' },
            options.text
        ), Editor && _nojsReact.React.createElement(Editor, editOptions), _nojsReact.React.createElement(VerifyStatus, { field: this }));
    }
});

formDirectives['select'] = _nojsReact.React.createClass({
    mixins: [_nojsReact.mixins.childComponents.setParents([formDirectives['input-group'], formDirectives['form']])],
    getInitialState: function getInitialState() {
        var _props3 = this.props,
            defaultValue = _props3.defaultValue,
            value = _props3.value;

        defaultValue = defaultValue || value || '';
        return {
            dirty: false,
            valid: true,
            rules: getRules.call(this),
            value: defaultValue,
            defaultValue: defaultValue
        };
    },
    getDefaultProps: function getDefaultProps() {
        return {};
    },
    componentDidMount: function componentDidMount() {
        _nojsReact.mixins.childComponents.getParentComponent.call(this);
        directive.getChildComponents(this);

        this.changeEvent = _nojsReact2.default.utils.addEventQueue.call(this, 'onChange');
        this.verifyEvent = _nojsReact2.default.utils.addEventQueue.call(this, 'onVerify');
        this.refs.wrap.$handle = this;
        //同步初始select初始值到state
        this.state.value = this.refs.wrap.value;

        this.forceUpdate(); //for nj-select
    },
    verify: function verify(real, fromParent) {
        var parentComponent = this.state.parentComponent;
        if (parentComponent) {
            parentComponent.setState({ dirty: true });
        }

        var valid = verifyField.call(this, real, fromParent);
        this.verifyEvent.complete(valid);
        if (!valid && parentComponent && parentComponent.state.action == 'submit') {
            this.refs.wrap.focus();
        }
        return valid;
    },
    valueLink: function valueLink() {
        var _this6 = this;

        var _valueLink = this.props.valueLink;
        var _value = _valueLink && _valueLink.value;

        //外部valueLink改变状态后 组件内部需同步
        if (_valueLink && _value !== this.state.value && _value != undefined) {
            this.state.value = _value;

            window.setTimeout(function () {
                valueLink.requestChange(_value, true);
            }, 10);
        }

        var valueLink = this.state.valueLink = {
            value: this.state.value,
            requestChange: function requestChange(e) {
                var newValue = e.target.value;
                // console.log(this.refs.wrap.selectedOptions[0].value)
                _valueLink && _valueLink.requestChange(newValue); //合并外部双向绑定

                _this6.state.value = newValue;
                _this6.state.status = null;

                _this6.setState({
                    value: newValue,
                    dirty: true
                });

                var parentComponent = _this6.state.parentComponent;
                if (parentComponent) {
                    parentComponent.state.status = null;
                    parentComponent.state.dirty = true;
                }

                _this6.verify.call(_this6, false);
                _this6.changeEvent.complete(newValue);
            }
        };
        return valueLink;
    },
    render: function render() {
        var valueLink = this.valueLink();
        var _state3 = this.state,
            rules = _state3.rules,
            dirty = _state3.dirty,
            status = _state3.status,
            value = _state3.value,
            parentComponent = _state3.parentComponent;


        var options = Object.assign({}, this.props, {
            ref: 'wrap',
            value: valueLink.value,
            onChange: valueLink.requestChange
        });
        delete options.type;
        delete options.defaultValue;

        var mark;
        if (rules.length && status) {
            mark = true;
            if (!rules.required && !value) {
                mark = false;
            }
            if (!dirty && (!parentComponent || parentComponent.state.action != 'submit')) {
                mark = false;
            }
        }
        options.className = _nojsReact2.default.utils.joinClass(this.props.className, mark && 'input-' + status);

        //nj-select 获取的children 数组项为空的占位符
        var _props4 = this.props,
            children = _props4.children,
            _childNodes = _props4._childNodes;

        children = children && children.filter(function (item) {
            return item;
        });

        return _nojsReact.React.createElement(
            'label',
            { className: 'nj-select' },
            _nojsReact.React.createElement('select', options),
            _nojsReact.React.createElement(VerifyStatus, { field: this })
        );
    }
});

var textReg = /^(text|textarea|number|email|password)$/;

//验证状态显示
var VerifyStatus = _nojsReact.React.createClass({
    displayName: 'VerifyStatus',
    render: function render() {
        var field = this.props.field;
        var _field$state = field.state,
            parentComponent = _field$state.parentComponent,
            dirty = _field$state.dirty,
            rules = _field$state.rules,
            value = _field$state.value;

        var showmsg = rules.length;

        if (showmsg) {
            if (dirty) {
                //checkbox组合 子项不显示
                //var textField

                //if( textReg.test(field.props.type) && parentComponent && parentComponent.props.type=='input-group' ){
                //showmsg = false
                //}
            } else if (parentComponent) {
                showmsg = parentComponent.state.action == 'submit';
            }

            if (!value && !rules.required) {
                //非必填项
                showmsg = false;
            }
        }
        var _field$state2 = field.state,
            novalidName = _field$state2.novalidName,
            novalid = _field$state2.novalid,
            status = _field$state2.status,
            errortext = _field$state2.errortext,
            valid = _field$state2.valid,
            childComponents = _field$state2.childComponents;

        var novalidText = '';
        var ispending = status == 'pending';

        if (showmsg) {
            if (!valid || ispending) {
                novalidText = errortext || field.props.errortext || statusText[novalidName] || '';
            }

            var showicon = parentComponent ? parentComponent.props.showicon : field.props.showicon;
            if (showicon && showicon != 'all' && status != showicon && !ispending) {
                //ispending始终显示
                return null;
            }
            //适合'input-group'子项为text类
            var child = childComponents[0];
            if (field.props.type == 'input-group' && child && textReg.test(child.props.type)) {
                //valid_all=false: 有未通过的验证项时 状态体现在子项上 不显示group状态 
                //valid=true：已输入的全部通过 状态体现在子项上 group无需显示状态   
                if (!field.state.valid_all || valid) {
                    return null;
                }
            }
        }
        // console.log(showmsg,status,field.refs.input)
        return showmsg && status ? _nojsReact.React.createElement(
            'span',
            { className: 'nj-form-msg' },
            _nojsReact.React.createElement(
                'span',
                { className: 'nj-form-msg-' + status },
                typeof novalidText == 'function' ? novalidText.call(field, novalid) : novalidText
            )
        ) : null;
    }
});

var formRules = {
    required: function required(value) {
        return typeof value == 'number' ? true : !!value;
    },
    minlength: function minlength(value, target) {
        return value && value.length >= parseInt(target);
    },
    maxlength: function maxlength(value, target) {
        return value && value.length <= parseInt(target);
    },
    email: function email(value) {
        return (/^\w+(?:[-+.']\w+)*@\w+(?:[-.]\w+)*\.\w+(?:[-.]\w+)*$/.test(value)
        );
    },
    number: function number(value) {
        return !isNaN(value);
    },
    url: function url(value) {
        //验证输入是否是合法url地址 可以包含中文\u2E80-\u9FFF
        return (/^(?:http(?:s)?:\/\/)?([\w-]+\.)+[\w-]+(?:\/[\w\W]*)?$/.test(value.split(/[\?#]/)[0])
        );
    },
    domain: function domain(value) {
        //域名
        return (/^([\w-]+\.)+[\w-]+(?:\/[\w\W]*)?$/.test(value)
        );
    },
    mobile: function mobile(value) {
        return (/^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])[0-9]{8}$/.test(value)
        );
    },
    qq: function qq(value) {
        return (/^\s*[.0-9]{5,10}\s*$/.test(value)
        );
    },
    telephone: function telephone(value) {
        return (/^\d{2,5}?[-]?\d{5,8}([-]\d{0,1})?$/.test(value)
        );
    },
    tel400: function tel400(value) {
        return (/^(400)[-]?\d{3}[-]?\d{4}$/.test(value)
        );
    },
    idcard: function idcard(value) {
        //验证身份证号是否合法18位或17位带字母
        return (/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}(?:\d|[a-zA-Z])$/.test(value)
        );
    },

    //二次确认输入项 target为比较的name值
    confirm: function confirm(value, target) {
        var instances = formDirectives['input'].instances;
        var self = this;
        var field;
        var parentComponent = this.state.parentComponent;
        for (var i = 0, n = instances.length; i < n; i++) {
            field = instances[i].handle;
            if (field.props.name == target && field.state.parentComponent === parentComponent) {
                if (!field.state.addConfirmEvent) {
                    //当target组件被重新修改时 清空当前组件的验证状态
                    field.onVerify(function () {
                        self.state.status = null;
                        self.verify();
                        //self.setState({status:null, valid:false})
                    });
                    field.state.addConfirmEvent = true;
                }
                return value === field.state.value;
            }
        }
    }
};

var createdEvents = _nojsReact2.default.utils.addEventQueue.call(Form, 'onCreated');

//自定义规则
Form.addRule = function (name, fn, errortext) {
    //添加的修饰符checkname.async 异步方法
    // let modifiers = name.split('.').slice(1)
    // fn && modifiers.forEach(m=>{
    //     fn[m] = true
    // })
    // name = name.split('.')[0]
    formRules[name] = fn;
    if (errortext) {
        statusText[name] = errortext;
    }
};

//添加异步验证规则
Form.addAsyncRule = function (name, fn, errortext) {
    //重写fn 添加函数节流
    formRules[name] = function (value, target) {
        var _this7 = this;

        var _state4 = this.state,
            async_delay = _state4.async_delay,
            parentComponent = _state4.parentComponent;

        var action = parentComponent && parentComponent.state.action;
        window.clearTimeout(async_delay);

        this.state.async_delay = setTimeout(function (e) {
            var options = target ? eval('({' + target + '})') : {};
            var callback = _this7.fetchCompleteEvent.complete;
            options.action = action;
            fn.call(_this7, value, options, callback);
        }, 500);
        return 'pending';
    };
    if (errortext) {
        statusText[name] = errortext;
    }
};

//验证码
Form.verifyCode = function (verify, refresh) {
    verify = verify || 'verify_img';
    refresh = refresh || 'verify_refresh';
    verify = typeof verify == 'string' ? document.getElementById(verify) : verify;
    refresh = typeof refresh == 'string' ? document.getElementById(refresh) : refresh;
    if (!verify) {
        return {};
    }
    var _src = verify.src;
    verify.onclick = function () {
        var src = _src + '?t=' + +new Date();
        if (src.indexOf('?') > 0) {
            src = _src + '&t=' + +new Date();
        }
        this.src = src;
    };
    if (refresh) {
        refresh.onclick = function () {
            verify.click();
            return false;
        };
    }
    return {
        refresh: function refresh() {
            verify.click();
        }
    };
};

var statusText = {
    required: '不能为空',
    email: '邮箱格式错误',
    mobile: '手机号码格式错误',
    url: 'url格式错误',
    confirm: '2次输入不一致',
    minlength: function minlength(rule) {
        return '不能少于' + rule.target + '位';
    },
    maxlength: function maxlength(rule) {
        return '不能超过' + rule.target + '位';
    }
};

var directive = new _directiveComponent2.default({
    elementGroups: {
        'form': { children: ['input-group', 'input', 'select'], component: formDirectives['form'] },
        'input-group': { children: ['input', 'select'], component: formDirectives['input-group'] },
        'input': { component: formDirectives['input'] },
        'select': { component: formDirectives['select'] }
    },
    exports: exports
});
//当脚本在页面底部运行时 直接运行一次可以后续代码中立即获取实例
// directive.start()

/*填充表单数据*/
Form.fill = function (options) {
    options = options || {};

    var Form = (0, _jquery2.default)(options.form || document.forms[0]),
        data = options.data,
        i,
        item,
        type,
        value;

    if (!Form.length || _jquery2.default.type(data) != 'object') {
        return;
    }

    for (i in data) {
        value = data[i];
        var dataType = _jquery2.default.type(value);
        item = Form.find('[name="' + i + (dataType == 'array' ? '[]' : '') + '"]');

        if (!item.length) {
            if (!options.always) continue;
            if (dataType != 'array') {
                //当options.always为true时 已隐藏域的形式填充到表单中
                Form.append('<input name="' + i + '" type="hidden" value="' + data[i] + '" />');
            }
        }

        var handle = item[0] && item[0].$handle;
        var _item;
        type = item[0] && item[0].type;

        if (type == 'radio') {
            _item = item.filter('[value="' + value + '"]');
            _item.click();
            _item.attr('checked', true);
            _item[0] && function (handle) {
                handle && handle.setState({ value: value, status: null }, function (e) {
                    return handle.verify(false);
                });
            }(_item[0].$handle);
        } else if (type == 'checkbox' && _jquery2.default.type(value) == 'array') {
            _jquery2.default.each(value, function (i, v) {
                _item = item.filter('[value="' + v + '"]');
                // handle = _item[0].$handle
                // handle && handle.setState({value:v}, e=>handle.verify(false))
                (function (handle) {
                    handle && handle.setState({ value: v, status: null }, function (e) {
                        return handle.verify(false);
                    });
                })(_item[0].$handle);
                _item.click();
            });
        } else if (typeof value == 'string' || typeof value == 'number') {
            item.val(value);
            (function (handle) {
                handle && handle.setState({ value: value, status: null }, function (e) {
                    return handle.verify(false);
                });
            })(handle);
        } else if (dataType == 'array') {
            //填充数组
            value.forEach(function (v, j) {
                if (item[j]) {
                    item[j].value = v;
                    item[j].name = i + '[]';
                } else {
                    Form.append('<input name="' + i + '[]" type="hidden" value="' + v + '" />');
                }
            });
            //dom个数大于数组个数时 移除
            if (item.length > value.length) {
                item.slice(value.length, item.length).remove();
            }
        }
    }
};

/*
 * 格式化表单数据
 * 主要针对非form对象 
 * 本身就是form对象则直接返回form.serialize()
 */
Form.parse = function (form, dataType) {
    if (!form || !form.length) {
        return;
    }
    var _form = form.find('form'),
        $form = form[0].tagName.toLowerCase() == 'form' ? form : _form.length ? _form : null,
        data;

    dataType = dataType || 'string';

    if ($form) {
        data = $form.serialize();
    } else {
        //Form = $('<form style="display:none"></form>').appendTo(document.body);
        //clone无法拷贝select值
        //Form.append(form.clone(true));
        //data = Form.serialize();
        //Form.remove();
        var item = form.find('input,textarea,select,button'),
            i = 0,
            n = item.length,
            data = {};
        for (; i < n; i++) {
            if (item[i].name) {
                data[item[i].name] = item[i].value;
            }
        }
    }
    return data;
};

/*
 * post跨域 使用iframe实现
 */
Form.post = function (options) {
    options = options || {};
    var _form = options.form;
    var noForm = !_form;
    if (noForm) {
        _form = (0, _jquery2.default)('<form action="" method="post"></form>').appendTo(document.body)[0];
    }

    var name = 'iframe_' + +new Date(),
        iframe = (0, _jquery2.default)('<iframe src="" name="' + name + '" style="display:none"></iframe>').appendTo(document.body),
        callback = 'jsoncallback_' + +new Date();

    var data = _jquery2.default.extend(true, options.data, { jsoncallback: callback });
    Form.fill({
        form: (0, _jquery2.default)(_form),
        data: data,
        always: true
    });

    if (options.url) {
        _form.action = options.url;
    }
    _form.method = 'post';
    _form.target = name;

    window[callback] = function (json) {
        // options.complete && options.complete.call(options, json);
        options.success && options.success.call(options, json);

        try {
            delete window[callback];
        } catch (e) {
            //ie bug
            window[callback] = null;
        }

        iframe.remove();
        noForm && (0, _jquery2.default)(_form).remove();
        iframe = null;
    };
    options.beforeSend && options.beforeSend.call(options);

    //document.domain = domain.host;//此句可以在beforeSend中配置
    _form.submit();
};