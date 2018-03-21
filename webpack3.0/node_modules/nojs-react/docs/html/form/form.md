## Form

表单验证组件，2种方式创建表单，React组件和html标签指令(nj-form)
<a href="form/normal.html">demo</a>

### Usage 
<pre><code class="language-javascript">
import {Form, Input, InputGroup} from 'nj/form' //引入组件
</code></pre>


#### #1 React Component
<pre><code class="language-javascript"><script type="text/code">
var myform = ReactDOM.render((
    <Form className="nj-form" action="" method="post">
        <Input type="text" defaultValue="hello" required />
    </Form>
), document.getElementById('formRoot'))
</script></code></pre>

#### #2 nj-html
<pre><code class="language-html"><script type="text/code">
<!--通过nj-html指令在html文件中直接创建表单-->
<nj-form class="nj-form" action="" method="post" handle="myform">
    username: <nj-input class="text" name="username" defaultValue="lilei" required nj-minlength="4" nj-maxlength="16"></nj-input>
    email: <nj-input class="text" name="email" type="email" required></nj-input>
    skills: 
    <nj-input-group required nj-minlength="2">
        <nj-input class="checkbox" name="skill[]" value="1">html</nj-input>
        <nj-input class="checkbox" name="skill[]" value="2">css</nj-input>
        <nj-input class="checkbox" name="skill[]" value="3">javascript</nj-input>
    </nj-input-group>
</nj-form>
</script></code></pre>

通过 <code>handle</code>属性可以获取表单的实例对象
<pre><code class="language-javascript">
var myform = Form.getByHandle('myform')
</code></pre>



### Events

#### onSubmitBefore <span>表单提交验证之前触发</span>
<pre><code class="language-javascript">
//添加onSubmitBefore事件 可链式添加多个（该方式适合所有事件） 该事件在验证动作之前执行
myform.onSubmitBefore(e=>{
    if( something1 ){
        e.preventDefault()//阻止表单继续验证
    }
}).onSubmitBefore(e=>{
    if( something2 ){
        e.preventDefault()//阻止表单继续验证
    }
})
</code></pre>

#### onSubmit <span>表单提交验证通过后触发</span>
<pre><code class="language-javascript">
//添加onSubmit事件 
var form = ReactDOM.findDOMNode(myform) //获取form标签dom对象
myform.onSubmit(e=>{    
    //ajax提交表单
    $.post(form.action, $(form).serialize(), json=>{
        //
    }) 
    e.preventDefault()//阻止表单以默认方式提交
})
</code></pre>


### Props

#### showicon <span>[String] 只显示此类验证图标，可取值'all'/'ok'/'error'，默认'all'</span>
#### handle <span>[String] 指定实例名称，通过getByHandle(handle)方法可获取对应实例对象</span>
#### noValidate <span>[Boolean] 是否禁用html5原生验证方式 默认true</span>



### Methods

#### setValid(valid, nextState) <span>在组件外部手动更新验证状态 如异步场景</span>


### Static Methods

#### Form.addRule(name, fn, errortext) <span>添加自定义规则</span>
<pre><code class="language-javascript">
Form.addRule('checkname', function(value, target){
    //此处this指向当前验证的Input组件 target为规则名属性对应的值
    if( someReg.test(value) ){
        return true
    }else{
        return false
    }
})
</code></pre>

#### Form.addAsyncRule(name, fn, errortext) <span>添加异步验证规则，函数内部实现了频繁异步请求限制</span>
<pre><code class="language-javascript">
//异步规则一般配合setValid方法
Form.addAsyncRule('checkname', function(value, target, options){
    //使用setTimeout模拟异步
    setTimeout(e=>{
        let status = false  //服务器返回的状态码
        let {name} = this.props

        //options为属性值生成的对象
        //&lt;Input required checkname="type:'post',url:'/h/checkname'" /> 
        console.log(options)
        
        if( status ){
            //验证通过
            this.setValid(true)
        }else{
            //验证不通过
            this.setValid(false, {errortext:'账号已存在'})
        }        
    }, 500)
}, '账号检测中……')
</code></pre>

#### Form.verifyCode(verify, refresh) <span>带刷新功能的图片类验证码</span>
#### Form.fill(options) <span>填充数据到表单</span>
* options.form 被填充的表单dom
* options.data 填充的数据
* options.always 为true时，当表单中无data对应的字段时，动态添加隐藏域到表单中

#### Form.post(options) <span>post跨域提交表单</span>
* options.form 待提交的表单，不存在则动态创建一个空表单对象
* options.data 附加数据，如果已有表单，则会覆盖合并数据
* options.url 提交url
* options.beforeSend 提交之前触发 document.domain = 'a.com';//此句可以在beforeSend中配置
* options.success 提交成功后触发 