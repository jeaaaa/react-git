import $ from 'jquery'
import nj, {React, render} from 'nj'
// import Editor from 'nj/Editor'
import {Form, Input} from 'nj/form'

export const init = ()=>{
    
    let defaultValue = `
        13123 <p style="color:red">123</p>
        <p ><span style="color:red">123</span></p>
        <p style="color:red">123</p>
        <p style="color:red">123</p>
        <p style="color:red">123</p>
        <p style="color:red">123</p>
        <p style="color:red">123</p>
        <p style="color:red">123</p>
        <p style="color:red">123</p>
        <p style="color:red">123</p>
        <p style="color:red">123</p>
        <p style="color:red">123</p>
    `
    //<Editor placeholder="Placeholder……"/>
    
    class MyEditor extends React.Component{
        constructor (props) {
            super(props)
            this.state = {html:defaultValue}
        }
        render () {
            let {html} = this.state
            return <Form onSubmit={e=>{e.preventDefault();console.log(1)}}>            
                <Input type="editor" className="text" required nj-minlength="5" name="content" 
                    defaultValue={defaultValue}
                    onChange={html=>this.setState({html})}
                ></Input>
                <button>submit</button>
                <div className="ql-editor" dangerouslySetInnerHTML={{__html:html}}></div>
            </Form>
        }
    }
    render(
        <MyEditor />, 
        document.getElementById('rootEditor')
    )



    // console.log(Datepicker.Datetime)
}