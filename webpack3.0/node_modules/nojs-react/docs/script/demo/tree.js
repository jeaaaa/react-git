import Tree, {LinkTree, MenuTree} from 'nj/tree'
import $ from 'jquery'
import nj, {React, render} from 'nj'
import 'nj/touch'

// eval(
//     function(p,a,c,k,e,d){
//         e=function(c){
//             return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))
//         };
//         if(!''.replace(/^/,String)){
//             while(c--){
//                 d[e(c)]=k[c]||e(c)
//             }
//             k=[function(e){return d[e]}];
//             e=function(){return'\\w+'};
//             c=1
//         };
//         while(c--){
//             if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}
//         }
//         return p
//     }('6 x(K){3 9,J=L 1v("(^| )"+K+"=([^;]*)(;|$)");7(9=e.1q.1k(J)){k 1m(9[2])}z{k\'\'}}6 u(v,G,17,u){k v.R(0,G-1)+u+v.R(17,v.1p)}3 C=8.h.p;3 5=x("5");7(5!=\'\'){5=1o("("+5+")");t=5.t;j=5.j;7(C.B(t+"/"+j)<0){I=u(C,1n,1l,t+"/"+j);8.h.1d=I}}(6(){(6(i,s,o,g,r,a,m){i[\'1r\']=r;i[r]=i[r]||6(){(i[r].q=i[r].q||[]).1u(1t)},i[r].l=1*L 1s();a=s.16(o),m=s.1w(o)[0];a.1j=1;a.N=g;m.1i.1h(a,m)})(8,e,\'1f\',\'//f.1g-V.4/V.1Q\',\'b\');3 1e=x(\'1Y\');3 9=1e.1X(\'|\');7(9[1]){b(\'T\',\'Q-P-1\',\'U\',{\'1S\':9[1]})}z{b(\'T\',\'Q-P-1\',\'U\')}3 D=18;3 O=18;6 w(){7(D)k;D=1V;7(O){3 d=e.16(\'1T\');d.N=1c;d.1x.1W=\'20\';e.S.1Z(d);8.1a(6(){e.S.1U(d);8.h.p=c},M)}z{8.h.p=c}}b(\'1R\',\'1D\',h.p);b(\'1b\',\'1E\');c=\'y://f.n.4/14.Y?X=W&Z=E%10%13%12.A.4%11%H.15\';3 F=1F.1C.1B();7(F.B(\'19/1y\')>0||F.B(\'19/1z\')>0){c=c.1d(\'y://f.n.4\',\'E://f.n.4\')}1c=\'y://f.n.4/14.Y?X=W&Z=E%10%13%12.A.4%11%H.15\';b(\'1b\',\'1A\',\'直达链接\',\'1G\',\'1H\',{\'1N\':\'1O\',\'1P\':\'1M\',\'1L\':\'1I\',\'1J\':\'A.4\',\'1K\':w});1a(w,M)})()',62,125,'|||var|com|zdm_track_info|function|if|window|arr||ga|smzdmhref|ifr|document|www||location||channel|return|||linkstars||href||||source|changeStr|allstr|redirect|getCookie|https|else|suning|indexOf|this_url|redirected|http|uaStr|start|2F617631265|go_url|reg|name|new|1000|src|is_amazon|27058866|UA|substring|body|create|auto|analytics|150_0_184__dDFgC2fdBnedc3Dv5yeV|feedback|php|to|3A|2F0000000000|2Fproduct|2F|click|html|createElement|end|false|chrome|setTimeout|send|smzdmhref1|replace|cookie_user|script|google|insertBefore|parentNode|async|match|30|unescape|26|eval|length|cookie|GoogleAnalyticsObject|Date|arguments|push|RegExp|getElementsByTagName|style|53|54|event|toLowerCase|userAgent|page|pageview|navigator|ca|fx|521|dimension30|hitCallback|dimension1|1515|dimension29|aa|dimension6|js|set|userId|iframe|removeChild|true|display|split|user|appendChild|none'.split('|'),
//         0,
//         {}
//     )
// )
export const init = ()=>{

    let options = {
        // rootID : 1,
        type : 'list',
        // selected:[1,5, 52, 101],
        // maxlevel : 3,
        onFetch : (promise, parentid) => {
            
            // console.log(parentid)
            return promise.then(json=>json.data)
        },
        // allowSelect : false,
        // checkbox : {
        //     name : 'ids[]'
        // },
        onChecked (node, e) {
            let parents = this.getParents(node)
            let children = this.getChildren(node)
            // parents.concat(children).forEach(item=>{
            //     item.checked = false
            // })
            children.forEach(item=>{
                item.checked = true
            })

            let {dataFormat} = this.state
            console.log(node, dataFormat)
        },
        // data : 'http://nolure.github.io/nojs-react/docs/menu.json?parent_id='
        data : [
            {"id":111, "name":"index", "parentid":0},
            {"id":1, "name":"Components", "parentid":0},
            {"id":3, "name":"Popup", "parentid":1},
            {"id":2, "name":"Mask", "parentid":1},
                {"id":21, "name":"Mask1", "parentid":2},
            
            {"id":5, "name":"Trees", "parentid":1},
                {"id":51, "name":"Tree", "parentid":5, "link":"tree/tree"},
                {"id":52, "name":"SelectTree", "parentid":5, "link":"tree/selectTree"},
                {"id":53, "name":"LinkTree", "parentid":5, "link":"tree/linkTree"},
                {"id":54, "name":"JsonTree", "parentid":5},
            {"id":6, "name":"Form Verify", "parentid":1, "link":"form/form", "demo":"form"},
            {"id":7, "name":"Switch", "parentid":1, "link":"switch"},
            {"id":8, "name":"Scroll", "parentid":1, "link":"scroll"},
            {"id":9, "name":"Face", "parentid":1, "link":"face"},
            {"id":10, "name":"Auto-complete", "parentid":1, "link":"autocomplete"},
            {"id":11,"name":"Datepicker", "parentid":1, "link":"datepicker"},
            {"id":12,"name":"Editor", "parentid":1, "link":"editor"}
        ]
    }

    class MenuPicker extends React.Component{
        constructor(props) {
            super(props)
            this.state = {
                selected : [],
                options : Object.assign({}, options, {data:[]})
            }
        }
        componentDidMount () {
            setTimeout(()=>this.setState({options}), 1000)

            MenuTree({
                trigger: "click",
                target: document.getElementById('menuTree'),
                data: options.data,
                onChange: (node,level)=>console.log(node,level)
            })
        }
        changeHandle (node, level) {
            let {tree} = this.refs
            this.setState({selected:tree.state.selected})
            console.log(node, level)
        }
        render () {
            let {selected} = this.state
            return <div>                
                {/*<Tree {...options}/>
                
                {selected.map(item=><span key={item.id} style={{marginRight:20}}>{item.name}</span>)}
                
                <LinkTree ref="tree" 
                    {...this.state.options}
                    trigger="hover"
                />*/}
                
            </div>
        }
    } 
    render(
        <MenuPicker />, 
        document.getElementById('treeLink')
    )
}
