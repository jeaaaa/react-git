## Utils

提供的工具类函数

### Usage
<pre><code class="language-javascript">
import {utils} from 'nojs-react'
const {cookie, localStorage} = utils
</code></pre>

#### cookie(key, value, options) <span>cookie操作</span>
<pre><code class="language-javascript">
var uid = cookie('userid') //get
cookie('userid', 'value', options) //set
</code></pre>

#### localStorage
<pre><code class="language-javascript">
//get
var value = localStorage.get(key) 
value = JSON.parse(value) //取出的value为字符串，需转化为json对象
//set options.expires:可设置过期时间(天)
localStorage.set(key, JSON.stringify(value), options) 
//删除key
localStorage.remove(key) 
</code></pre>

#### joinClass(class1, class2, ...classN) <span>将传入的参数组合成最终的class。参数个数不限，值为假的被过滤</span>
<pre><code class="language-javascript">
//带空格的字符串参数或数组参数都可接受
var className = joinClass('name1', some1 && 'name2 name3', ['name4', 'name5']) 
</code></pre>

#### dateParse(options) <span>格式化日期</span>
<pre><code class="language-javascript">
/**
 * options.format[string] 默认'yy/mm/dd hh:mm:ss'
 * options.date[Number] 毫秒数 默认为当前时间
 */
dateParse() // => 2016/04/19 10:39:48
</code></pre>

#### addEventQueue(eventName) <span>创建回调事件队列</span>
<pre><code class="language-javascript">
function Popup(){
    //添加onShow事件
    this.showEvent = addEventQueue.call(this, 'onShow')
}
Popup.prototype = {
    show () {
        //在show方法中触发onShow事件 并传入所需的参数
        this.showEvent.complete(arg1, arg2)
    }
}
let pop = new Popup()
//添加onShow事件
pop.onShow(e=>console.log(1)).onShow(e=>console.log(2))
pop.show()//这里执行show方法就会触发刚刚添加的事件
</code></pre>

#### fireEvent(type, element, eventType, data) <span>手动触发事件</span>

#### tmpl(str, data) <span>模板引擎</span>

