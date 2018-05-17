/**
 * 属性面板
 */
import $ from 'jquery'
import {React, render, ReactDOM, utils} from 'nj'
import {Form, Input} from 'nj/form'
import ColorPicker from 'nj/ColorPicker'

export default class PropsForm extends React.Component {
    constructor (props) {
        super(props)
        this.state = {}
    }
    changeHandle (key, value, field) {
        let {data} = this.props
        let newdata = {[key]:value}
        data = Object.assign({}, data)

        if( field ){
            Object.assign(data[field], newdata)
        }else{
            Object.assign(data, newdata)
        }
        
        this.props.onChange(data)
    }
    render () {
        let {x, y, style:{width, height, color, fontSize}} = this.props.data

        return <div className="props-panel">
            <h6>属性：</h6>
            <ul className="nj-form">
                <li className="item clearfix">
                    <span className="lab">x:</span>
                    <div className="fields">
                        <input type="number" value={x} onChange={e=>this.changeHandle('x', parseInt(e.target.value))} className="text"/>px
                    </div>
                </li>
                <li className="item clearfix">
                    <span className="lab">y:</span>
                    <div className="fields">
                        <input type="number" value={y} onChange={e=>this.changeHandle('y', parseInt(e.target.value))} className="text"/>px
                    </div>
                </li>
                <li className="item clearfix">
                    <span className="lab">宽度:</span>
                    <div className="fields">
                        <input type="number" value={width} onChange={e=>this.changeHandle('width', parseInt(e.target.value), 'style')} className="text"/>
                    </div>
                </li>
                <li className="item clearfix">
                    <span className="lab">高度:</span>
                    <div className="fields">
                        <input type="number" value={height} onChange={e=>this.changeHandle('height', parseInt(e.target.value), 'style')} className="text"/>
                    </div>
                </li>
                <li className="item clearfix">
                    <span className="lab">颜色:</span>
                    <div className="fields">
                        <ColorPicker color={color} onChange={data=>this.changeHandle('color', '#'+data.color, 'style')} className="text"/>
                    </div>
                </li>
                <li className="item clearfix">
                    <span className="lab">字号:</span>
                    <div className="fields">
                        <input type="number" value={fontSize} onChange={e=>this.changeHandle('fontSize', parseInt(e.target.value), 'style')} className="text"/>
                    </div>
                </li>
            </ul>
        </div>
    }
}