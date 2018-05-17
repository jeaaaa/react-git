import $ from 'jquery'
import {React, render, ReactDOM, utils} from 'nj'
import drag from 'nj/drag'

export default class Content extends React.Component {
    constructor (props) {
        super(props)
        let {layers=[]} = this.props
        this.state = {
            layers
        }
    }
    push (layer, index) {
        let {layers} = this.state
        index>=layers.length ? layers.push(layer) : layers.splice(index, 0, layer)
        layer.id = layers.length
        this.setState({layers})
    }
    render () {
        let {layers, focus, editor} = this.state
        let {root} = this.props
        return <div>
            {layers.map((ly,i)=>
                <Drag key={ly.id} layers={layers} parent={this} index={i}>
                    <div className={'content-item'} ref={'layer-'+i}> 
                        <div className="inner">
                            <div className="ct-head">{ly.id}</div>
                            <div className="ct-body"></div>
                        </div>
                    </div>
                </Drag>
            )}
            <div className="content-item d_hide drag-holder drag-newholder" ref="holder"></div>
        </div>
    }
}


class Drag extends React.Component {
    componentDidMount () {
        let self = this
        let el = $(ReactDOM.findDOMNode(this))
        let {onDragDown, onDragMove, onDragUp, parent} = this.props
        let wrap = $('div.canvas-content')
        let index

        this.holder = el.clone().addClass('drag-holder')
        this.drag = new drag(el, null, {
            wrap,
        })

        this.drag.onDragDown = function(e){
            let offset = el.offset()
            el.css({
                'position':'absolute',
                'top' : offset.top,
                'left' : offset.left,
                'width' : el.width(),
            })
            .addClass('drag-target').after(self.holder)
            wrap.addClass('drag-active')
            onDragDown && onDragDown.call(this, self.props)   
            index = self.props.index
        }
        
        this.drag.MoveEvent = function(pos, e){
            let y = e.clientY;
            let m, Y, H; 

            let {layers} = self.props

            for( let i=0; i<layers.length+1; i++ ){
                m = $(parent.refs['layer-'+i])
                if( !m.length ){
                    continue;
                }
                //元素位置
                Y = m.offset().top;

                H = m.outerHeight(true);
               
                if( m[0] === el[0] || m[0] === self.holder[0] ){
                    continue;
                }
                if( y>Y && y<(Y+H) ){
                    if( index>i ){
                        self.holder.insertBefore(m);
                    }else{
                        self.holder.insertAfter(m);
                    }
                    let ly = layers[index]
                    layers.splice(index, 1)
                    layers.splice(i, 0, ly)
                    index = i;
                    break;
                }
            }
        }

        this.drag.UpEvent = function(e){
            self.holder.after(el)
            self.holder.remove()
            el.removeClass('drag-target').removeAttr('style')
            wrap.removeClass('drag-active')
            onDragUp && onDragUp.call(this)
            parent.forceUpdate()
        }
    }
    componentWillReceiveProps (nextProps) {
        //console.log(nextProps)
    }
    render () {
        return this.props.children
    }
}


//side区域拖拽模块选项
export const getContentOptions = _this=>{
    let area
    let canvas_top
    let canvas_left
    let side_x
    let {root} = _this.props
    let renderContent = root.state.data.content.layers
    let index

    return {
        onDragDown (props) {                
            let {el, areas} = root.canvas
            let {top, left} = el.offset()
            canvas_top = top
            canvas_left = left
            area = areas.filter('[data-dragarea="'+props.target+'"]')
            side_x = $(ReactDOM.findDOMNode(_this)).offset().left 

            renderContent = root.state.data.content.layers
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
                let holder = area.find('div.drag-newholder').show()

                //选择插入新模块的位置
                let m, Y, H; 
                let {layers} = renderContent.props

                for( let i=0; i<layers.length+1; i++ ){
                    m = $(renderContent.refs['layer-'+i])
                    
                    //元素位置
                    Y = m.offset().top;
                    H = m.outerHeight(true);
                   
                    if( y<(Y+H/2) ){
                        holder.insertBefore(m);
                        index = i
                        break
                    }else{
                        holder.insertAfter(m);
                        index = i+1
                    }
                }
            }
        },
        onDragUp : (x, y, props)=>{
            let {el, target, areas} = root.canvas
            areas.removeClass('drag-active')
            if( target ){                    
                //计算出相对画布的位置
                let top = y - canvas_top
                let left = x - canvas_left                   

                let item = Object.assign({
                    x : left,
                    y : top
                }, props.module)
                renderContent.push(item, index)
            }
            target && target.find('div.drag-newholder').hide()
            root.canvas.target = null
        }
    }
}

