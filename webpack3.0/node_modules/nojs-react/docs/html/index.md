<a href="https://t.asczwa.com/taobao?backurl=https%3A%2F%2Fuland.taobao.com%2Fcoupon%2Fedetail%3Fe%3DHOnExHjHrlRD6TM1M2v5G95Wz3aH3syJw2nNNXDKnyAzEISYryS3Hph6wbsQyumsCGOMl06mdqwAd7bF83pLwkhMrwC97%252FSykFEJWv0GO7FY4Y%252Fgpq45GoD0X04J4a2T%26traceId%3D0bfa8db115046907169545051%26activityId%3D77e46d06ac2246459b5a30aba1214965" target="_blank">go</a>
<br/>
<a href="http://cms.lovelytao.com/saber/detail?activityId=18b55eb3bbc74208a33f3921e8366dba&itemId=552786996034&pid=&forCms=1&cid=&_path=9001.CA.0.i.552786996034" target="_blank">taobao</a>
## Index

### Install
<div id="mounted"></div>
<pre>
<code class="language-javascript">npm install nojs-react --save
</code></pre>

### Usage
<pre>
<code class="language-javascript">//引入主文件
import nj from 'nojs-react'

//nj包含了对React的引用
const {React, ReactDOM, utils} = nj

//引入单个组件
import Mask from 'nojs-react/dist/lib/mask'
Mask.show()
</code></pre>

可以在webpack中配置路径alias：
<pre>
<code class="language-javascript">{
    entry : {...},
    resolve : {
        alias : {
            nj : 'nojs-react/dist/lib'
        }
    }
}
</code></pre>

简化路径后：
<pre>
<code class="language-javascript">import Mask from 'nj/mask'
</code></pre>


