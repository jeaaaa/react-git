## Datepicker
日历选择器

### Usage
<pre><code class="language-javascript"><script type="text/code">
import Datepicker from 'nj/datepicker'

//渲染一个input到dom中
render(<Datepicker />, document.getElementById('root'))

//input已存在dom中
let input = $('input')[0]
render(<Datepicker input={input}/>, input)
</script></code>
</pre>

###  Props
#### months <span>显示的月份数 默认1</span>
#### onChange <span>切换日期时间事件，函数返回3个参数：value格式化后的字符串;data对应的数据对象;timestamp对应的时间戳</span>
#### min <span>可选的最小日期 string|date|timestamp</span>
#### max <span>可选的最大日期 string|date|timestamp</span>
#### mode <span>'datetime'|'date'|'time'</span>
#### format <span>输出的日期格式， 默认'yy-mm-dd hh:mm:ss'</span>
#### value <span>默认日期 string</span>
#### disableAnimation <span>是否禁用动画 默认false</span>

<p></p>

### Min/Max 
<pre><code class="language-javascript"><script type="text/code">
//选择的开始时间作为结束时间的min
let start = (max)=>render(
    <Datepicker min={new Date()} max={max} onChange={value=>end(value)} placeholder="开始时间" />, 
    document.getElementById('starttime')
)
//选择的结束时间作为开始时间的max
let end = (min)=>render(
    <Datepicker min={min||new Date()} onChange={value=>start(value)} placeholder="结束时间" />, 
    document.getElementById('endtime')
)
start()
end()
</script></code>
</pre>

<span id="rootDatepicker"></span> -
 <span id="rootDatepicker1"></span>
<!-- <input type="text" id="rootDatepicker2"> -->

<nj-form>
    <nj-input readonly name="starttime"></nj-input>
</nj-form>