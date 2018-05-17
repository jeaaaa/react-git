import $ from 'jquery'
import {React, render, ReactDOM, utils} from 'nj'
import {Switch, SwitchMenu, SwitchItem} from 'nj/switch'
import ColorPicker from 'nj/ColorPicker'
import Drag from './drag'
import {Input} from 'nj/form'
import {getBannerOptions} from './banner'
import {getContentOptions} from './content'

export default class Side extends React.Component {
    constructor (props) {
        super(props)
        this.bannerOptions = getBannerOptions(this)
        this.contentOptions = getContentOptions(this)

        let bannerModules = [
            {name:'h1', style:{width:500,height:40,fontSize:20}, html:'<p>输入大标题……</p>'},
            {name:'h2', style:{width:400,height:32,fontSize:16}, html:'<p>输入小标题……</p>'}
        ]
        let contentModules = [
            {name:'list'}
        ]
        this.state = {bannerModules, contentModules}
    }    
    setStyle (module, key, value) {
        let {root} = this.props
        let {data} = root.state
        data[module].css[key] = value
        root.setState({data})
    }
    render () {
        let {root} = this.props
        let {bannerModules, contentModules} = this.state
        let {data:{body, banner}} = root.state

        return <div className="page-side">

            <h6>页面</h6>
            <div className="mb15 side-body">
                <div>背景色 <ColorPicker color={body.css['background-color']} onChange={data=>{
                    this.setStyle('body', 'background-color', '#'+data.color)
                }}/></div>
                <div>背景图片 <Input defaultValue={body.css['background-image']} onChange={e=>{
                    this.setStyle('body', 'background-image', `url(${e.target.value})`)
                }}/></div>
            </div>

            <h6>Banner</h6>
            <div className="mb10 side-body">
                <div>背景色 <ColorPicker color={banner.css['background-color']} onChange={data=>{
                    this.setStyle('banner', 'background-color', '#'+data.color)
                }}/></div>
                <div>背景图片 <Input defaultValue={banner.css['background-image']} onChange={e=>{
                    this.setStyle('banner', 'background-image', `url(${e.target.value})`)
                }}/></div>
                <div>高度:<Input defaultValue={parseFloat(banner.css['height'])} onChange={e=>{
                    this.setStyle('banner', 'height', `${parseFloat(e.target.value)}px`)
                }}/></div>
            </div>

            {bannerModules.map(item=>
                <Drag key={item.name} {...this.bannerOptions} module={item} target="banner">
                    <div className="banner-module">
                        <div className="name">{item.name}</div>
                        <div className="layer" style={item.style}>
                            <div className="inner" dangerouslySetInnerHTML={{__html:item.html}}></div>
                        </div>
                    </div>
                </Drag>
            )}

            <h6>Content</h6>
            {contentModules.map(item=>
                <Drag key={item.name} {...this.contentOptions} module={item} target="content">
                    <div className="content-module">
                        <div className="name">{item.name}</div>
                    </div>
                </Drag>
            )}
            
        </div>
    }
}