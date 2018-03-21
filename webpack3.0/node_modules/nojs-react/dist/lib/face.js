'use strict';

/**
 * 表情选择器
 */

var $ = require('jquery');

var _require = require('./'),
    React = _require.React,
    render = _require.render,
    utils = _require.utils,
    ReactDOM = _require.ReactDOM;

var Popover = require('./popover');

var _require2 = require('./switch'),
    Switch = _require2.Switch,
    SwitchMenu = _require2.SwitchMenu,
    SwitchItem = _require2.SwitchItem;

var Emoji = require('./emoji');

var Face = React.createClass({
    displayName: 'Face',

    statics: {
        create: function create(options) {
            var _options = options,
                insert = _options.insert;

            options = Object.assign(options, {
                name: 'nj-face-pop',
                trigger: 'click'
            });
            var pop = Popover.create(options).onShow(function () {
                var _this = this;

                options.popover = this;
                options.insert = utils.dom(insert);
                this.setState({ template: React.createElement(Face, options) }, function () {
                    _this.align.set();
                });
            });
            pop.insertEvent = utils.addEventQueue.call(pop, 'onInsert');
            return pop;
        },


        //提取表情,不传默认为当前表情插入对象val
        //replaceImage 将图片替换为符号 否则默认替换符号为图片
        replaceFace: function replaceFace(con, faces, replaceImage) {
            // var {insert} = this.props
            // if(!con){
            //     var con = this.insert.val();
            // }
            var T = this,
                _con;
            faces = this._config.themeItems; //|| this.state.faces;

            if (replaceImage) {
                _con = $('<div></div>').html(con);
            }

            for (var i in faces) {
                var v = faces[i];
                var faceArray = v.item,
                    N,
                    pic,
                    item;

                for (var j in faceArray) {
                    item = faceArray[j];
                    N = i + '_' + item;

                    if (con.indexOf("[:" + N + "]") != -1) {
                        pic = '<img src="' + v.url + j + v.fix + '" alt="' + item + '" class="nj_face_image" title="' + item + '" />';
                        con = con.replace(eval("/\\[:" + N.replace("(", "\\(").replace(")", "\\)") + "\\]/g"), pic);
                    } else if (replaceImage) {
                        _con.find('img.nj_face_image').each(function () {
                            $(this).replaceWith('<span>[:' + N + ']</span>');
                        });
                    }
                }
            }
            return replaceImage ? _con.text() : con;
        },
        config: function config(options) {
            return $.extend(true, this._config, options);
        },

        _config: {
            themeItems: { //表情主题配置http://cache.soso.com/img/img/e200.gif
                "default": {
                    name: '默认表情',
                    url: '/',
                    item: { '0': '微笑', '1': '撇嘴', '2': '色', '3': '发呆', '4': '得意', '5': '流泪', '6': '害羞', '7': '闭嘴', '8': '睡', '9': '大哭', '10': '尴尬',
                        '11': '发怒', '12': '调皮', '13': '龇牙', '14': '惊讶', '15': '难过', '16': '酷', '17': '冷汗', '18': '抓狂', '19': '吐', '20': '偷笑', '21': '可爱',
                        '22': '白眼', '23': '傲慢', '24': '饥饿', '25': '困', '26': '惊恐', '27': '流汗', '28': '憨笑', '29': '大兵', '30': '奋斗', '31': '咒骂', '32': '疑问',
                        '33': '嘘', '34': '晕', '35': '折磨', '36': '衰', '37': '骷髅', '38': '敲打', '39': '再见', '40': '擦汗', '41': '抠鼻', '42': '鼓掌', '43': '糗大了',
                        '44': '坏笑', '45': '左哼哼', '46': '右哼哼', '47': '哈欠', '48': '鄙视', '49': '委屈', '50': '快哭了', '51': '阴险', '52': '亲亲', '53': '吓', '54': '可怜'
                    },
                    fix: ".gif"
                }
            }
        }
    },
    getDefaultProps: function getDefaultProps() {
        return {};
    },
    getInitialState: function getInitialState() {
        // var pop = this.props.popover
        // pop.face = this
        var state = Object.assign({
            faces: [],
            themes: ['default']
        }, this.constructor._config);
        state.themes = [].concat(state.themes);

        var i = state.themes.indexOf('emoji');
        if (i > -1) {
            state.themes.splice(i, 1);
            state.hasEmoji = true;
        }

        var themes = state.themes,
            themeItems = state.themeItems,
            faces = state.faces;

        themes.forEach(function (f) {
            var item = themeItems[f];
            if (item) {
                item.id = f;
                faces.push(item);
            }
        });
        state.faces = faces;
        // this.setState({init:true, faces})        
        return state;
    },
    componentDidMount: function componentDidMount() {
        var _this2 = this;

        var _state = this.state,
            faces = _state.faces,
            hasEmoji = _state.hasEmoji;
        var _refs = this.refs,
            tab = _refs.tab,
            emojiTab = _refs.emojiTab;


        if (!hasEmoji) {
            return;
        }
        emojiTab.state.listinit = {};
        emojiTab.onChange(function (i) {
            _this2.loadEmoji(i);
        });

        if (faces.length) {
            tab.onChange(function (i) {
                //tab个数为faces.length+1
                i == faces.length && _this2.loadEmoji(0);
            });
        } else {
            this.loadEmoji(0);
        }
    },
    loadEmoji: function loadEmoji(i) {
        var _this3 = this;

        var emojiTab = this.refs.emojiTab;

        if (emojiTab.state.listinit[i]) return;
        var base = Emoji.base,
            data = Emoji.data,
            fix = Emoji.fix;

        var item = data[i];
        var el = $(ReactDOM.findDOMNode(emojiTab)).find('.nj-switch-item')[i];
        var List = function List(e) {
            return React.createElement(
                'ul',
                { className: 'pack clearfix' },
                item.items.map(function (img, j) {
                    return React.createElement(
                        'li',
                        { key: img.key + img.value + j, onClick: _this3.insertTo.bind(_this3, img.value, 'emoji'), title: img.title },
                        img.value
                    );
                })
            );
        };
        render(React.createElement(List, null), el);
        emojiTab.state.listinit[i] = true;
    },
    insertTo: function insertTo(text, type) {
        var _props = this.props,
            insert = _props.insert,
            popover = _props.popover;

        //将表情插入到光标处

        var C = new insertOnCursor(insert);
        C.insertAtCaret(text);
        insert.focus();

        var tab = this.refs.tab;
        var data = {
            theme: this.state.themes[tab.state.index],
            text: text,
            content: Face.replaceFace(text)
        };
        var Input = insert[0].$handle; //是否为Input表单组件
        if (Input) {
            //setState方法为异步 所以不使用 直接同步赋值
            Input.state.value = insert.val();
        }
        popover.setDisplay(false);
        popover.insertEvent.complete(data);
    },
    render: function render() {
        var _this4 = this;

        var _state2 = this.state,
            faces = _state2.faces,
            hasEmoji = _state2.hasEmoji;
        var base = Emoji.base,
            data = Emoji.data,
            fix = Emoji.fix;

        return React.createElement(
            Switch,
            { ref: 'tab', className: 'tab' },
            React.createElement(
                'ul',
                { className: 'nj-switch-menus clearfix' },
                faces.map(function (item, i) {
                    return React.createElement(
                        SwitchMenu,
                        { key: i },
                        React.createElement(
                            'span',
                            null,
                            item.name
                        )
                    );
                }),
                hasEmoji ? React.createElement(
                    SwitchMenu,
                    null,
                    'Emoji'
                ) : null
            ),
            React.createElement(
                'div',
                { className: 'face-wrap' },
                faces.map(function (item, i) {
                    return React.createElement(
                        SwitchItem,
                        { key: i },
                        React.createElement(
                            'ul',
                            { className: 'pack clearfix face-' + item.id },
                            function () {
                                var imgs = [],
                                    pack = item.item;
                                for (var j in pack) {
                                    imgs.push(React.createElement(
                                        'li',
                                        { key: j, onClick: _this4.insertTo.bind(_this4, '[:' + item.id + '_' + pack[j] + ']') },
                                        React.createElement('img', { src: item.url + j + item.fix, title: pack[j] })
                                    ));
                                }
                                return imgs;
                            }()
                        )
                    );
                })
            ),
            hasEmoji ? React.createElement(
                SwitchItem,
                null,
                React.createElement(
                    Switch,
                    { className: 'emoji-tab clearfix font-emoji', ref: 'emojiTab' },
                    React.createElement(
                        'ul',
                        { className: '_menu clearfix' },
                        data.map(function (item) {
                            return React.createElement(
                                'li',
                                { key: 't' + item.name },
                                React.createElement(
                                    SwitchMenu,
                                    null,
                                    item.name
                                )
                            );
                        })
                    ),
                    React.createElement(
                        'div',
                        { className: '_body' },
                        data.map(function (item) {
                            return React.createElement(SwitchItem, { key: item.name });
                        })
                    )
                )
            ) : null
        );
    }
});

/*
 * 在光标处插入内容
 * @obj:支持光标插入的对象
 */
function insertOnCursor(obj) {
    if (!obj || !obj.length) {
        return;
    }
    this.textBox = obj;
    this.setCaret();
}
insertOnCursor.prototype = {
    //初始化对象以支持光标处插入内容       
    setCaret: function setCaret() {
        if (!document.selection) {
            return;
        }
        var T = this;
        T.textBox.on('click select keyup', function () {
            T.textBox[0].caretPos = document.selection.createRange().duplicate();
        });
    },
    //在当前对象光标处插入指定的内容  
    insertAtCaret: function insertAtCaret(text) {
        if (!this.textBox || !this.textBox.length) {
            return;
        }
        var textObj = this.textBox[0];

        if (document.all && textObj.createTextRange && textObj.caretPos) {
            var caretPos = textObj.caretPos;
            caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == '' ? text + '' : text;
        } else if (textObj.setSelectionRange) {
            var rangeStart = textObj.selectionStart;
            var rangeEnd = textObj.selectionEnd;
            var tempStr1 = textObj.value.substring(0, rangeStart);
            var tempStr2 = textObj.value.substring(rangeEnd);
            textObj.value = tempStr1 + text + tempStr2;
            var len = text.length;
            textObj.setSelectionRange(rangeStart + len, rangeStart + len);
        } else {
            textObj.value += text;
        }
    },
    //清除当前选择内容
    unselectContents: function unselectContents() {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
    },
    //选中内容  
    selectContents: function selectContents() {
        this.textBox.each(function (i) {
            var node = this;
            var selection, range, doc, win;
            if ((doc = node.ownerDocument) && (win = doc.defaultView) && typeof win.getSelection != 'undefined' && typeof doc.createRange != 'undefined' && (selection = window.getSelection()) && typeof selection.removeAllRanges != 'undefined') {
                range = doc.createRange();
                range.selectNode(node);
                if (i == 0) {
                    selection.removeAllRanges();
                }
                selection.addRange(range);
            } else if (document.body && typeof document.body.createTextRange != 'undefined' && (range = document.body.createTextRange())) {
                range.moveToElementText(node);
                range.select();
            }
        });
    }
};

Face.insertOnCursor = insertOnCursor;

module.exports = Face;