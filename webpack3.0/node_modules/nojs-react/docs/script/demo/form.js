import $ from 'jquery'
import {React, render} from 'nj'
import {Form} from 'nj/form'
import {LinkTree} from 'nj/tree'
import Face from 'nj/face'
import Autocomplete from 'nj/autocomplete'
//添加全局异步验证方法async
// Form.addAsyncRule('async', function(value, options){
//     Object.assign({type:'get'}, options)
//     $[options.type](options.url, options.data, json=>{
//         if( json.status==1 ){
//             this.setValid(true)
//         }else{
//             this.setValid(false, {errortext:json.info})
//         } 
//     }, 'json')
// }, 'loading……')

Form.addAsyncRule('checkname', function(value, options){
    setTimeout(e=>{
        let status = true
        let {name} = this.props
        if( status ){
            this.setValid(true)
        }else{
            this.setValid(false, {errortext:'账号已存在'})
        }        
    }, 500)
}, '账号检测中……')


export const init = ({id, url})=>{
    render(<Nav url={url} />, document.getElementById('demo-nav'))
    
    // Form.start()
    
    Form.startOne('verify')
    Autocomplete.start()
    // console.log(Autocomplete.getByHandle('ac'))


    Face.config({
        themes : []
    })
    Face.create({
        nearby : 'addFace',
        insert: $('textarea[name="comment"]')
    })

    let groupVerify = Form.getByHandle('verify-input-group')
    groupVerify && groupVerify.onSubmit(e=>{
        e.preventDefault()
        alert('通过')
    })

    let options = {
        data : [
            {"id":2, "name":"Mask"},
                {"id":21, "name":"Mask1", "parentid":2},
            {"id":3, "name":"Popup"},
            {"id":5, "name":"Tree"}
        ]
    }
    render(<LinkTree {...options}/> ,document.getElementById('linkTree'))
}

export const onLeave = e=>{
    console.log(e)
}

const Nav = React.createClass({
    getDefaultProps () {
        return {items : [
            {text:'nj-form', url:'form/normal.html'},
            {text:'React Component', url:'form/component.html'},
            {text:'InputGroup', url:'form/input-group.html'}
        ]}
    },
    render () {
        let {items, url} = this.props
        return <div>
            <a href="form/form" className="back">&lt;&lt;返回</a>
            {items.map(item => <a href={item.url} className={item.url==url?'current':''} key={item.url}>{item.text}</a>)}
        </div>
    }
})