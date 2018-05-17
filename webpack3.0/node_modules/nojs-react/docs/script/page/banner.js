import $ from 'jquery'
import {React, render, ReactDOM, utils} from 'nj'
import drag from 'nj/drag'
import Popover from 'nj/popover'
import PropsForm from './props' 

export default class Banner extends React.Component {
    constructor (props) {
        super(props)
        let {layers=[]} = this.props
        this.state = {
            layers
        }
    }
    componentDidMount () {
        let {root} = this.props
        //点击空白 blur
        root.canvas.el.click(e=>{
            if( !$(e.target).closest('.layer').length ){
                this.setState({focus:null})
            }            
        })

        $(document).keydown(e=>{
            let {keyCode} = e
            let {layers, focus} = this.state
            
            //delete layer
            if( keyCode==46 && focus ){
                let index = layers.indexOf(focus)
                layers.splice(index, 1)
                console.log(keyCode, index)
                this.setState({layers, focus:null})
            }
        })

        //创建一个共享属性面板层
        this.propsPanel = Popover.create({
            trigger : 'click',
            effect : 'normal',
            delegate : ['div.layer', root.canvas.areas],
            position : {left:80,top:'-100'}
        })
        .onShow(()=>{
            let {focus} = this.state
            render(
                <PropsForm data={this.state.focus} onChange={data=>{
                    Object.assign(this.state.focus, data)
                    this.forceUpdate()
                }}/>, 
                this.propsPanel.wrap.childNodes[0]
            )
        })
    }  
    //分配一个唯一的key  
    getKey () {
        return (+new Date)+'_'+parseInt(Math.random()*100000)
    }
    push (layer) {
        let {layers} = this.state
        layer.key = this.getKey()
        layers.push(layer)
        this.setState({layers, focus:layer}, ()=>this.refs.focus.click())
    }
    setFocus (layer, e) {
        this.setState({focus:layer})
    }
    componentDidUpdate (prevProps, prevState) {
        let {editor} = this.refs
        if( editor && prevState.editor!=this.state.editor ){
            editor.focus()
            selectText(editor)
        }
    }
    componentDidUpdate (prevProps, prevState) {
        //其他操作失去焦点后隐藏属性面板
        !this.state.focus && this.propsPanel.setDisplay(false)
    }
    render () {
        let {layers, focus, editor} = this.state
        let {root} = this.props
        return <div>
            {layers.map(ly=>
                <Drag key={ly.key} limit={root.canvas.el} 
                    onDragDown={this.setFocus.bind(this, ly)}
                    MoveEvent={pos=>{
                        ly.x = pos.left
                        ly.y = pos.top
                    }}
                >
                    <div 
                        onDoubleClick={e=>this.setState({editor:ly})} 
                        className={'layer'+(focus===ly?' drag-focus':'')} 
                        style={Object.assign({top:ly.y, left:ly.x}, ly.style)}
                        ref={focus==ly?'focus':'layer'}
                    > 
                        <div className="inner" dangerouslySetInnerHTML={{__html:ly.html}}></div>
                    </div>
                </Drag>
            )}
            {editor ? 
                <div className="layer-mask" style={Object.assign({top:editor.y, left:editor.x}, editor.style)}>
                    <div className="inner" contentEditable="true" ref="editor" 
                        onBlur={()=>{
                            let $editor = $(this.refs.editor)
                            let height = $editor.height()
                            //同步内容高度变化
                            editor.style.height = height
                            //height变化时 .inner top:-50%样式 也会使top位置变化
                            let changetop = height/2 - $editor.parent().height()/2
                            //中和top变化
                            editor.y += changetop
                            this.setState({editor:null})
                        }} 
                        onKeyUp={e=>{
                            editor.html = e.target.innerHTML
                        }} 
                        dangerouslySetInnerHTML={{__html:editor.html}}
                    ></div>
                </div>
                : null
            }
        </div>
    }
}

class Drag extends React.Component {
    componentDidMount () {
        let el = $(ReactDOM.findDOMNode(this))        
        let options = Object.assign({
            // overflow : this.getSize()
        }, this.props)
        this.drag = new drag(el, el.children(), options)
    }
    getSize () {
        let el = $(ReactDOM.findDOMNode(this))
        let w = el.width()
        let h = el.height()
        return {x:-w/2, y:-h/2, width:w/2, height:h/2}
    }
    componentWillReceiveProps (nextProps) {
        // this.drag.overflow = this.getSize()
    }
    render(){
        return this.props.children
    }
}


//side区域拖拽模块选项
export const getBannerOptions = _this=>{
    let area
    let canvas_top
    let canvas_left
    let side_x
    let {root} = _this.props

    return {
        onDragDown (props) {                
            let {el, areas} = root.canvas
            let {top, left} = el.offset()
            canvas_top = top
            canvas_left = left
            area = areas.filter('[data-dragarea="'+props.target+'"]')
            side_x = $(ReactDOM.findDOMNode(_this)).offset().left 
        },
        onDragMove : (x, y)=>{
            let {el, areas} = root.canvas
            root.canvas.target = null
            areas.removeClass('drag-active')

            let top = area.offset().top
            let height = area.outerHeight()

            //x方向只要在画布区域即可
            let left = canvas_left
            let width = el.outerWidth()

            if( x>left && x<(left+width) && y>top && y<(top+height) && x<side_x ){
                root.canvas.target = area.addClass('drag-active')
            }
        },
        onDragUp : function(x, y, props){
            let {el, target, areas} = root.canvas
            areas.removeClass('drag-active')
            if( target ){                    
                //计算出相对画布的位置
                let top = y - canvas_top
                let left = x - canvas_left                   
                let {module:{style}} = props

                let item = Object.assign({
                    x : left-style.width/2,
                    y : top-style.height/2
                }, props.module)
                root.state.data[props.target].layers.push(item)
            }
            root.canvas.target = null
        }
    }
}

//选中文本
function selectText(element) {
    var text = element.innerText
    if (document.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
        /*if(selection.setBaseAndExtent){
            selection.setBaseAndExtent(element, 0, element, 1);
        }*/
    } else {
        // alert("none");
    }
}

//设置光标位置 只适合inputElement
function setCaretPosition(ctrl, pos){
    if(ctrl.setSelectionRange){
        console.log(1, pos)
        ctrl.focus();
        ctrl.setSelectionRange(pos, pos);
    }else if (ctrl.createTextRange) {
        console.log(2, pos)
        var range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }else{
        console.log(ctrl, ctrl.innerText, pos)
    }
}