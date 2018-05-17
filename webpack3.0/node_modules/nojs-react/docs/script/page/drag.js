import $ from 'jquery'
import {React, render, utils, ReactDOM} from 'nj'
import drag from 'nj/drag'

export default class Drag extends React.Component {
    componentDidMount () {
        let self = this
        let el = $(ReactDOM.findDOMNode(this))
        let {onDragDown, onDragMove, onDragUp} = this.props

        this.holder = el.clone()
        this.drag = new drag(el, null, {
            wrap : $('div.page-side')
        })

        let x
        let y
        this.drag.onDragDown = function(e){
            let offset = el.offset()
            el.css({
                'position':'absolute',
                'top' : offset.top,
                'left' : offset.left,
                // 'width' : el.width(),
                // 'height' : el.height()
            })
            .addClass('drag_target').after(self.holder)
            onDragDown && onDragDown.call(this, self.props)

            //计算鼠标点击初始位置相对于el的百分比 来重新定位内部layer位置 保证layer落地时位置不发生偏移
            el.find('.layer').css({
                top : (e.clientY - offset.top)*100/el.innerHeight()+'%',
                left : (e.clientX - offset.left)*100/el.innerWidth()+'%'
            })

            x = e.clientX;//鼠标位置
            y = e.clientY;
        }
        
        this.drag.MoveEvent = function(pos, e){
            // console.log(pos, e.clientX, e.clientY)
            x = e.clientX;//鼠标位置
            y = e.clientY;
            onDragMove && onDragMove.call(this, x, y, self.props)
        }

        this.drag.UpEvent = function(e){
            self.holder.remove();
            el.removeClass('drag_target').removeAttr('style')
            onDragUp && onDragUp.call(this, x, y, self.props)
        }
    }
    componentWillReceiveProps (nextProps) {
        //console.log(nextProps)
    }
    render () {
        return this.props.children
    }
}