import React, { Component } from 'react';
import autobind from 'react-autobind';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    // Load local save data, if it's there
    const list = localStorage.getItem('list');

    this.state = {
      text: (list != null && list.split('\n')) || ['<<0>>'],
    };

    this.checkboxReg = /<<(\d)>>/;

    autobind(this);
  }

  componentDidMount() {
    // Save the list to local storage before closing
    window.addEventListener('unload', ev => {
      localStorage.setItem('list', this.state.text.join('\n'));
    });
  }

  handleChange(e, i) {
    // Update the input item when text is added
    e.preventDefault();
    const text = Object.assign([], this.state.text);
    text[i] = text[i].substring(0, 5) + e.target.value;
    this.setState({ text });
  }

  handleDelete(e, i) {
    const text = Object.assign([], this.state.text);
    text.splice(i, 1);
    // If we delete all of the items, keep a blank input
    if (text.length === 0) {
      text.push('<<0>>');
    }
    this.setState({ text });
  }

  handleKeyPress(e, i) {
    // Handle line breaks
    if (e.key === 'Enter') {
      const text = Object.assign([], this.state.text);

      const splitElement = this['input' + i];
      const startPos = splitElement.selectionStart;
      const endPos = splitElement.selectionEnd;

      const checked = text[i].substring(0, 5);
      const textArea = text[i].substring(5);
      const beginning = textArea.substring(0, startPos);
      // The middle area will be deleted
      const middle = textArea.substring(startPos, endPos);
      const end = '<<0>>' + textArea.substring(endPos, text[i].length);

      text[i] = checked + beginning;
      text.splice(i + 1, 0, end);

      this.setState({ text }, () => {
        this['input' + (i + 1)].focus();
        localStorage.setItem('list', this.state.text.join('\n'));
      });
    }
  }

  handleKeyDown(e, i) {
    const key = e.keyCode || e.charCode;
    // if the user hits backspace
    if (key === 8 || key === 46) {
      const text = Object.assign([], this.state.text);
      const backItem = this['input' + i];
      const startPos = backItem.selectionStart;
      const endPos = backItem.selectionEnd;

      // If the cursor is at the beginning
      // And it's not highlighted
      // and it's not the first item
      if (startPos === 0 && endPos === 0 && i !== 0) {
        // backspace can cause the browser to go back in history
        e.preventDefault();
        const originalLength = text[i - 1].length;
        const extra = text.splice(i, 1)[0].replace(this.checkboxReg, '');
        text[i - 1] += extra;
        this.setState({ text }, () => {
          const inputElement = 'input' + (i - 1);
          this[inputElement].focus();
          this[inputElement].setSelectionRange(originalLength, originalLength);
          localStorage.setItem('list', this.state.text.join('\n'));
        });
      }
    } else if (key === 38 && i > 0) {
      const inputElement = 'input' + (i - 1);
      this[inputElement].focus();
    } else if (key === 40 && i < this.state.text.length - 1) {
      const inputElement = 'input' + (i + 1);
      this[inputElement].focus();
    }
    return false;
  }

  handleToggleChecked(e, i) {
    const text = Object.assign([], this.state.text);
    text[i] = e.target.checked
      ? text[i].replace('<<0>>', '<<1>>')
      : text[i].replace('<<1>>', '<<0>>');

    this.setState({ text }, () => {
      localStorage.setItem('list', this.state.text.join('\n'));
    });
  }

  render = () => {
    return (
      <div>
        {/* <div>{this.state.text.join('\n')}</div> */}
        <div>
          {this.state.text.map((line, i) => {
            const checkboxMatch = line.match(this.checkboxReg);
            const checked = Array.isArray(checkboxMatch) && checkboxMatch[1] === '1' ? true : false;
            return (
              <div key={i}>
                <input
                  type="checkbox"
                  onChange={e => {
                    this.handleToggleChecked(e, i);
                  }}
                  checked={checked}
                />
                <button
                  onClick={e => {
                    this.handleDelete(e, i);
                  }}
                >
                  x
                </button>
                <input
                  value={line.replace(this.checkboxReg, '')}
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
      </div>
    );
  };
}

export default App;
