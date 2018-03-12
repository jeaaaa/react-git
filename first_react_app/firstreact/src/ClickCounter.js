import React, { Component } from 'react';

class ClickCounter extends Component {           //新建组件

  constructor(props) {
    super(props);
    this.onClickButton = this.onClickButton.bind(this);
    this.state = {
      count: 0
    }
  }

  onClickButton() {
    this.setState({count: this.state.count + 1});      //状态改变值
  }

  render() {
    const counterStyle = {margin: '16px'}
    return (
      <div style={counterStyle}>
        <button onClick={this.onClickButton}>Click Me</button>
        <div>
          Click Count: <span id="clickCount">{this.state.count}</span>
        </div>
      </div>
    );
  }
}

export default ClickCounter;      //默认出口

