var nj = require('./nojs-react') 
var {React,ReactDOM,utils} = nj
/**
 * 遮罩层组件
 * 提供show/hide 2个事件 
 */

var Mask = React.createClass({
  mixins: [nj.mixins.setDisplay],
  getDefaultProps () {
    return {effect : 'fade'};
  },  
  statics : (function(){
    var mask, wrap, first = true;
    return {
      show (name){
        wrap = wrap || nj.utils.createContainer('nj-mask ng-layer-wrap')
        this.mask = mask = ReactDOM.render(
          <Mask />,
          wrap
        );
        mask.setState({name})
        mask.setDisplay(true)

        if( first ){
          initEvents.complete(mask)
        }
        first = null
      },
      hide (){
        if( mask ){
          mask.setDisplay(false)
          mask.setState({'name':''})
        }
      }
    }
  })(),
  componentDidMount (){
    utils.stopScroll(ReactDOM.findDOMNode(this), function(e){
      e.preventDefault()
    })
  },
  render () {
    var {name, className} = this.state
    return (
        <div ref="layer" className={utils.joinClass(name,className)}></div>
    )
  }
});

module.exports = Mask

let initEvents = utils.addEventQueue.call(Mask, 'onInit')

  
