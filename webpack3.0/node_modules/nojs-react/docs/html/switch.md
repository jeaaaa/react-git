## Switch

选项卡切换组件，支持html标签指令初始化组件

### Usage
<pre><code class="language-javascript">
import {Switch, SwitchMenu, SwitchItem} from 'nj/switch' //引入组件
</code>
</pre>

### Events

#### onChange(index, event) <span></span>


### Props

#### trigger <span>[String] 触发事件类型 'hover'/'click'</span>


### state

#### index <span>获取选项卡当前索引</span>
#### length <span>获取子项个数</span>

------

<div id="demo-switch-wrap" class="mb15"></div>

<pre><code class="language-javascript"><script type="text/code">
render(
    <Switch trigger="hover"> 
        <ul className="nj-switch-menus clearfix">
            <li><SwitchMenu>1</SwitchMenu></li>
            <li><SwitchMenu>2</SwitchMenu></li>
        </ul>
        <SwitchItem>11a</SwitchItem>
        <SwitchItem>22a</SwitchItem>
    </Switch>
, demoWrap)
</script></code>
</pre>

------

<div class="mb15">
<nj-switch handle="myswitch">
    <ul class="nj-switch-menus clearfix">
        <li><nj-switch-menu>1</nj-switch-menu></li>
        <li><nj-switch-menu>2</nj-switch-menu></li>
    </ul>
    <nj-switch-item>通过&lt;nj-switch&gt;标签指令创建选项卡</nj-switch-item>
    <nj-switch-item>22</nj-switch-item>
</nj-switch>
</div>

<pre><code class="language-html"><script type="text/code">
<nj-switch trigger="click">
    <ul class="nj-switch-menus clearfix">
        <li><nj-switch-menu>1</nj-switch-menu></li>
        <li><nj-switch-menu>2</nj-switch-menu></li>
    </ul>
    <nj-switch-item>11</nj-switch-item>
    <nj-switch-item>22</nj-switch-item>
</nj-switch>
</script></code>
</pre>


