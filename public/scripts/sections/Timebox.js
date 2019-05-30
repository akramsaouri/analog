const IpcRenderer = require('../IpcRenderer')

class Timebox extends IpcRenderer {
  constructor(name) {
    super(name)
    this.presetValues = [
      {
        label: '30min',
        value: 30
      },
      {
        label: '1hour',
        value: 60
      },
      {
        label: '15min',
        value: 15
      }
    ]
    this.selectors = {
      input: 'input[name="timebox_input"]',
      checkedRadio: 'input[name="timebox_radio"]:checked'
    }
    this.getValue = this.getValue.bind(this)
  }
  fetch() {
    this.timer = analog.db.get('timer').value()
  }
  addEvtsListener() {
    if (this.timer.timeboxed) {
      document
        .querySelector(this.selectors.input)
        .addEventListener('focus', () => {
          const elm = document.querySelector(this.selectors.checkedRadio)
          if (elm) elm.checked = false
        })
    }
  }
  getValue() {
    return (
      (document.querySelector(this.selectors.checkedRadio) || {}).value ||
      (document.querySelector(this.selectors.input) || {}).value ||
      null
    )
  }
  render() {
    const disabledControl = this.timer.active ? 'disabled' : ''
    const listHtml = this.presetValues
      .map(
        (x, i) => `
                <label for='preset-${i}' class='timebox-label'>${
          x.label
        }</label>
                <input type='radio' id='preset-${i}' name='timebox_radio' class='timebox-radio' value='${
          x.value
        }' ${disabledControl} />
            `
      )
      .join('')
    document.querySelector('.timebox-container').innerHTML = this.timer
      .timeboxed
      ? `
                <div class='timebox-controls'>
                    ${listHtml}
                    <label for='timebox-input' class='timebox-label'>custom</label>
                    <input placeholder='(in min)' id='timebox-input' name='timebox_input' class='timebox-input' type='number' ${disabledControl} />
                </div>
            `
      : ''
  }
}

module.exports = Timebox
