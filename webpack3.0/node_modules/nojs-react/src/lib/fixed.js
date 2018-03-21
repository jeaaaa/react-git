/*
 * 滚动条滚动到某位置时固定某元素
 */
var $ = require('jquery')
var nj = require('./nojs-react') 
var {React,ReactDOM,utils} = nj
var win = $(window)
var ie6 = false


//固定元素在某个位置
//****注：如果element内部元素存在margin溢出的话要用hack对element元素清除 否则element.outerHeight()会计算出错
function fixed(element, options){
    element = typeof element=='string' ? $('#'+element) : element;
    if( !element || !element.length ){
        return;
    }
    options = options || {};
    options.element = element;
    element[0].$fixed = options
    element.data('fixedOptions', options);
    options.wrap = $(options.wrap || win);
    
    !fixed.init && fixed.bind(options);  
    
    //options.name = options.name || 'page_fixed';
    options.offset = options.offset || 0;
    options.top = element.offset().top;//初始位置top
    options.state = 0;//3种状态
    options.Float = /absolute|fixed/.test(element.css('position'));//浮动元素
    options.style = options.element.attr('style') || '';//保留原style
    //options.width = element.width();
    
    var width = element.outerWidth(), height = element.outerHeight(true);
    
    /*
     * options.until：直到遇到某个对象时停止固定  
     * @element:底部触碰到该对象时停止
     * @offset:距离element多远时停止 默认0
     * @scroll:从开始固定算起 滚动过的距离超过该值 停止
     */

    var un = options.until;
    if( un ){
        un.element = utils.dom(un.element)
        if( (un.element && un.element.length) || un.scroll ){
            un.offset = un.offset || 0;
            un.top = un.scroll ? (un.scroll+options.top) : (un.element.offset().top - un.offset); //until.element的位置可能会不断发生变化，所以需要在scroll事件中更新
            un.bottom = height;
        }else{
            options.until = null
        }
    }    
    
    //添加一个占位元素
    if( !options.Float ){
        options.holder = $('<div class="nj_fix_holder"></div>').insertBefore(element);
        options.holderStyle = {width : '1px', height : height};
    }
    
    fixed.item.push(options);
    if( options.autoWidth ){
        options.width = options.element.parent().width() - parseInt(options.element.css('padding-left')) - parseInt(options.element.css('padding-right'));
    }
    fixed.scroll();

}
fixed.item = [];

fixed.scroll = function(resize){
    var _top, un, top, i, n, options;
        
    for( i=0, n = fixed.item.length; i<n; i++ ){
        
        options = fixed.item[i];
        _top = options.wrap.scrollTop();
        un = options.until;
        top = options.top


        function setSize(){
            var style = {
                'top' : ie6 ? options.offset + _top : wraptop + options.offset,
                'position' : ie6 ? 'absolute' : 'fixed'
            }
            if( options.autoWidth ){
                style.width = options.width
            }
            options.element.css(style).addClass('nj_fixed');
        }

        var wraptop = options.wrap.offset() ? options.wrap.offset().top : 0

        if( _top > top-wraptop-options.offset ){
            var h = options.element.outerHeight(true)
            if( !options.state && options.holder ){//更新holderStyle 页面布局变化会影响element高度                    
                options.holderStyle.height = h;
                options.holder.css(options.holderStyle);                    
            }
            
            if( un ){
                un.bottom = h;
                un.top = un.scroll ? (un.scroll+options.top+h) : (un.element.offset().top - un.offset);
                if( un.bottom + options.offset + _top >= un.top ){
                    options.state = 2;
                    options.element.css({
                        'position' : 'absolute',
                        'top' : un.top-un.bottom
                    });
                    var parentFixed = options.element[0].parentNode.$fixed
                    if( parentFixed ){
                        parentFixed.element.attr('style', options.style);
                    }
                    un.enter && un.enter(options.element);
                    continue;
                }else if( options.state == 2 ){
                    options.element.attr('style', options.style);
                    un.leave && un.leave(options.element);
                }
            }
            
            if( options.state!=1 ){
                setSize();
                
                options.state = 1;
                options.start && options.start();
            }
            if( resize && options.autoWidth ){
                setSize();
            }
        }else if(options.state){
            
            options.state = 0;
            if( options.style ){
                options.element.attr('style', options.style);
            }else{
                options.element.removeAttr('style');
            }
            options.element.removeClass('nj_fixed');
            options.holder && options.holder.removeAttr('style');
            
            options.end && options.end();
        }else{
            //还未开始固定 继续获取其初始top
            top = options.top = options.element.offset().top;
        }
        
        options.callback && options.callback();
    }
}
fixed.bind = function(options){
    fixed.init = 1;
    options.wrap.on('scroll.nj_fixed,', function(){
        fixed.scroll();
    })
    options.wrap.on('resize.nj_fixed', function(){
        fixed.scroll(1);
    })
}

fixed.reset = function(wrap){
    fixed.item = [];
    fixed.init = null;
    wrap.off('scroll.nj_fixed');
}

module.exports = fixed;
