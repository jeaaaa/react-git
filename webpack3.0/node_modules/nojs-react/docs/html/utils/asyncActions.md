## utils.action

主要是针对ajax事件操作类的一些处理。将常用事件集中定义成各种Action，方便调用

### Usage
配置action
<pre><code class="language-javascript">
import {utils} from 'nojs-react'
const {action} = utils

export const ACTION_UP = 'ACTION_UP'

//定义一个action，参数一是action名称，参数二是ajax选项
var myAction = action.add(ACTION_UP, {
    url : '',
    data : {}
})
</code>
</pre>

使用action
<pre><code class="language-javascript">
var myAction = action.get(ACTION_UP) //获取action的引用
//给action添加事件 可以在定义action时添加一些全局事件，也可以在执行之前临时添加
myAction.onFetchBefore(conf=>{
    console.log(conf)
})
//执行action
action.trigger(ACTION_UP, {
    //此处的选项会覆盖添加action时的选项
})
</code>
</pre>


### Events

#### onFetchBefore(conf) <span>执行action之前触发，返回false可中断action</span>
#### onFetch(promise, conf) <span>执行action时触发，必须返回新的promise对象</span>
#### onFetchComplete(json, conf) <span>执行action成功后触发</span>



### Methods

#### action.config(options) <span>设置全局ajax选项</span>
<pre><code class="language-javascript">
action.config({
    dataType : 'json',
    type : 'post',
    timeout : 6000
})
</code>
</pre>

#### action.add(name, options) <span>添加action</span>
#### action.get(name) <span>获取action对象的引用</span>
#### action.on(name, options) <span>绑定action到dom</span>
<pre><code class="language-javascript">
action.on('up', {
    //target必选 dom对象或者id
    target : '',
    data : {}
})
</code>
</pre>

#### action.trigger(name, options) <span>直接执行action，当处于其他事件上下文或者没有用户操作，需要执行action时可以使用此方法</span>