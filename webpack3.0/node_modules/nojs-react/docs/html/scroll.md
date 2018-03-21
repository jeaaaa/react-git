## Scroll

滚动组件

### Usage
<pre><code class="language-javascript"><script type="text/code">
import {Scroll} from 'nj/scroll' //引入组件
render(
    <Scroll time={4200} direction='x'>
        <ScrollItems>
            <div>1</div>
            <div>2</div>
            <div>3</div>
        </ScrollItems>
        <ScrollPage></ScrollPage>
    </Scroll>
, demoWrap)
</script></code>
</pre>


### Props

#### direction <span>[String] 滚动方向'x/y'，默认'y'</span>
#### step <span>[Number]每次滚动个数 0为连续滚动</span>
#### time <span>[Number] 滚动间隔时间，毫秒数 默认step==0?40:6000</span>
#### repeat <span>[Boolean] 是否无间断循环 默认true</span>
#### auto <span>[Boolean] 是否自动滚动 默认true</span>

#### pageTemplate <span>[Function] 分页项模板，函数会带入一个页码索引的参数，返回ReactElement/html。等同于ScrollPage.props.template</span>
<pre><code class="language-javascript"><script type="text/code">
var template = i => <div>p{i+1}-</div>
//通过Scroll传入
<Scroll pageTemplate={template}/>
//或者通过ScrollPage传入
<ScrollPage template={template}/>
</script></code>
</pre>

#### start-id <span>该属性只适用于html指令组件。<i class="red">当组件需要复杂属性传入时</i>，在html中无法表现，标记该属性后组件不会自动启动，需要手动启动并传入参数</span>
<pre><code class="language-javascript"><script type="text/code">
//标记了start-id，默认不会初始化该组件
<nj-scroll time="4000" start-id="myscroll" />

//在js文件中根据start-id属性手动启动该组件。参数2为带入的props，会覆盖指令上设置的重复属性
Scroll.startOne('myscroll', {time:5000, pageTemplate:template})
</script></code>
</pre>

<!-- <div id="demo-scroll-wrap" class="mb30"></div> -->
<!-- <a href="" class="prev">prev</a><a href="" class="next">next</a> -->
<div>
    <style>
    .nj-scroll{height:20px;overflow:hidden;border:1px solid #ddd;width:400px;position:relative;}
    .nj-scroll ._item{float:left;width:400px;}

    .dir-scroll{height:44px;}
    .nj-scroll-page{position:absolute;right:0;top:0;}
    .nj-scroll-page .-page-active{color:red;}
    </style>

     
<!-- <div>{step:1} 每次滚动一项</div>
    <nj-scroll time="2100"  class="dir-scroll">
        <nj-scroll-items>
        <div>11</div>
        <div>22</div>
        <div>33</div>
        </nj-scroll-items>
    </nj-scroll>



    <div>{step:2} 每次滚动两项</div>
    <nj-scroll time="2200" step="2" class="dir-scroll">
        <nj-scroll-items>
        <div>11</div>
        <div>22</div>
        <div>33</div>
        </nj-scroll-items>
    </nj-scroll> 
-->

    <div>{direction:'x'} 横向滚动</div>
    <nj-scroll time="2000" direction="x" start-id="myscroll">
        <nj-scroll-items>
            <div class="_item">11</div>
            <div class="_item">22</div>
            <div class="_item">33</div>
        </nj-scroll-items>
        <nj-scroll-page trigger="hover" handle="scroll-page"></nj-scroll-page>
    </nj-scroll> 

</div>