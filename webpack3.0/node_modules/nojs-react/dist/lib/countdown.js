'use strict';

/*
 * 倒计时
 * @nolure@vip.qq.com
 */
var $ = require('jquery');

function countdown(el, diff, options) {
    if (!diff) {
        return;
    }
    options = options || {};
    var format = options.format || '{dd}天{hh}时{mm}分{ss}秒';
    var fix = options.fix || '';

    var _key = {
        '0': { key: 'day', step: 24, index: 0 },
        '1': { key: 'hours', step: 60, index: 1 },
        '2': { key: 'minutes', step: 60, index: 2 },
        '3': { key: 'seconds', step: 10, index: 3 }
    };
    var keys = {
        'dd': _key[0],
        'hh': _key[1],
        'mm': _key[2],
        'ss': _key[3],

        'd': _key[0],
        'h': _key[1],
        'm': _key[2],
        's': _key[3]
    };

    var _exports = {};
    function GetTime() {
        var v = diff;
        var data = {};

        var day = data['day'] = parseInt(v / 60 / 60 / 24, 10);

        var v1 = v - day * 24 * 60 * 60;
        var hours = data['hours'] = parseInt(v1 / 60 / 60, 10);

        var v2 = v1 - hours * 60 * 60;
        var minutes = data['minutes'] = parseInt(v2 / 60, 10);

        var v3 = v2 - minutes * 60;
        var seconds = data['seconds'] = parseInt(v3, 10);

        var html = '';

        if (seconds < 0) {
            options.end && el.text(options.end);
            //倒计时结束 回调
            if (typeof options.timeup == 'function') {
                options.timeup();
            }
            return;
        }

        var lastindex;
        var str = format.replace(/\{([\w]{1,2})\}/g, function (a, b, c) {

            var key = keys[b];

            var val = data[key.key];

            if (lastindex == undefined) {
                lastindex = 0;

                var notshow = 0;
                while (lastindex < key.index) {
                    //若天没有显示 则换算成小时累加在hours上 其他同理
                    notshow += data[_key[lastindex].key];
                    notshow *= _key[lastindex].step;
                    lastindex++;
                }
                val += notshow;
            }

            //lastindex = k.index;


            // lastdata = val;

            while (b.length > String(val).length) {
                val = '0' + val;
            }
            return val;
        });
        // console.log(str)

        el.html(str + fix);

        diff -= 1;
        _exports.delay = setTimeout(GetTime, 1000);
    }
    GetTime();
    return _exports;
}

module.exports = countdown;