

export const HsbToRgb = function (H, S, B) {
    //hsb模式转换为rgb模式
    var rgb = { R: 0, G: 0, B: 0 };
    H = H >= 360 ? 0 : H;
    S /= 100;
    B /= 100;
    if (S == 0) {
        rgb.R = B * 255;
        rgb.G = B * 255;
        rgb.B = B * 255;
    } else {
        var i = Math.floor(H / 60) % 6;
        var f = H / 60 - i;
        var p = B * (1 - S);
        var q = B * (1 - S * f);
        var t = B * (1 - S * (1 - f));
        switch (i) {
            case 0:
                rgb.R = B, rgb.G = t, rgb.B = p;
                break;
            case 1:
                rgb.R = q;rgb.G = B;rgb.B = p;
                break;
            case 2:
                rgb.R = p;rgb.G = B;rgb.B = t;
                break;
            case 3:
                rgb.R = p;rgb.G = q;rgb.B = B;
                break;
            case 4:
                rgb.R = t;rgb.G = p;rgb.B = B;
                break;
            case 5:
                rgb.R = B;rgb.G = p;rgb.B = q;
                break;
        }
        rgb.R = rgb.R * 255;
        rgb.G = rgb.G * 255;
        rgb.B = rgb.B * 255;
    }

    //rgb.R = Math.round(rgb.R);
    //rgb.G = Math.round(rgb.G);
    //rgb.B = Math.round(rgb.B);
    return rgb;
};

export const RgbToHsb = function (R, G, B) {
    //rgb模式转换为hsb模式
    var var_Min = Math.min(Math.min(R, G), B),
        var_Max = Math.max(Math.max(R, G), B),
        hsb = { H: 0, S: 0, B: 0 },
        var_R,
        var_G,
        var_B;
    if (var_Min == var_Max) {
        hsb.H = 0;
    } else if (var_Max == R && G >= B) {
        hsb.H = 60 * ((G - B) / (var_Max - var_Min));
    } else if (var_Max == R && G < B) {
        hsb.H = 60 * ((G - B) / (var_Max - var_Min)) + 360;
    } else if (var_Max == G) {
        hsb.H = 60 * ((B - R) / (var_Max - var_Min)) + 120;
    } else if (var_Max == B) {
        hsb.H = 60 * ((R - G) / (var_Max - var_Min)) + 240;
    }
    if (var_Max == 0) {
        hsb.S = 0;
    } else {
        hsb.S = 1 - var_Min / var_Max;
    }
    var_R = R / 255;
    var_G = G / 255;
    var_B = B / 255;
    hsb.B = Math.max(Math.max(var_R, var_G), var_B);
    hsb.H = hsb.H >= 360 ? 0 : hsb.H;

    //hsb.H = hsb.H;
    hsb.S = hsb.S * 100;
    hsb.B = hsb.B * 100;
    return hsb;
};

export const RgbToHex = function (R, G, B, prefix) {
    //rgb转16进制 prefix是否带#
    var hex,
        strHex = '',
        color = [Math.round(R), Math.round(G), Math.round(B)];
    for (var i = 0; i < color.length; i++) {
        hex = Number(color[i]).toString(16);
        if (hex.length == 1) {
            hex = '0' + hex;
        }
        strHex += hex;
    }
    prefix && (strHex = '#' + strHex);
    return strHex;
};

export const HexToRgb = function (hex) {//16进制转rgb
    let color = dealColor(hex)
    if( !color ){
        return hex
    }
    // var color = String(hex).toLowerCase().replace(/#/, ''),
    //     reg = /^([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/,
    //     sColorNew = "",
    let sColorChange = [];
    //处理六位的颜色值 #336699
    for (var i = 0; i < 5; i += 2) {
        sColorChange.push(parseInt("0x" + color.slice(i, i + 2)));
    }
    return { R: sColorChange[0], G: sColorChange[1], B: sColorChange[2] };
};

export const dealColor = color=>{
    color = String(color).toLowerCase().replace(/#/, '')
    let reg = /^([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
    if( !color || !reg.test(color) ){
        return
    }
    if( color.length==3 ){
        let realColor = ''
        for (var i = 0; i < 3; i++) {
            realColor += color.slice(i, i + 1) + color.slice(i, i + 1);
        }
        color = realColor
    }
    return color
}