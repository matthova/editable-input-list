import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import autobind from 'react-autobind';

import random64String from './random64String';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.checkboxReg = /(\d)/;
    this.base64reg = /[\s\S]/;
    this.lineReg = /(\d)([\s\S]{8})/;
    this.typeTimeoutDelay = 2000; // Time delay before saving typing

    // Load local save data, if it's there
    const list = localStorage.getItem('list') || '0' + random64String(8);
    // const list = '0' + random64String(8);

    this.state = {
      text: this.loadItemArray(list),
    };

    autobind(this);
  }

  componentDidMount() {
    // Save the list to local storage before closing
    window.addEventListener('unload', ev => {
      this.saveState();
    });
  }

  loadItemArray(itemArrayString) {
    const itemArray = itemArrayString.split(this.lineReg);
    if (itemArray[0] === '') {
      itemArray.shift();
    }

    const objectArray = [];

    while (itemArray.length !== 0) {
      const items = itemArray.splice(0, 3);
      const newItem = this.createListArray(items);
      objectArray.push(newItem);
    }

    return objectArray;
  }

  createListArray(inputArray) {
    return {
      complete: inputArray[0] === '0' ? false : true,
      id: inputArray[1],
      item: inputArray[2] || '',
    };
  }

  createListItem(string) {}

  saveState() {
    const bigString = this.state.text
      .map(item => {
        return (item.complete ? '1' : '0') + item.id + item.item;
      })
      .join('');

    localStorage.setItem('list', bigString);
  }

  // Called whenever a character is typed
  handleChange(e, i, item) {
    // Update the input item when text is added
    e.preventDefault();
    const text = Object.assign([], this.state.text);
    text[i].item = e.target.value;
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

  handleDelete(e, i, item) {
    const text = Object.assign([], this.state.text);
    text.splice(i, 1);
    // If we delete all of the items, keep a blank input
    if (text.length === 0) {
      text.push('<<0>>');
    }
    this.setState({ text });
  }

  handleKeyPress(e, i, item) {
    // Handle line breaks
    if (e.key === 'Enter') {
      const text = Object.assign([], this.state.text);

      const splitElement = this['input' + i];
      const startPos = splitElement.selectionStart;
      const endPos = splitElement.selectionEnd;

      const checked = text[i].checked;
      const textArea = text[i].item;
      const beginning = textArea.substring(0, startPos);
      // The middle area will be deleted
      const middle = textArea.substring(startPos, endPos);
      const end = {
        complete: false,
        id: random64String(8),
        item: textArea.substring(endPos, text[i].length),
      };

      text[i].item = beginning;
      text.splice(i + 1, 0, end);

      this.setState({ text }, () => {
        const inputElement = 'input' + (i + 1);
        this[inputElement].focus();
        this[inputElement].setSelectionRange(0, 0);
        this.saveState();
      });
    }
  }

  handleKeyDown(e, i, item) {
    const key = e.keyCode || e.charCode;
    // if the user hits backspace
    const backItem = this['input' + i];
    const startPos = backItem.selectionStart;
    const endPos = backItem.selectionEnd;

    if (key === 8 || key === 46) {
      const text = Object.assign([], this.state.text);

      if (startPos === 0 && endPos === 0 && i !== 0) {
        // If the cursor is at the beginning
        // And it's not highlighted
        // and it's not the first item
        // backspace should delete the line and collapse any info onto the previous line

        // backspace can cause the browser to go back in history
        e.preventDefault();
        const originalLength = text[i - 1].item.length;
        const extra = text.splice(i, 1)[0].item;
        text[i - 1].item += extra;
        this.setState({ text }, () => {
          const inputElement = 'input' + (i - 1);
          this[inputElement].focus();
          this[inputElement].setSelectionRange(originalLength, originalLength);
          this.saveState();
        });
        // Delete the first line, if there are lines after it
      } else if (i === 0 && startPos === 0 && endPos === 0 && text.length > 1) {
        text.splice(0, 1);
        this.setState({ text });
        // Reset the checkbox if the first line is empty
      } else if (i === 0 && text[0].item.length === 0 && text[0].complete === true) {
        text[0].complete = false;
        this.setState({ text });
      }
    } else if (key === 38 && i > 0) {
      // On up arrow, move cursor up
      e.preventDefault();
      const inputElement = 'input' + (i - 1);
      this[inputElement].focus();
    } else if (key === 40 && i < this.state.text.length - 1) {
      // On down arrow, move cursor down
      e.preventDefault();
      const inputElement = 'input' + (i + 1);
      this[inputElement].focus();
      //
    } else if (key === 37 && i > 0 && startPos === 0 && endPos === 0) {
      e.preventDefault();
      const inputElement = 'input' + (i - 1);
      this[inputElement].focus();
      this[inputElement].setSelectionRange(
        this.state.text[i - 1].item.length,
        this.state.text[i - 1].item.length,
      );
    } else if (
      // On arrow right, if text isn't highlighted
      // and there's an item below, move cursor down
      key === 39 &&
      i < this.state.text.length - 1 &&
      startPos === this.state.text[i].item.length &&
      endPos === this.state.text[i].item.length
    ) {
      e.preventDefault();
      const inputElement = 'input' + (i + 1);
      this[inputElement].focus();
      this[inputElement].setSelectionRange(0, 0);
    }

    // On left arrow, love cursor up
    return false;
  }

  handleToggleChecked(e, i, item) {
    const text = Object.assign([], this.state.text);
    text[i].complete = !text[i].complete;

    this.setState({ text }, () => {
      this.saveState();
    });
  }

  render = () => {
    return (
      <div>
        <div>
          {this.state.text.map((item, i) => {
            return (
              <div key={item.id}>
                <input
                  type="checkbox"
                  onChange={e => {
                    this.handleToggleChecked(e, i, item);
                  }}
                  checked={item.complete}
                />
                <input
                  value={item.item}
                  onChange={e => {
                    this.handleChange(e, i, item);
                  }}
                  onKeyPress={e => {
                    this.handleKeyPress(e, i, item);
                  }}
                  onKeyDown={e => {
                    this.handleKeyDown(e, i, item);
                  }}
                  onBlur={e => {
                    this.saveState();
                  }}
                  ref={ref => (this['input' + i] = ref)}
                />
                <button
                  onClick={e => {
                    this.handleDelete(e, i, item);
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
