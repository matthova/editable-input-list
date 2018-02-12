import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable';
import autobind from 'react-autobind';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ['Hello World'],
      focusIndex: 0,
    };
  }

  handleChange = (e, i) => {
    e.preventDefault();
    const text = Object.assign([], this.state.text);
    text[i] = e.target.value;
    this.setState({ text });
  };

  handleKeyPress(e, i) {
    if (e.key === 'Enter') {
      const text = Object.assign([], this.state.text);

      const splitElement = this['input' + i];
      const startPos = splitElement.selectionStart;
      const endPos = splitElement.selectionEnd;

      const beginning = text[i].substring(0, startPos);
      const middle = text[i].substring(startPos, endPos);
      const end = text[i].substring(endPos, text[i].length);

      text[i] = beginning;
      text.splice(i + 1, 0, end);

      this.setState({ text }, () => {
        this['input' + (i + 1)].focus();
      });
    }
  }

  render = () => {
    return (
      <div>
        <div style={{ background: '#f5f5f5' }}>{this.state.text.join('\n')}</div>
        {this.state.text.map((line, i) => {
          return (
            <div>
              <input
                key={i}
                value={line}
                onChange={e => {
                  this.handleChange(e, i);
                }}
                onKeyPress={e => {
                  this.handleKeyPress(e, i);
                }}
                ref={ref => (this['input' + i] = ref)}
              />
            </div>
          );
        })}
      </div>
    );
  };
}

export default App;
