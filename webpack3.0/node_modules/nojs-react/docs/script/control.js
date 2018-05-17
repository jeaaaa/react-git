import $ from 'jquery'
import nj, {React, render} from 'nj'
import Frame from 'nj/Control'
import {Form} from 'nj/form'
import Marked from 'marked'
import Menu from 'json-loader!../menu.json'
import Prism from './prism'
// import Base64 from 'base64-js'

Frame.config({
    route : ['a', 'b']
})
// console.log(Base64);
const options = {
    // style : 2,
    defaultNode : "0",
    menu : Menu.data,
    _sidebar : tree=><div>
        <h3 style={{padding:'1.5em 1em', fontWeight:'100', margin:0}}>nojs-react</h3>
        {tree}
    </div>,
    // showTopbar : false,
    topbarItems : [
        // {content:'<div style="width:170px">logo</div>', align:'left', index:-1, type:'button'},
        {content:'<a href="form/normal.html">aaa21312</a>', type:'link'},
        {content:options=>{
            let hasForm = $('div.grid-main').find('form').length
            let verify = Form.getByHandle('verify')
            return hasForm && <div {...options}>
                <button className="nj-button nj-button-small" onClick={e=>verify.submit()}>done</button>
            </div> 
        }}
    ],
    template : ({id, url}) => 'html/'+url+(url.indexOf('.')<0 ? '.md' : ''),
    htmlParse : (html, {id, url}) => url.indexOf('.')<0 ? Marked(html) : html,
    onComplete : (params, node, pageName, parent) => {
        Prism.highlightAll()
        pageName && System.import("./" + pageName).then(p=>{
            p.init && p.init(params, node)
        })
    },
    onReady (params) {
        // console.log(1, params)
    },
    onChange (nextParams, params) {
        // console.log(2, nextParams, params)
    },
    routes : {
        'index' : function(){

        },
        'mask' : '',
        'popup' : ''
    },
    scripts : {
        'index' : 'demo/index',
        'mask' : 'demo/mask',
        'popup' : 'demo/popup',
        'popover' : 'demo/popup',
        'datepicker' : 'demo/datepicker',
        'editor' : 'demo/editor',
        'colorpicker' : 'demo/colorpicker',
        'form/normal.html' : 'demo/form',
        'form/component.html' : 'demo/form',
        'form/input-group.html' : 'demo/form',
        'tree/linkTree' : 'demo/tree',
        'app/page' : 'page/index'
    },
    // loadScript (pageName, callback) {
    //     // require('bundle!./'+pageName)(callback)
    // }
}

let frame = window.rootFrame = render(
    <Frame {...options} />, 
    document.getElementById('root')
)


