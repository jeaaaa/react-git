import $ from 'jquery'
import {React, render, ReactDOM} from '../nojs-react'
import {HsbToRgb, RgbToHsb, RgbToHex, HexToRgb} from './utils'

const doc = $(document)

export default class Color extends React.Component {
    constructor (props) {
        super(props)
        let {data} = this.props
        this.state = {
            hue : 'rgb(255, 0, 0)',//色相对应的颜色
            pos : {},
            data : Object.assign({
                h: 0,
                s: 0,
                b: 100,
                R: 255,
                G: 255,
                B: 255,
                color: 'ffffff'
            }, data)
        }
        let dataType = 'hsb'
        if( data.color ){
            dataType = 'color'
        }else if( data.R ){
            dataType = 'rgb'
        }
        this.update(dataType, true)
    }
    startChoose (ref, e) {
        this.moveHandle(ref, e);
        doc.on('mousemove.color', (e)=>{
            this.moveHandle(ref, e);
        }).on('mouseup.color', (e)=>{
            doc.off('mousemove.color mouseup.color');
        });
    }
    moveHandle (ref, e) {
        var {data} = this.state
        var target = $(this.refs[ref])
        var S = ref=='mask',
            mouse = { //鼠标位置
                x: e.clientX,
                y: e.clientY
            },
            top = mouse.y + $(window).scrollTop() - target.offset().top;

        top = top < 0 ? 0 : top;
        top = top > 255 ? 255 : top;

        if (S) {
            data.b = 100 - top * 100 / 255; //亮度
            var left = mouse.x + $(window).scrollLeft() - target.offset().left;
            left = left < 0 ? 0 : left;
            left = left > 255 ? 255 : left;
            data.s = left * 100 / 255; //饱和度
        } else {
            data.h = 360 - top * 360 / 255;
            // if( data.h )
            let maxHue = this.state.maxHue = data.h>=360//最大最小 色相显示值均为0 用maxHue区分
            data.h = maxHue ? 0 : data.h; //色相
        }
        e.preventDefault();

        this.update('hsb')
    }
    update (changeType, reset) {
        let {onChange} = this.props
        let {data, pos} = this.state
        var {h, s, b, R, G, B, color} = data
        if( changeType=='hsb' ){
            var RGB = HsbToRgb(h, s, b)
            R = RGB.R
            G = RGB.G
            B = RGB.B

        }else if( changeType=='rgb' ){
            var {H:h, S:s, B:b} = RgbToHsb(R, G, B)

        }else{//change hex
            var Color = HexToRgb(color)
            if( typeof Color == 'string' || color.length<6 ) {
                this.setState({data})
                return
            }
            var {R, G, B} = Color
            var {H:h, S:s, B:b} = RgbToHsb(R, G, B)
        }
        data = {
            h : Math.round(h), 
            s : Math.round(s), 
            b : Math.round(b),
            color:RgbToHex(R, G, B).toUpperCase(),//16进制的颜色值
            R : Math.round(R), 
            G : Math.round(G), 
            B : Math.round(B)
        } 

        let rgb = HsbToRgb(h, 100, 100);
        this.state.hue = `rgb(${Math.round(rgb.R)}, ${Math.round(rgb.G)}, ${Math.round(rgb.B)})`

        if( reset ){
            this.state.maxHue = !h
        }

        this.getPos(data)

        if( reset ){
            this.state.data = data
        }else{
            onChange && onChange(data)
            this.setState({data})
        }        
    }
    getPos (data) {
        let {maxHue, pos} = this.state
        let {h, s, b} = data

        pos.roll_top = maxHue ? -3 : ((360-h)/360)*255 - 3//roll top 反比
        pos.left = s*255/100 - 6     //mask left 正比
        pos.top = (100-b)*255/100 - 6//mask top反比
    }
    changeHandle (key, e) {
        let {data} = this.state
        let v = e.target.value

        this.state.maxHue = false

        if( key=='color' ){//change 'hex'
            data[key] = v
            this.update(key)
            return
        }

        v = parseInt(v)
        v = isNaN(v) ? data[key] : v

        if( key.toLowerCase()!=key ){//change RGB
            v = v<0 || v>255 ? data[key] : v
            data[key] = v
            this.update('rgb')

        }else {//change hsb
            if( key=='h' ){
                v = v<0 || v>359 ? data[key] : v
            }else{
                v = v<0 || v>100 ? data[key] : v
            }
            data[key] = v
            this.update('hsb')
        }
    }
    render () {
        let {onSubmit, onCancel} = this.props
        let {hue, data, pos} = this.state

        return <div className="color-picker-box clearfix">
            <div className="mask" ref="mask" style={{background:hue}} onMouseDown={this.startChoose.bind(this, 'mask')}>
                <div className="b"></div>
                <div className="c" style={{top:pos.top, left:pos.left}}></div>
            </div> 
            <div className="roll" ref="roll" onMouseDown={this.startChoose.bind(this, 'roll')}>
                <div className="c" style={{top:pos.roll_top}}></div>
            </div> 
            <div className="r"> 
            <span className="preview"><i style={{background:'#'+data.color}}></i>颜色</span> 
            <dl> 
                <dd><label>H：</label><input onChange={this.changeHandle.bind(this,'h')} value={data.h} />度</dd> 
                <dd><label>S：</label><input onChange={this.changeHandle.bind(this,'s')} value={data.s} />%</dd> 
                <dd><label>B：</label><input onChange={this.changeHandle.bind(this,'b')} value={data.b} />%</dd> 
            </dl> 
            <dl> 
                <dd><label>R：</label><input onChange={this.changeHandle.bind(this,'R')} value={data.R} /></dd> 
                <dd><label>G：</label><input onChange={this.changeHandle.bind(this,'G')} value={data.G} /></dd> 
                <dd><label>B：</label><input onChange={this.changeHandle.bind(this,'B')} value={data.B} /></dd> 
                <dd className="color">
                    <label>#</label> 
                    <input onChange={this.changeHandle.bind(this,'color')} value={data.color} />
                </dd> 
            </dl> 
            <button onClick={e=>onSubmit(data, e)} className="nj-button nj-button-red nj-button-small ok" >确定</button> 
            <button onClick={e=>onCancel(data, e)} className="nj-button nj-button-small close">取消</button> 
            </div> 
        </div>
    }
}

