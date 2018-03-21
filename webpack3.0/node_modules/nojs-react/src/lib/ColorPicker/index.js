/**
 * 取色器
 * 2017-12-15
 */
import $ from 'jquery'
import {React, render, ReactDOM} from '../nojs-react'
import Popover from '../popover'
import Color from './color'
import {dealColor} from './utils'
import '../../../css/color.css'

export default class ColorPicker extends React.Component {
    constructor (props) {
        super(props)
        let data = Object.assign({}, this.props)
        data.color = dealColor(data.color)
        this.state = {
            data
        }
    }
    componentDidMount () {
        let {visible, children, onChange, onSubmit} = this.props
        this.pop = Popover.create({
            trigger : 'click',
            effect : 'normal',
            nearby : $(ReactDOM.findDOMNode(this)),
                
        }).onShow(()=>{
            let template = <Color 
                data={this.state.data}
                onChange={data=>{
                    this.setState({data})
                    onChange && onChange(data)
                }} 
                onSubmit={data=>{
                    this.setState({data})
                    this.pop.setDisplay(false)
                    onSubmit && onSubmit(data)
                }} 
                onCancel={data=>this.pop.setDisplay(false)}
            />
            this.pop.setState({template})

        }).onHide(()=>{
            this.pop.setState({template:null})
        })
    }    
    render () {
        let {children} = this.props
        let {data} = this.state
        if( !children ){
            return <span className="color-picker">
                <span className={data.color?'inner':'transparent'} style={{backgroundColor:'#'+data.color}}></span>
            </span>
        }
        return children
    }
}