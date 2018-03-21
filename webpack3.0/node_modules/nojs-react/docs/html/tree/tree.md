## Tree

树形菜单

### Usage
<pre><code class="language-javascript">
import Tree from 'nj/tree' //引入组件
</code>
</pre>

<div id="treeNormal" class="nj-tree mb15"></div>

<pre><code class="language-javascript"><script type="text/code">
var testData = [//使用本地数据生成tree
    {"id":1, "name":"Components","open":1},
    {"id":2, "name":"Mask", "parentid":1, "link":"mask"}
] 
var mytree = render(<Tree data={testData}/>, container)
</script></code>
</pre>

### Props

#### data <span>[Array|String]数据来源 本地数组或远程url</span>
#### keymap <span>[Object]当数据格式不一致时，使用此对象来做key匹配</span>
<pre><code class="language-javascript">
{//默认节点格式 {id:'1', name:'book', parentid:'0'}
    keymap : {
        'id' : 's_id',
        'name' : 's_name',
        'parentid' : 's_parentid'
    }
}
</code>
</pre>
#### rootID <span>[String] 根节点id即一级目录的父id，默认为'0'</span>



### Events

#### onFetch(promise, parentid) <span>异步事件，触发请求时执行，返回新的promise对象。传入第一个参数为promise对象，允许对返回的数据做修改; 第二个参数为打开的节点id，根目录时为rootID</span>
<pre><code class="language-javascript">
mytree.onFetch((promise, parentid)=>promise.then(json=>json.data))
</code>
</pre>
#### onFetchComplete(data) <span>异步事件，请求完成后执行</span>
#### onToggle(node) <span>折叠节点时触发</span>
#### onChange(node,event) <span>选中节点时触发</span>