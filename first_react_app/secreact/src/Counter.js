import React, { Component } from 'react';

const buttonStyle = {
  margin: '10px'
};

class Counter extends Component {      //声明组件

  constructor(props) {
    // console.log('enter constructor: ' + props.caption);
    super(props);     //调用父类的构造函数
    this.onClickIncrementButton = this.onClickIncrementButton.bind(this);
    this.onClickDecrementButton = this.onClickDecrementButton.bind(this);
    this.state = {count: props.initValue}       //初始化值，二元运算
  }


  componentWillReceiveProps(nextProps) {
    console.log('enter componentWillReceiveProps ' + this.props.caption)
  }

  componentWillMount() {    //组件将要挂载
    console.log('enter componentWillMount ' + this.props.caption);
  }

  componentDidMount() {      //已经加载完成
    console.log('enter componentDidMount ' + this.props.caption);
  }

  onClickIncrementButton() {
    this.setState({count: this.state.count + 1});    //this.setState更新state值
  }

  onClickDecrementButton() {
    this.setState({count: this.state.count - 1});
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.caption !== this.props.caption) ||
           (nextState.count !== this.state.count);
  }
  
  render() {
    console.log('enter render ' + this.props.caption);
    const {caption} = this.props;        //通过this.props获得传入caption的值
    return (
      <div>
        <button style={buttonStyle} onClick={this.onClickIncrementButton}>+</button>
        <button style={buttonStyle} onClick={this.onClickDecrementButton}>-</button>
        <span>{caption} count: {this.state.count}</span>
      </div>
    );
  }
}

// Counter.propTypes = {     //组件属性检测
//   caption: React.PropTypes.string.isRequired,
//   initValue: React.PropTypes.number
// };

Counter.defaultProps = {  //设定默认值
  initValue: 1
};

export default Counter;

