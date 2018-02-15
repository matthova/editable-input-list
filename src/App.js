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
    this.typeTimeoutDelay = 2000; // Time delay before saving typing

    autobind(this);
  }

  componentDidMount() {
    // Save the list to local storage before closing
    window.addEventListener('unload', ev => {
      this.saveState();
    });
  }

  saveState() {
    localStorage.setItem('list', this.state.text.join('\n'));
  }

  // Called whenever a character is typed
  handleChange(e, i) {
    // Update the input item when text is added
    e.preventDefault();
    const text = Object.assign([], this.state.text);
    text[i] = text[i].substring(0, 5) + e.target.value;
    this.setState({ text });

    // After 2 seconds, update the state, even if a new line isn't hit
    if (this.typeTimeout != null) {
      clearTimeout(this.typeTimeout);
    }
    this.typeTimeout = setTimeout(() => {
      this.saveState();
      this.typeTimeout = null;
    }, this.typeTimeoutDelay);
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
        this.saveState();
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
          this[inputElement].setSelectionRange(originalLength - 5, originalLength - 5);
          this.saveState();
        });
      }
      // On up arrow, move cursor up
    } else if (key === 38 && i > 0) {
      e.preventDefault();
      const inputElement = 'input' + (i - 1);
      this[inputElement].focus();
      // On down arrow, move cursor down
    } else if (key === 40 && i < this.state.text.length - 1) {
      e.preventDefault();
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
      this.saveState();
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
                  onBlur={e => {
                    this.saveState();
                  }}
                  ref={ref => (this['input' + i] = ref)}
                />
                <button
                  onClick={e => {
                    this.handleDelete(e, i);
                  }}
                  style={{ background: 'red', color: 'white' }}
                >
                  x
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
}

export default App;
