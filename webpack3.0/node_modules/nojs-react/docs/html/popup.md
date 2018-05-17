## Popup

弹窗组件 
 
### Usage
<pre><code class="language-javascript">
import Popup from 'nj/popup' //引入组件
</code>
</pre>


#### Popup.create(options)

<pre><code class="language-javascript">
var mypopup = Popup.create(options).onShow(()=>{
    //当弹窗显示时触发的事件
}).onHide(()=>{
    //当弹窗关闭时触发的事件
}).then((res)=>{
    //弹窗关闭时触发 res为当前点击的操作按钮返回值
})

//显示弹窗

mypopup.setDisplay(true)
</code>
</pre>
<div class="mb15"><button class="nj-button" id="showPopup">create a popup</button></div>


#### Popup.alert(options)

<pre><code class="language-javascript">
var alertpop = Popup.alert({template:'操作成功！'}) 
</code>
</pre>
<div class="mb15"><button class="nj-button" id="alertPopup">Alert</button></div>


#### Popup.confirm(options) 

<pre><code class="language-javascript">
var alertpop = Popup.confirm({ 
    template : '确认操作？'
}).then((res)=>{
    alert(res?'选择了是':'选择了否')
})
</code>
</pre>
<div class="mb15"><button class="nj-button" id="confirmPopup">Confirm</button></div>


### Options

#### title: <span>[String|JSX] 设置标题</span>
#### template: <span>[String|function|JSX] 设置弹窗内容</span>
#### buttons: <span>[Array] 设置操作区按钮</span>
<pre><code class="language-javascript">
{
    buttons : [
        {text:'确定', className:'nj-button', handle (e) {
            //按钮点击事件
            console.log(e) 
            
            //通过e.preventDefault方法可阻止弹窗关闭动作
            e.preventDefault() 
            
            //返回的值在then事件中获取
            return true 
        },
        {text:'取消', className:'nj-button'}
    ]
}
</code>
</pre>
#### name: <span>[String] 设置弹窗的名称 最终体现在弹窗元素的class属性上，多个用空格隔开</span>

