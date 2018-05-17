
import $ from 'jquery'
import {React, render, utils} from 'nj'
import Side from './side'
import Banner from './banner'
import Content from './content'
import '../../css/page.css'

export const init = ()=>{
    render(<Page/>, document.getElementById('mounted'))
}

class Page extends React.Component {
    constructor (props) {
        super(props)
        let pageid = 'page-index'
        let data = {
            body : {
                pageid,
                css : {
                    'background-color':'transparent'
                },
                selector : `#${pageid}`
            },
            banner : {
                css : {
                    'background-color':'#f2f2f2',
                    'height' : '300px',
                    'margin-bottom' : '20px'
                },
                selector : `#${pageid} .banner`
            },
            content : {
                css : {},
                selector : `#${pageid} .page-main`
            }
        }
        
        this.state = {
            data,
            template : `
                <style>
                    .page-main{min-height:500px;width:1200px;margin:0 auto}
                </style>
                <div>1</div>
                <div class="banner" data-dragarea="banner"></div>
                <div class="page-all page-main" data-dragarea="content"></div>
            `
        }        
    }
    componentDidMount () {
        let $body = $(this.refs.body)
        let $inner = $body.children()
        $inner.width($inner.children().outerWidth(true))
        $body.scrollLeft(($inner.innerWidth()-$body.width())/2).scrollTop(90)

        let {data} = this.state
        let {canvas} = this.refs
        let el = $(canvas)
        let areas = el.find('[data-dragarea]')

        this.canvas = {
            el,
            areas
        }     

        //在banner区域创建一个占位元素来渲染banner图层
        let $banner = areas.filter('[data-dragarea="banner"]')
        let bannerRoot = $('<div></div>').appendTo($banner)
        data.banner.layers = render(<Banner layers={[]} root={this}/>, bannerRoot[0])

        //content
        let $content = areas.filter('[data-dragarea="content"]')
        let contentRoot = $('<div></div>').appendTo($content)
        data.content.layers = render(<Content layers={[]} root={this}/>, contentRoot[0])   
    }
    // componentDidUpdate (prevProps, prevState) { 
    //     this.canvas.areas = this.canvas.el.find('[data-dragarea]')
    // }
    getStyle () {
        let {data} = this.state
        let styles = []
        for( let i in data ){
            let css = data[i].css
            for( let j in css ){
                styles.push(`${data[i].selector} {${j} : ${css[j]} }`)
            }
        }
        styles = `<style>${styles.join('\n')}</style>`
        return styles
    }
    render () {
        let {template, styles, data} = this.state
        let {pageid} = data.body
        
        return <div className="page-container">
            <div className="page-body" ref="body">
                <div className="_inner">
                    <div className="page-canvas">
                        <div ref="canvas" className="canvas-content">
                            <div dangerouslySetInnerHTML={{__html:this.getStyle()}}></div>
                            <div id={pageid} dangerouslySetInnerHTML={{__html:template}}></div>
                        </div>
                    </div>
                </div>
            </div>
            <Side root={this}/>
        </div>
    }
}