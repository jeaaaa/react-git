## SelectTree

在一个select中显示树形数据结构

### Usage
<pre><code class="language-javascript">
import {SelectTree} from 'nj/tree' //引入组件
</code>
</pre>

<div id="treeSelect" class="nj-tree mb15"></div>

<pre><code class="language-javascript"><script type="text/code">
var testData = [...] //本地数据
var mytree = render(<SelectTree data={testData} size="5"/>, container)
</script></code>
</pre>

### Props

#### data <span>[Array] 数据来源</span>
#### rootNode <span>[Boolean] 是否显示'根节点'option</span>
#### maxlevel <span>[Function|Number] 最大显示的层级</span>
#### defaultValue <span>[String] 设置默认选中的节点id</span>
#### size/name/className <span>为select原生属性，className对应class</span>
#### keymap/rootID <span>同Tree</span>


### Events

#### onChange(node,event) <span></span>