/**
 * 表情选择器
 */

var $ = require('jquery')
var {React, render, utils, ReactDOM} = require('./')
var Popover = require('./popover')
var {Switch, SwitchMenu, SwitchItem} = require('./switch')
var Emoji = require('./emoji')

var Face = React.createClass({
    statics : {
        create (options) {
            var {insert} = options
            options = Object.assign(options, {
                name : 'nj-face-pop',
                trigger : 'click'
            })
            var pop = Popover.create(options).onShow(function(){
                options.popover = this
                options.insert = utils.dom(insert)   
                this.setState({template:<Face {...options} />}, ()=>{
                    this.align.set()
                })
            })
            pop.insertEvent = utils.addEventQueue.call(pop, 'onInsert')
            return pop 
        },

        //提取表情,不传默认为当前表情插入对象val
        //replaceImage 将图片替换为符号 否则默认替换符号为图片
        replaceFace (con, faces, replaceImage) {
            // var {insert} = this.props
            // if(!con){
            //     var con = this.insert.val();
            // }
            var T = this, _con;
            faces = this._config.themeItems//|| this.state.faces;

            if( replaceImage ){
                _con = $('<div></div>').html(con);
            }
            
            for( var i in faces ){
                var v = faces[i]
                var faceArray = v.item, N, pic, item;

                for(var j in faceArray){
                    item = faceArray[j];
                    N = i+'_'+item;

                    if( con.indexOf("[:"+N+"]")!=-1 ){
                        pic = '<img src="'+v.url+j+v.fix+'" alt="'+item+'" class="nj_face_image" title="'+item+'" />';
                        con = con.replace(eval("/\\[:"+N.replace("(","\\(").replace(")","\\)")+"\\]/g"),pic);

                    }else if( replaceImage ){
                        _con.find('img.nj_face_image').each(function(){
                            $(this).replaceWith('<span>[:'+N+']</span>');
                        })
                    }
                }
            }
            return replaceImage ? _con.text() : con;
        },
        config (options) {
            return $.extend(true, this._config, options);
        },
        _config : {
            themeItems : {//表情主题配置http://cache.soso.com/img/img/e200.gif
                "default" : {
                    name : '默认表情',
                    url : '/',
                    item : {'0':'微笑','1':'撇嘴','2':'色','3':'发呆','4':'得意','5':'流泪','6':'害羞','7':'闭嘴','8':'睡','9':'大哭','10':'尴尬',
                            '11':'发怒','12':'调皮','13':'龇牙','14':'惊讶','15':'难过','16':'酷','17':'冷汗','18':'抓狂','19':'吐','20':'偷笑','21':'可爱',
                            '22':'白眼','23':'傲慢','24':'饥饿','25':'困','26':'惊恐','27':'流汗','28':'憨笑','29':'大兵','30':'奋斗','31':'咒骂','32':'疑问',
                            '33':'嘘','34':'晕','35':'折磨','36':'衰','37':'骷髅','38':'敲打','39':'再见','40':'擦汗','41':'抠鼻','42':'鼓掌','43':'糗大了',
                            '44':'坏笑','45':'左哼哼','46':'右哼哼','47':'哈欠','48':'鄙视','49':'委屈','50':'快哭了','51':'阴险','52':'亲亲','53':'吓','54':'可怜'
                    },
                    fix : ".gif"
                }
            }
        }
    },
    getDefaultProps () {
        return {}
    },
    getInitialState () {
        // var pop = this.props.popover
        // pop.face = this
        let state = Object.assign({
            faces:[], 
            themes:['default']
        }, this.constructor._config)
        state.themes = [].concat(state.themes)

        let i = state.themes.indexOf('emoji')
        if( i>-1 ){
            state.themes.splice(i, 1)
            state.hasEmoji = true
        }

        var {themes, themeItems, faces} = state
        themes.forEach((f)=>{
            var item = themeItems[f];
            if( item ){
                item.id = f;
                faces.push(item);
            }
        })
        state.faces = faces
        // this.setState({init:true, faces})        
        return state
    },
    componentDidMount () {
        let {faces, hasEmoji} = this.state
        let {tab, emojiTab} = this.refs
        
        if( !hasEmoji ){
            return
        }
        emojiTab.state.listinit = {}
        emojiTab.onChange(i=>{
            this.loadEmoji(i)
        })
        
        if( faces.length ){
            tab.onChange(i=>{
                //tab个数为faces.length+1
                i==faces.length && this.loadEmoji(0)
            })
        }else{
            this.loadEmoji(0)
        }
    },
    loadEmoji (i) {
        let {emojiTab} = this.refs
        if( emojiTab.state.listinit[i] ) return
        let {base, data, fix} = Emoji
        let item = data[i]
        let el = $(ReactDOM.findDOMNode(emojiTab)).find('.nj-switch-item')[i]
        let List = e=><ul className="pack clearfix">{item.items.map((img,j)=>
            <li key={img.key+img.value+j} onClick={this.insertTo.bind(this, img.value, 'emoji')} title={img.title}>
                {/*<img src={base+img.key+fix} title={img.title} alt={img.value}/>*/}
                {img.value}
            </li>
        )}</ul>
        render(<List />, el)
        emojiTab.state.listinit[i] = true
    },    
    insertTo (text, type) {
        let {insert, popover} = this.props
        
        //将表情插入到光标处
        let C = new insertOnCursor(insert);
        C.insertAtCaret(text);
        insert.focus();
        
        let tab = this.refs.tab
        let data = {
            theme : this.state.themes[tab.state.index],
            text : text,
            content : Face.replaceFace(text)
        };
        let Input = insert[0].$handle//是否为Input表单组件
        if( Input ){//setState方法为异步 所以不使用 直接同步赋值
            Input.state.value = insert.val() 
        }
        popover.setDisplay(false)
        popover.insertEvent.complete(data)
    },
    render () {
        let {faces,hasEmoji} = this.state
        let {base, data, fix} = Emoji
        return <Switch ref="tab" className="tab">
            <ul className="nj-switch-menus clearfix">
            {faces.map((item,i)=><SwitchMenu key={i}><span>{item.name}</span></SwitchMenu>)}
            {hasEmoji ? <SwitchMenu>Emoji</SwitchMenu> : null}
            </ul>
            <div className="face-wrap">
            {faces.map((item,i)=>{
                return <SwitchItem key={i}>
                    <ul className={'pack clearfix face-'+item.id}>
                    {(()=>{
                        let imgs = [], pack = item.item
                        for( let j in pack ){
                            imgs.push(
                                <li key={j} onClick={this.insertTo.bind(this, '[:'+item.id+'_'+pack[j]+']')}>
                                    <img src={item.url+j+item.fix} title={pack[j]} />
                                </li>
                            )
                        }
                        return imgs
                    })()}
                    </ul>
                </SwitchItem>
            })}
            </div>
            {hasEmoji ? <SwitchItem>
                <Switch className="emoji-tab clearfix font-emoji" ref="emojiTab">
                    <ul className="_menu clearfix">
                        {data.map(item=><li key={'t'+item.name}><SwitchMenu>{item.name}</SwitchMenu></li>)}
                    </ul>
                    <div className="_body">
                        {data.map(item=><SwitchItem key={item.name}></SwitchItem>)}
                    </div>
                </Switch>
            </SwitchItem>
            : null}
        </Switch>
    }
})

/*
 * 在光标处插入内容
 * @obj:支持光标插入的对象
 */
function insertOnCursor(obj){
    if(!obj||!obj.length){return;}
    this.textBox = obj;
    this.setCaret();
}
insertOnCursor.prototype = {
    //初始化对象以支持光标处插入内容       
    setCaret: function(){   
        if(!document.selection){return;} 
        var T = this;
        T.textBox.on('click select keyup',function(){
            T.textBox[0].caretPos = document.selection.createRange().duplicate();   
        }) 
    },
    //在当前对象光标处插入指定的内容  
    insertAtCaret: function(text){
        if( !this.textBox || !this.textBox.length ){
            return;
        }
        var textObj = this.textBox[0];
        
        if (document.all && textObj.createTextRange && textObj.caretPos) {
            var caretPos = textObj.caretPos;
            caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == '' ? text + '' : text;
        }else if (textObj.setSelectionRange) {
            var rangeStart = textObj.selectionStart;
            var rangeEnd = textObj.selectionEnd;
            var tempStr1 = textObj.value.substring(0, rangeStart);
            var tempStr2 = textObj.value.substring(rangeEnd);
            textObj.value = tempStr1 + text + tempStr2;
            var len = text.length;
            textObj.setSelectionRange(rangeStart + len, rangeStart + len);
        }else {
            textObj.value += text;
        }
    },
    //清除当前选择内容
    unselectContents: function(){   
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }else if (document.selection) {
            document.selection.empty();
        } 
    },
    //选中内容  
    selectContents: function(){   
        this.textBox.each(function(i){   
            var node = this;   
            var selection, range, doc, win;   
            if((doc = node.ownerDocument) && (win = doc.defaultView) &&  typeof win.getSelection != 'undefined' &&  typeof doc.createRange != 'undefined' && (selection = window.getSelection()) && typeof selection.removeAllRanges != 'undefined') {   
                range = doc.createRange();   
                range.selectNode(node);   
                if(i == 0){selection.removeAllRanges();}   
                selection.addRange(range);   
            }else if (document.body && typeof document.body.createTextRange != 'undefined' && (range = document.body.createTextRange())){   
                range.moveToElementText(node);   
                range.select();   
            }   
        });   
    }      
}

Face.insertOnCursor = insertOnCursor

module.exports = Face;    
