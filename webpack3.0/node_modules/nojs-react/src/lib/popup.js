/**
 * 弹窗组件
 */

var nj = require('./nojs-react') 
var $ = require('jquery')
var align = require('./align')
var Mask = require('./mask')
var {
  React,
  ReactDOM,
  mixins
} = nj


var instances = []
var focusPops = []
var setFocusPop = function(pop){
    if( !pop ){
        return
    }
    focusPops.indexOf(pop)<0 && focusPops.push(pop)
    focusPops.forEach(function(p){
        p.setState({isFocus: p === pop})
    })
    // pop.scope.safeApply() 
}
var bind = function(){
    if( !bind.init ){
        bind.init = 1

        //按下esc键隐藏弹窗
        $(document).on('keydown', function(e){
            if( e.keyCode==27 ){
                var pop = focusPops.slice(-1)[0]
                if( pop && pop.props.bindEsc ){
                    pop.setDisplay(false);
                }
            }
        })
    }
}

//组件静态方法
var Statics = {

  //创建一个弹窗
  create(options){
    options = options || {};
    var pop = ReactDOM.render(
      <Popup {...options} />,
      nj.utils.createContainer('nj-popup-container ng-layer-wrap')
    )
    bind()
    instances.push(pop)

    return pop;
  },
  //隐藏所有弹窗
  hide () {
      instances.forEach((p,i) => {
          p.setDisplay(false)
      })
  },
  //销毁弹窗
  destory (pop) {
      instances.forEach((p,i) => {
          if( p===pop ){
              instances.splice(i,1)
              document.body.removeChild(ReactDOM.findDOMNode(p).parentNode)              
          }
      })
  },

  //消息提示
  alert (options) {
      options = Object.assign({
          title : '提示：',
          bindEsc : false,
          buttons : [
              {text:'确定', className:'nj-button nj-button-red', handle:e=>true}
          ]
      }, options);
      options.name = nj.utils.joinClass('popup-alert popup-tip', options.name)
      var pop = Popup.create(options)
      //隐藏后销毁弹窗
      pop.onHide(function(){
          Popup.destory(this)
      })
      window.setTimeout(function(){
        pop.setDisplay(true)
      }, 1)
      return pop
  },

  confirm (options) {     
      options = Object.assign({
          title : '提示：',
          showClose : false,
          name : 'popup-confirm popup-tip',
          buttons : [
              {text:'确定', className:'nj-button nj-button-red', handle:e=>true},
              {text:'取消',className:'nj-button'}
          ]
      }, options);
      options.template = (
        <div>
          <span className="nj-icon nj-icon-warn"></span>
          <div className="_content">{options.template}</div>
        </div>
        )
      var pop = Popup.create(options)
      //隐藏后销毁弹窗
      pop.onHide(function(){
          Popup.destory(this)
      })
      pop.setDisplay(true)
      return pop
  },


  tip : function(){
    return {
      show (type, message, options) {
        options = options || {}
        Popup.tip.hide()
        var timer = typeof options.timer!='undefined' ? options.timer : 1500
        if( type=='loading' ){
            message = message || 'loading……'
        }else if( timer ){
            setTimeout(function(){
                tip.setDisplay(false)
            }, timer)
        }
        var tip = Popup.tip.handle = Popup.alert({
            title : '',
            template : (
                <div className={"tip-area tip-"+type}><i className={"nj-icon nj-icon-"+type}></i>
                    <span className="tip-text" dangerouslySetInnerHTML={{__html:message}}></span>
                </div>
            ),
            showMask : false,
            buttons : null
        })

        //提示完成后 重载页面
        var reload = options.reload
        if( reload ){
          tip.onShow(function(){
            window.setTimeout(function(){
              if( typeof reload=='string' ){
                window.location.href = reload
              }else{
                window.location.reload()
              }
            }, 1500)
          })
        }
      },
      hide () {
        var tip = Popup.tip.handle
        tip && tip.setDisplay(false)
        // Mask.hide()
      }
    }
  }()
}

var Popup = React.createClass({
  mixins: [align, mixins.setDisplay],
  statics : Statics,
  getDefaultProps () {
    return {effect:'drop', showMask:true, bindEsc:true}
  },
  getInitialState () {
      return {buttons:this.props.buttons||[], title:this.props.title||'', template:this.props.template};
  },
  componentWillMount (){
    //添加then事件
    this.thenEvent = nj.utils.addEventQueue.call(this, 'then')
  },
  componentDidMount () {
    this.setAlign({
      nearby : window,
      position : this.props.position,
      element : ReactDOM.findDOMNode(this)
    })

    //显示遮罩层
    this.onShow(function(){
      this.props.showMask && Mask.show()
      
      //当前焦点弹窗
      setFocusPop(this)
      this.align.set({
        position : this.props.position
      })

    }).onHide(function(){
      focusPops.pop()
      var hasShowMaskPop
      focusPops.forEach((pop)=>{
          if( pop.props.showMask && pop!==this ){
              hasShowMaskPop = pop
          }
      })
      // console.log(this.props.showMask,hasShowMaskPop,this)
      this.props.showMask && !hasShowMaskPop && Mask.hide()

      this.setState({isFocus:null})
      //当前弹窗隐藏后 需要设置处于焦点集合中最新的那个重新获得焦点
      setFocusPop(focusPops.slice(-1)[0])
      
      this.thenEvent.complete(this.res)
    })    
    //dangerouslySetInnerHTML={{__html:this.state.template}}    
  },
  componentWillUnmount () {
    console.log(this)
  },
  buttonHandle (fn, event) {
      var res = this.res = fn && fn.call(this,event);
      if( event.isDefaultPrevented() ){//调用preventDefault阻止关闭弹窗事件
        return
      }
      this.setDisplay(false);
  }, 
  cancel (){
    this.res = false
    this.setDisplay(false);
  },
  render () {
    var template = this.state.template 
    template = typeof template=='function' ? template.call(this) : template
    var body = <div className="_body" ref="body">{template}</div>
    if( typeof template =='string' ){
      body = <div className="_body" ref="body" dangerouslySetInnerHTML={{__html:template}}></div>
    }

    var className = nj.utils.joinClass('nj-popup', this.state.className, this.state.isFocus&&'popup-active', this.props.name)
    var buttons = this.state.buttons
    
    return (
        <div className={className}>
          <div className="_close" onClick={this.cancel}></div>
          <div className="_head">{this.state.title}</div>
          {body}
          <div className={buttons.length?'_foot':'d_hide'}>{buttons.map(function(btn,i){
            var btnClass = btn.className
            if( !btnClass ){
              btnClass = 'nj-button '
              btnClass += i==0 ? 'nj-button-red' : 'nj-button-default'
            }
            return (
              <button key={i} ref={'button'+i} type="button" className={btnClass} onClick={this.buttonHandle.bind(this,btn.handle)}>{btn.text}</button>
            )
          }.bind(this))}</div>
        </div>
    );
  }
})

module.exports = Popup