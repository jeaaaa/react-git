import {utils} from '../nojs-react'
import $ from 'jquery'
import Lunar from './lunar'

const {dateParse} = utils

let dateCache = {}

//获取某月的数据
export const getMonthData = (params, options)=>{
    let year
    let month
    let date
    let _date
    let hours = 0
    let minutes = 0
    let seconds = 0
    let type = $.type(params)
    let key

    let {startWeekIndex} = options = options || {}

    if( type=='object' ){
        year = params.year
        month = params.month
        // key = year + month

    }else if( type=='date'){
        _date = params

    }else if( !params ){
        _date = new Date()

    }else if( type=='string' || type=='number' ){
        params = type=='string' ? params.replace(/[\u4E00-\u9FA5]/g, '/') : params
        //字符串或时间戳
        _date = new Date(params)
    }
    
    if( _date ){
        // key = _date.getTime()
        year = _date.getFullYear() 
        month = _date.getMonth()+1
        date = _date.getDate()
        if( params ){
            hours = _date.getHours()
            minutes = _date.getMinutes()
            seconds = _date.getSeconds()
        }
    }   
    key = year + '-' + month
    // console.log(params, year, month)

    let cache = dateCache[key]
    if( cache ){
        if( params && _date ){//传入的具体日期时 更新date/hours等值
            return Object.assign({}, cache, {date, hours, minutes, seconds})
        }
        // return cache
        //当params传入的是对象时 也只返回年月日数据(除去date, hours, minutes)
        return {
            year : cache.year,
            month : cache.month,
            dates : cache.dates
        }
    }
    let days = getDays({year, month})
    let allDays = []

    for( let i=1; i<=days; i++ ){
        allDays.push({
            year, month,
            date : i,
            //星期
            day : new Date(year, month-1, i).getDay(),
            current : true,
            timestamp : new Date(year, month-1, i).getTime(),
            isToday : today.date==i && today.month==month && today.year==year 
        })
    }

    // let startWeekIndex = 1//起始星期索引
    let endWeekIndex = (startWeekIndex+6)%7//结束星期索引
    let startDay = allDays[0].day   //月初天星期数
    let endDay = allDays[days-1].day//月末天星期数

    //月初天不是周日
    if( startDay!=startWeekIndex ){
        let prevMonth = getNearMonth({year, month, step:-1})
        let prevDays = getDays(prevMonth)
        let i = 0
        //需补充的天数
        let n = startDay>startWeekIndex ? startDay-startWeekIndex : startDay+7-startWeekIndex
        // console.log(12,prevMonth, prevDays)
        while( i<n ){
            allDays.unshift({
                year : prevMonth.year,
                month : prevMonth.month,
                date : prevDays-i,
                prevMonth : true,
                timestamp : new Date(prevMonth.year, prevMonth.month-1, prevDays-i).getTime(),
                day : new Date(prevMonth.year, prevMonth.month-1, prevDays-i).getDay()
            })
            i++
        }
    }

    //未补齐至整6行
    if( allDays.length<42 ){    
        let nextMonth = getNearMonth({year, month, step:1})    
        let i = 0
        // endDay = endDay==6 ? -1 : endDay//月末是周6
        while( allDays.length<42 ){
            i++
            endDay++
            allDays.push({
                year : nextMonth.year,
                month : nextMonth.month,
                date : i,
                nextMonth : true,
                timestamp : new Date(nextMonth.year, nextMonth.month-1, i).getTime(),
                day : endDay==6 ? 0 : endDay+1
            })
        }
    }


    let data = dateCache[key] = {
        year, month, date, hours, minutes, seconds,
        dates : allDays
    }    
    return data
}

const d = new Date()

export let today = {
    date : d.getDate(),
    month : d.getMonth()+1,
    year : d.getFullYear()
}
today.day = new Date(today.year, today.month-1, today.date).getDay()

//获取某月的天数
export const getDays = ({year, month})=>{
    return new Date(year, month, 0).getDate()
}

//获取相邻月份 前n月或后n月
export const getNearMonth = ({year, month, step})=>{
    //年跨度
    let yearStep = step<0 ? Math.ceil(step/12) : Math.floor(step/12)
    //月跨度 除去整年数
    let monthStep = step%12

    year = parseInt(year)
    month = parseInt(month)

    year += yearStep
    month += monthStep

    if( month<1 ){
        month = 12 + month
        year--
    }else if( month>12 ){
        month %= 12
        year++
    }
    return {year, month}
}


export const parseNumber = num=>{
    num = parseInt(num) || 0
    return num<10 ? '0'+num : ''+num
}

/**
 * 获取一个自定义对象的时间戳 {year, month, date, hours, minutes, seconds}
 * length限制长度 如length=3则只取到天 后面都为0
 */
export const getTimestamp = (n, length)=>{
    length = !length || length<3 ? 3 : length
    return new Date(
        parseInt(n.year), 
        parseInt(n.month)-1, 
        parseInt(n.date), 
        length>3 && parseInt(n.hours)||0, 
        length>4 && parseInt(n.minutes)||0, 
        length>5 && parseInt(n.seconds)||0
    ).getTime()
}

// console.log(getNearMonth({year:2017,month:5, step:-4}))

// let data = Lunar.solar2lunar(2017,6,21)
// console.log(data)