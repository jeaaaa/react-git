'use strict';

/**
 * 移动端适配
 */
var docEl = document.documentElement;
var devicePixelRatio = window.devicePixelRatio;

var getDeviceWidth = function getDeviceWidth() {
    var width = docEl.getBoundingClientRect().width;
    if (width / dpr > 540) {
        width = 540 * dpr;
    }
    var rem = width / 10;
    docEl.style.fontSize = rem + 'px';
    return rem;
};

var isAndroid = window.navigator.appVersion.match(/android/gi);
var isIPhone = window.navigator.appVersion.match(/iphone/gi);
var dpr = void 0;
if (isIPhone) {
    if (devicePixelRatio >= 3) {
        dpr = 3;
    } else if (devicePixelRatio >= 2) {
        dpr = 2;
    } else {
        dpr = 1;
    }
} else {
    dpr = 1;
}
var scale = 1 / dpr;

docEl.setAttribute('data-dpr', dpr);

var metaEl = document.querySelector('meta[name="viewport"]');
if (!metaEl) {
    metaEl = document.createElement('meta');
    metaEl.setAttribute('name', 'viewport');
    metaEl.setAttribute('content', 'width=device-width,initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
    if (docEl.firstElementChild) {
        docEl.firstElementChild.appendChild(metaEl);
    } else {
        var wrap = document.createElement('div');
        wrap.appendChild(metaEl);
        document.write(wrap.innerHTML);
    }
    document.write('<style>body{font-size:' + 12 * dpr + 'px}</style>');
}

var tid = void 0;
window.addEventListener('resize', function () {
    clearTimeout(tid);
    tid = setTimeout(getDeviceWidth, 300);
}, false);
window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
        clearTimeout(tid);
        tid = setTimeout(getDeviceWidth, 300);
    }
}, false);

function checkFontsize() {
    var tags = document.body.querySelectorAll('[style*="font-size"], [style*="line-height"]');
    for (var i = 0, n = tags.length; i < n; i++) {
        var el = tags[i];
        var style = el.getAttribute('style');
        var testFont = /font-size\s?:\s?([\d\.]+)px/.exec(style);
        if (testFont && testFont[1]) {
            el.style.fontSize = testFont[1] * dpr + 'px';
        }
        var testLine = /line-height\s?:\s?([\d\.]+)px/.exec(style);
        if (testLine && testLine[1]) {
            el.style.lineHeight = testLine[1] * dpr + 'px';
        }
    }
}

if (document.readyState === 'complete') {
    document.body.style.fontSize = 12 * dpr + 'px';
} else {
    document.addEventListener('DOMContentLoaded', function (e) {
        document.body.style.fontSize = 12 * dpr + 'px';
        dpr > 1 && checkFontsize();
    }, false);
}

getDeviceWidth();