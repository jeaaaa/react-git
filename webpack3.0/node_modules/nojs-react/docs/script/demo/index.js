import $ from 'jquery'
import {React, render, utils, ReactDOM} from 'nj'

class Popup extends React.Component {
    renderLayer () {
        return <div className="nj-popup" style={{top:0,padding:50,display:'none'}}>12</div>
    }
    componentDidMount () {
        this._layer = utils.createContainer('nj-popover-container nj-layer-wrap')
        this.layer = render(this.renderLayer(), this._layer)
    }
    render () {
        return null
    }
}

class MyPopup extends React.Component {
    render () {
        return <div>
            <button onClick={e=>{
                this.refs.pop.layer.style.display='block'
            }}>show</button>
            <Popup ref="pop"/>
        </div>
    }
}

export const init = ()=>{
    render(<MyPopup/>, document.getElementById('mounted'))
}