'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nojsReact = require('../nojs-react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _quill = require('quill');

var _quill2 = _interopRequireDefault(_quill);

require('quill/dist/quill.snow.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Quill编辑器
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * docs:https://quilljs.com/docs/api/
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Component = _nojsReact.React.Component,
    isValidElement = _nojsReact.React.isValidElement;

var Editor = function (_Component) {
    _inherits(Editor, _Component);

    function Editor(props) {
        _classCallCheck(this, Editor);

        var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

        _this.state = {
            id: 'nj-editor-' + +new Date()
        };
        _this.handleChange = _this.handleChange.bind(_this);
        _this.editor = null;
        return _this;
    }

    _createClass(Editor, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _props = this.props,
                theme = _props.theme,
                value = _props.value,
                placeholder = _props.placeholder;

            var editor = this.editor = new _quill2.default(this.refs.editor, {
                modules: { toolbar: '#' + this.state.id },
                placeholder: placeholder,
                // debug: 'info',
                // readOnly,
                theme: theme
            });
            value && editor.clipboard.dangerouslyPasteHTML(value);
            editor.on('text-change', this.handleChange);

            // setTimeout(e=>{
            //     editor.setSelection(0, 5);
            //     var range = editor.getSelection();
            //     console.log(range)
            //     // editor.insertEmbed(range.index, 'image', 'http://quilljs.com/images/cloud.png');
            // }, 2000)
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.value !== this.value) {
                if (this.state.action) {
                    //这里可能诱发Input组件死循环 限制非手动修改时才触发更新
                    this.state.action = null;
                } else {
                    this.editor.clipboard.dangerouslyPasteHTML(nextProps.value);
                }
            }
            if (nextProps.readOnly !== this.props.readOnly) {
                this.editor.enable(!nextProps.readOnly);
            }
        }
    }, {
        key: 'insertContent',
        value: function insertContent(str, type) {
            var range = editor.getSelection();
        }
    }, {
        key: 'handleChange',
        value: function handleChange(e) {
            var _this2 = this;

            this.state.action = 'input'; //标记手动输入
            setTimeout(function (e) {
                _this2.state.action = null;
            }, 1);
            // let text = this.editor.getText()//this.editor.root.innerText.replace(/^[\s\t]+|[\s\t]+$/g, '')
            this.value = this.editor.root.innerHTML;
            var onChange = this.props.onChange;

            onChange && onChange(this.value, this.editor.root.innerText);
        }
    }, {
        key: 'renderToolbar',
        value: function renderToolbar(toolbar, index) {
            var _this3 = this;

            if (typeof toolbar === 'string') {
                return _nojsReact.React.createElement('button', { key: toolbar, title: toolbar, className: 'ql-' + toolbar });
            }

            if (Array.isArray(toolbar)) {
                return _nojsReact.React.createElement(
                    'span',
                    { key: index },
                    toolbar.map(function (child, i) {
                        return _this3.renderToolbar(child, i);
                    })
                );
            }

            if (isValidElement(toolbar)) return toolbar;

            if ((typeof toolbar === 'undefined' ? 'undefined' : _typeof(toolbar)) === 'object') {
                var key = Object.keys(toolbar)[0];
                var value = toolbar[key];

                if (Array.isArray(value)) {
                    return _nojsReact.React.createElement(
                        'select',
                        { key: key + '-' + index, value: false, className: 'ql-' + key },
                        value.map(function (v, i) {
                            return _nojsReact.React.createElement('option', { key: i, value: v !== false ? v : undefined });
                        })
                    );
                } else {
                    return _nojsReact.React.createElement('button', { key: key + '-' + index, className: 'ql-' + key, value: value });
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props,
                className = _props2.className,
                toolbar = _props2.toolbar,
                height = _props2.height;
            var id = this.state.id;


            return _nojsReact.React.createElement(
                'div',
                { className: _nojsReact.utils.joinClass('nj-editor', className) },
                _nojsReact.React.createElement(
                    'div',
                    { id: '' + id },
                    this.renderToolbar(toolbar)
                ),
                _nojsReact.React.createElement('div', { ref: 'editor', style: { height: height } })
            );
        }
    }]);

    return Editor;
}(Component);

module.exports = Editor;

Editor.propTypes = {
    height: _propTypes2.default.number,
    onChange: _propTypes2.default.func,
    placeholder: _propTypes2.default.string,
    readOnly: _propTypes2.default.bool,
    style: _propTypes2.default.object,
    theme: _propTypes2.default.string,
    toolbar: _propTypes2.default.array,
    value: _propTypes2.default.string
};

Editor.defaultProps = {
    height: 200,
    theme: 'snow',
    toolbar: [['bold', 'italic', 'underline', 'strike'], ['blockquote'], //, 'code-block'
    [{ 'header': 1 }, { 'header': 2 }], [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    // [{ 'script': 'sub'}, { 'script': 'super' }],
    // [{ 'indent': '-1'}, { 'indent': '+1' }],
    // [{ 'direction': 'rtl' }],
    // [{ 'size': ['small', false, 'large', 'huge'] }],
    // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['video'], [{ 'size': ['0.26rem', '0.31rem', '0.37rem', '0.41rem', '0.47rem', '0.52rem'] }], [{ 'color': [] }, { 'background': [] }],
    // [{ 'font': [] }],
    [{ 'align': [] }], ['link']]
};

Editor.childContextTypes = {
    getEditor: _propTypes2.default.func,
    Quill: _propTypes2.default.func
};