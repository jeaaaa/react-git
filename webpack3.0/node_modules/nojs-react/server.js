var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
var port = 4000

new WebpackDevServer(webpack(config), {
  publicPath: 'http://127.0.0.1:'+port+'/docs/dist/',
  hot: true,
  inline: true,
  noInfo: false,
  historyApiFallback: true
})
.listen(port, '0.0.0.0', function (err, result) {
  if (err) {
    console.log(err);
  }
  console.log('Listening at localhost:'+port);
});



// const taobaoApi = function(data, callback){
//     //http://open.taobao.com/docs/api.htm?apiId=28625
//     var client = new TopClient({
//       'appkey': '23625628',
//       'appsecret': '555ce3296f9249e43107c3209b628970',
//       'REST_URL': 'http://gw.api.taobao.com/router/rest'
//     });
    
//     var pid = data.pid.split('_')
//     client.execute('taobao.tbk.privilege.get', {
//         'item_id':data.itemid,//'530538710076',
//         'adzone_id':pid[3],//'74486047',
//         'platform':1,
//         'site_id':pid[2],//'22474057',
//         'session' : window.global.access_token              
//     })
//     .then(function(result){
//         callback(null, result)
//     })
//     .catch(function(error){
//         callback(error)
//     })
// }
// taobaoApi({
//     pid : 'mm_10560722_23172164_76850695',
//     itemid : '556506259838'
// }, function(error, result) {
//     console.log(error, result)
// })