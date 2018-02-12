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

    autobind(this);
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

  handleKeyDown(e, i) {
    const key = e.keyCode || e.charCode;
    if (key == 8 || key == 46) {
      const text = Object.assign([], this.state.text);
      const backItem = this['input' + i];
      const startPos = backItem.selectionStart;
      const endPos = backItem.selectionEnd;
      if (startPos === 0 && endPos === 0 && i !== 0) {
        e.preventDefault();
        const originalLength = text[i - 1].length;
        const extra = text.splice(i, 1);
        text[i - 1] += extra[0];
        this.setState({ text }, () => {
          const inputElement = 'input' + (i - 1);
          this[inputElement].focus();
          this[inputElement].setSelectionRange(originalLength, originalLength);
        });
      }
    }
    return false;
  }

  render = () => {
    return (
      <div>
        <div style={{ background: '#f5f5f5' }}>{this.state.text.join('\n')}</div>
        {this.state.text.map((line, i) => {
          return (
            <div key={i}>
              <input
                value={line}
                onChange={e => {
                  this.handleChange(e, i);
                }}
                onKeyPress={e => {
                  this.handleKeyPress(e, i);
                }}
                onKeyDown={e => {
                  this.handleKeyDown(e, i);
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
