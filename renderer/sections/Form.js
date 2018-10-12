const IpcRenderer = require('../IpcRenderer')

class Form extends IpcRenderer {
  constructor(name) {
    super(name)
  }
  addEvtsListener() {
    document
      .querySelector('.project-add-btn')
      .addEventListener('click', this.createProject)
  }
  createProject() {
    const Project = analog.db.get('projects')
    const { value } = document.querySelector('.project-name')
    if (!value) {
      alert('project name required.')
      return
    }
    const p = Project.find({ name: value }).value()
    if (p) {
      alert('project already exists')
      return
    }
    Project.push({
      name: value,
      analogs: {}
    }).write()
    ipc.send('bounce_update_back', { receiver: 'dashboard' })
    ipc.send('bounce_update_back', { receiver: 'ticker' })
  }
  render() {
    document.querySelector('.form-container').innerHTML = `
    <input placeholder='project name' class='project-name' />
    <button class='project-add-btn'>add</button>    
    `
  }
}

module.exports = Form
