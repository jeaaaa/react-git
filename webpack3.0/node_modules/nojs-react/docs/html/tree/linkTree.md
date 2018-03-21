## LinkTree

树形级联菜单

### Usage
<pre><code class="language-javascript">
import {LinkTree} from 'nj/tree' //引入组件
</code>
</pre>

<button id="menuTree">menu</button>
<div id="treeLink" class="nj-tree mb15"></div>

<pre><code class="language-javascript"><script type="text/code">
var mytree = render(<LinkTree data={'./menu?parentid='}/>, container)
</script></code>
</pre>

### Props

#### data <span>[Array|String] 数据来源</span>
#### maxlevel <span>[Number] 最多显示的层级数</span>
#### selected <span>[Array] 设置默认被选中的节点，数组由从低到高级的节点id组成</span>
#### keymap/rootID <span>同Tree</span>

### Events

#### onFetch/onFetchComplete/onChange <span>同Tree</span>