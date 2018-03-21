/**
 * Quill编辑器
 * docs:https://quilljs.com/docs/api/
 */
import {React, render, utils} from '../nojs-react'
import PropTypes from 'prop-types'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const {Component, isValidElement} = React


class Editor extends Component {
    constructor (props) {
        super(props)
        this.state = {
            id : 'nj-editor-'+(+new Date)
        }
        this.handleChange = this.handleChange.bind(this)
        this.editor = null
    }
    componentDidMount () {
        let {theme, value, placeholder} = this.props
        let editor = this.editor = new Quill(this.refs.editor, {
            modules: { toolbar: `#${this.state.id}` },
            placeholder,
            // debug: 'info',
            // readOnly,
            theme
        })
        value && editor.clipboard.dangerouslyPasteHTML(value)
        editor.on('text-change', this.handleChange)

        // setTimeout(e=>{
        //     editor.setSelection(0, 5);
        //     var range = editor.getSelection();
        //     console.log(range)
        //     // editor.insertEmbed(range.index, 'image', 'http://quilljs.com/images/cloud.png');
        // }, 2000)
    }
    componentWillReceiveProps (nextProps) {
        if (nextProps.value !== this.value) {
            if( this.state.action ){//这里可能诱发Input组件死循环 限制非手动修改时才触发更新
                this.state.action = null
            }else{
                this.editor.clipboard.dangerouslyPasteHTML(nextProps.value)
            }
        }
        if (nextProps.readOnly !== this.props.readOnly) {
            this.editor.enable(!nextProps.readOnly)
        }
    }
    insertContent(str, type){
        let range = editor.getSelection();

    }
    handleChange (e) {
        this.state.action = 'input'//标记手动输入
        setTimeout(e=>{
            this.state.action = null
        }, 1)
        // let text = this.editor.getText()//this.editor.root.innerText.replace(/^[\s\t]+|[\s\t]+$/g, '')
        this.value = this.editor.root.innerHTML
        let {onChange} = this.props
        onChange && onChange(this.value, this.editor.root.innerText)
    }
    renderToolbar (toolbar, index) {
        if (typeof toolbar === 'string') {
          return <button key={toolbar} title={toolbar} className={`ql-${toolbar}`} />
        }

        if (Array.isArray(toolbar)) {
          return <span key={index}>{toolbar.map((child, i) => this.renderToolbar(child, i))}</span>
        }

        if (isValidElement(toolbar)) return toolbar

        if (typeof toolbar === 'object') {
          let key = Object.keys(toolbar)[0]
          let value = toolbar[key]

          if (Array.isArray(value)) {
            return (
              <select key={`${key}-${index}`} value={false} className={`ql-${key}`}>
                { value.map((v, i) =><option key={i} value={v!==false?v:undefined} />) }
              </select>
            )
          } else {
            return <button key={`${key}-${index}`} className={`ql-${key}`} value={value} />
          }
        }
    }
    render () {
        let {className, toolbar, height} = this.props
        let {id} = this.state
        
        return <div className={utils.joinClass('nj-editor', className)}>
            <div id={`${id}`}>
              {this.renderToolbar(toolbar)}
            </div>
            <div ref="editor" style={{height}} />
        </div>
    }
}
module.exports = Editor

Editor.propTypes = {
  height: PropTypes.number,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  style: PropTypes.object,
  theme: PropTypes.string,
  toolbar: PropTypes.array,
  value: PropTypes.string
}

Editor.defaultProps = {
    height: 200,
    theme: 'snow',
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote'],//, 'code-block'
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        // [{ 'script': 'sub'}, { 'script': 'super' }],
        // [{ 'indent': '-1'}, { 'indent': '+1' }],
        // [{ 'direction': 'rtl' }],
        // [{ 'size': ['small', false, 'large', 'huge'] }],
        // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['video'],
        [{'size': ['0.26rem', '0.31rem', '0.37rem', '0.41rem', '0.47rem', '0.52rem']}],
        [{ 'color': [] }, { 'background': [] }],
        // [{ 'font': [] }],
        [{ 'align': [] }],
        ['link'],
        // ['clean']
    ]
}

Editor.childContextTypes = {
  getEditor: PropTypes.func,
  Quill: PropTypes.func
}