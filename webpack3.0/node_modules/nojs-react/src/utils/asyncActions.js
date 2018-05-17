/*
 * ajax事件集合类
 * @on : 绑定事件
 * @trigger : 触发事件
 * 参数相同[action, options]
 */

var $ = require('jquery')

var Actions = module.exports = function(context){
    var Events = {},
    config = {//全局选项
        //newData : 只使用外部数据，将配置数据置空(副本)
        //reverse : {}
        //data
        _data : {},//传递附加数据
        type : 'post',
        dataType : 'json'
    };
    
    function parseConf(conf){
        for( var i in conf ){
            if( i=='reverse' || conf.reverse[i] ){
                continue;
            }
            conf.reverse[i] = conf[i];
        }
    }

    //创建action
    function Action(name, options){
        this.name = name
        this.options = options
        this.init()
    }
    Action.prototype = {
        init () {
            //添加自定义事件
            this.fetchBeforeEvent = context.addEventQueue.call(this, 'onFetchBefore')
            this.fetchEvent = context.addEventQueue.call(this, 'onFetch')
            this.fetchCompleteEvent = context.addEventQueue.call(this, 'onFetchComplete')
        }
    }
    const eventsType = ['onFetchBefore', 'onFetch', 'onFetchComplete'];
    //通过action.config().onFetchBefore来添加一些全局事件 事件会保存在Action.events相应的数组中 等添加action时再绑定事件到action
    Action.events = {}
    eventsType.forEach(e=>{
        Action.events[e] = []
    })

    return {
        //配置默认选项
        config : function(options){
            config = $.extend(true, config, options);

            var eventExports = {};
            eventsType.forEach(e=>{
                eventExports[e] = fn=>{
                    //添加事件到队列中
                    Action.events[e].push(fn)
                    //已创建的action 绑定一次
                    for( var i in Events ){
                        Events[i][e](fn)
                    }
                    
                    return eventExports
                }
            })
            return eventExports
        },
        //添加action
        add : function(name, options){
            options = $.extend(true, {}, config, options);
            options.reverse && parseConf(options);
            var action = Events[name] = new Action(name, options)

            var events = $.extend(true, {}, Action.events);

            //绑定全局添加的事件
            for( var i in events ){
                var f, fns = events[i]
                while( f = fns.shift() ){
                    action[i](f)
                }
            }
            return action
        },
        get : function(name){
            return Events[name]
        },
        //绑定事件
        on : function(action, options){
            var self = this
            if( $.type(action)=='object' ){//批量添加
                for( var i in action ){
                    self.on(i, action[i]);
                }
                return;
            }
            
            options = options || {};        
            var target = $(typeof options.target=='string' ? '#'+options.target : options.target)

            if( typeof action!='string' || !target.length ){
                return;
            }
            target.on('click', function(){
                //dom上使用data-state属性标示初始状态，如已关注标示为1,否则为0或不标示
                self.trigger( action, $.extend( {}, options, {target:this, state:$(this).data('state')} ));
                return this.tagName.toLowerCase()=='input' ? true : false;
            })
            return Events[action]
        },
        //触发事件
        trigger : function(action, options){
            if( typeof action!='string' ){
                //无动作名则为临时动作，只有一个参数options
                options = action;
            }
            var _action = Events[action]
            
            var _config = _action ? _action.options : config,
                conf, data, reverse, target;
            
            options = options || {};
            target = options.target;
            
            if( target && $(target).data('ajaxState') ){
                return;
            }  
            if( reverse = _config.reverse ){//是否执行反向动作
                reverse = $(target).data('state') ? true : false;//初始状态
                if( options.reverse ){
                    parseConf(options);
                    options = reverse ? options.reverse : options;
                }
            }
            conf = $.extend(true, {}, reverse ? _config.reverse : _config);//创建全局配置的副本
            
            var data_outer = options.data
            var data_conf = conf.data
            if (typeof data_outer == 'function') {//外部数据
                data_outer = data_outer.call(target, conf);
            }

            conf = $.extend(true, conf, options); //合并得到最终选项 

            if (options.newData) {
                //只使用外部数据，不使用配置数据
                data_conf = null;
            }else{
                //配置数据
                var data1, data2
                if( _action && typeof data_conf == 'function' ){
                    //已配置的action data和全局的data要分别取
                    data1 = data_conf.call(target, conf);
                }else{
                    //未配置的action 只取全局data
                }
                if (typeof config.data == 'function' && data_conf!==config.data){
                    //action配置时无data 就会继承全局配置的data函数 导致同一函数执行2次
                    data2 = config.data.call(target, conf);
                }
                data_conf = $.extend(true, data2, data1)
            }
            conf.data = $.extend(true, data_conf, data_outer)
                        
            target = $(target);

            //如果需要post跨域的情况  需要在onFetchBefore事件中阻止ajax提交 在post对应的success中调用conf._callback
            conf._callback = json=>{       
                target.data('ajaxState', null)[0].disabled = false;
                if( json.status == 1 && _config.reverse ){//还原反向动作状态
                    conf.state = _config.state = reverse ? null : 1;
                    target.data('state', conf.state);
                }
                _action && _action.fetchCompleteEvent.complete(json, conf)
            }

            if( _action && _action.fetchBeforeEvent.complete(conf)===false ){
                return _action
            }        

            
            target.data('ajaxState', true)[0].disabled = true;    
            
            var promise1 = $.ajax(conf)
            var promise2 = _action && _action.fetchEvent.complete(promise1, conf)
            var promise = promise2 || promise1

            promise = promise.then(conf._callback).fail(e=>conf._callback({error:e.statusText}));
            
            return promise;
        }
    }
}

