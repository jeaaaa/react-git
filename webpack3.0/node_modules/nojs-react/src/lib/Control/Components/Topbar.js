/**
 * topbar
 */
import nj, {React, utils} from '../../'
const {joinClass} = utils

class Topbar extends React.Component{
    render () {
        let {items} = this.props
        items.forEach(item=>{
            item.index = item.index || 0
        })
        items.sort((a,b)=>a.index>b.index)
        let topbarLeft = items.filter(item=>item.align=='left')
        let topbarRight = items.filter(item=>item.align=='right' || !item.align)

        let getItem = ({content, type, handle}, i)=>{
            let options = {key:i, className:joinClass('item', type && 'item-'+type), onClick:handle}
            return typeof content=='string'
                ? <div {...options} dangerouslySetInnerHTML={{__html:content}}></div>
                : typeof content=='function' ? content(options, this) || null : <div {...options}>{content}</div>
        }
        return <div className="grid-topbar">
            <div className="_inner clearfix">
                <div className="fl l">
                    {topbarLeft.map(getItem)}
                </div>
                <div className="fr r">
                    {topbarRight.map(getItem)}
                </div>
            </div>
        </div> 
    }
}

module.exports =  Topbar