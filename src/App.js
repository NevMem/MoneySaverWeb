import React, { Component } from 'react'
import './main.css'
import { connect } from 'react-redux'
import axios from 'axios'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import ModalPopup from './components/ModalPopup'
import ByTagSum from './components/ByTagSum'
import History from './components/History'
import api from './api'
import AddTagForm from './components/AddTagForm'
import Processing from './components/Processing'
import Profile from './components/Profile'
import CreateTemplate from './components/CreateTemplate'

class App extends Component {

  constructor(prps) {
    super(prps)
    this.state = {
      allTags: [],
      allWallets: [ 'Наличные', 'Сбербанк', 'ВТБ', 'АкБарс' ],
      templates: [],

      currentEditTag: 0,
      tagsLoadingState: 'loading',
      templatesLoadingState: 'loading',
      
      fromTemplate: false,
      
      add_panel_error: '', 
      add_panel_success: '', 

      modalVisible: false, 
      modalHeader: '-- TODO --', 
      modalType: '-- TODO --', 

      edit_name: '', 
      edit_value: 0, 
      edit_day: -1, 
      edit_year: -1, 
      edit_month: -1, 
      edit_hour: -1, 
      edit_minute: -1, 
      current_edit_record: undefined, 

      historyLenghts: [ 7, 21, 56, 28 * 4, 365 ],
      currentHistoryLengthIndex: 0,
      processing_info: '',
    }

    api.loadTags(this.props.token, this.props.login)
      .then(data => {
        this.setState({ allTags: data, tagsLoadingState: 'ready' }) 
      })
      .catch(err => {
        // TODO: normal notifications
        this.setState({
          tagsLoadingState: 'error'
        })
      })
    api.loadTemplates(this.props.token, this.props.login)
      .then(data => {
        this.setState({ templates: data })
      })
      .catch(err => {
        this.setState({ templatesLoadingState: 'error' })
      })
  }

  inputChange(event) {
    this.setState({ [event.target.id]: event.target.value })
    this.forceUpdate()
  }

  register(event) {
    event.preventDefault()
    alert('This functionality is not available now. Sorry ;)')
  }

  norm(value) {
    let ret = value + ''
    while (ret.length < 2)
      ret = '0' + ret
    return ret
  }

  getDate(date) {
    let ret = ''
    ret += this.norm(date.day) + '.' + this.norm(date.month) + '.' + date.year + ' '
    ret += date.hour + ':' + this.norm(date.minute)
    return ret
  }

  logout() {
    this.props.dispatch({ type: 'LOGGED_OUT', payload: {} })
    this.props.history.push('/')
  }

  allColors = [ '#7371fc', '#7678ED', '#04E762', '#FF206E', '#5C80BC', '#4CB944', '#A2D729', '#F0E100', '#F7CB15', '#F55D3E', '#85FF9E', '#E7BB41', '#F45B69', '#FBFF12' ]

  onTagClick(index, event) {
    this.setState({ currentTag: index })
  }

  onEditTagClick(index, event) {
    this.setState({ currentEditTag: index })
  }

  validNumber(str) {
    if (str.length === 0) return true

    let countDots = 0

    let first = 0
    if (str[0] === '-')
      first = 1
    for (let i = first; i < str.length; i++) {
      if (!(('0' <= str[i] && str[i] <= '9') || str[i] === '.')) {
        return false
      }
      if (str[i] === '.') countDots += 1
    }
    return countDots <= 1
  }

  numberChanger(event) {
    if (this.validNumber(event.target.value))
      this.setState({ [event.target.id]: event.target.value })
  }

  changeSelect(event) {
    let index = this.state.allWallets.indexOf(event.target.value)
    this.setState({ currentWallet: index })
  }

  addRecord(name, value, year, month, day, hour, minute, wallet, tag) {
    let { login, token } = this.props

    this.setState({
      add_panel_error: '',
      add_panel_success: '',
    })
    
    value = -value

    if (login && token && name && value !== undefined) {
      axios.post('/api/add', { 
        login: login, 
        token: token, 
        wallet: wallet, 
        tags: [ tag ], 
        date: { 
          year: parseInt(year, 10), 
          month: parseInt(month, 10), 
          day: parseInt(day, 10), 
          hour: parseInt(hour, 10), 
          minute: parseInt(minute, 10)
        }, 
        name: name, 
        value: value,
        daily: true
      })
      .then(data => data.data)
      .then(data => {
        console.log(data)
        if (data.type === undefined) {
          this.setState({ add_panel_error: 'Server response has unknown format' })
        } else {
          if (data.type === 'error') {
            this.setState({ add_panel_error: data.error })
          } else if (data.type === 'ok') {
            this.setState({ add_panel_success: 'Record was successfully added' })
          } else {
            this.setState({ add_panel_error: 'Server response has unknown format' })
          }
        }
      }).catch(err => {
        this.setState({ add_panel_error: err })
      })
    } else {
      this.setState({ add_panel_error: 'Something went wrong check data' })
    }
  }

  doRemove(record) {
    axios.post('/api/remove', { login: this.props.login, token: this.props.token, record_id: record._id }).then(data => data.data)
    .then(data => {
      if (data.err) {
        alert(data.err) 
      } else {
        alert('ok')
      }
    }).catch(err => {
      console.log(err)
      alert(err)
    })
  }

  doChange(event) {
    event.preventDefault()

    let token = this.props.token, login = this.props.login
    let name = this.state.edit_name
    let wallet = this.state.current_edit_record.wallet
    let value = this.state.edit_value
    let tags = [ this.state.allTags[this.state.currentEditTag] ]
    let id = this.state.current_edit_record._id
    let date = {
      year: parseInt(this.state.edit_year, 10), 
      month: parseInt(this.state.edit_month, 10), 
      day: parseInt(this.state.edit_day, 10), 
      hour: parseInt(this.state.edit_hour, 10), 
      minute: parseInt(this.state.edit_minute, 10)
    }

    axios.post('/api/edit', {
      token, login, name, date, value: -value, wallet, tags, id, daily: true
    }).then(data => data.data)
    .then(data => {
      if (data.type === undefined) {
        alert('Server response has unknown format')
      } else {
        if (data.type === 'error') {
          alert('Error happened: ' + data.error)
        } else if (data.type === 'ok') {
          alert('Record was successfully changed')
        } else {
          alert('Server reponse has unknown format')
        }
      }
    })
  }

  removeRecord(record, event) {
    event.preventDefault()
    this.setState({ modalHeader: 'Remove record', current_edit_record: record, modalType: 'remove' })
    this.showModal()
  }

  editRecord(record, event) {
    event.preventDefault()
    console.log(record)
    let ncurTag = 0
    if (this.state.allTags.indexOf(record.tags[0]) !== -1)
      ncurTag = this.state.allTags.indexOf(record.tags[0])
    this.setState({ 
      modalHeader: 'Edit record', 
      edit_year: record.date.year, 
      edit_month: record.date.month, 
      edit_day: record.date.day, 
      edit_hour: record.date.hour, 
      edit_minute: record.date.minute, 
      current_edit_record: record, 
      currentEditTag: ncurTag, 
      edit_name: record.name, 
      edit_value: -record.value, 
      modalType: 'edit' 
    })
    this.showModal()
  }

  addTag(tagName) {
    this.setState({
      modalVisible: true,
      modalType: 'processing',
      modalHeader: 'processing',
    })
    api.addTag(this.props.token, this.props.login, tagName)
      .then(data => {
        this.setState({
          modalType: 'processing_success',
          processing_info: data,
        })
      })
      .catch(err => {
        this.setState({
          modalType: 'processing_error',
          processing_info: err,
        })
      })
  }

  showModal() {
    console.log('Showing modal')
    this.setState({ modalVisible: true })
  }

  hideModal() {
    console.log('Hiding modal')
    this.setState({ modalVisible: false })
  }

  changeModalRender() {
    if (this.state.modalType === 'edit') {
      return (
        <div>
          <h3>You can edit record here</h3>
          <div className = 'edit-form'>
            <div className = 'input-group'>
              <label>Название</label>
              <input id = 'edit_name' onChange = {this.inputChange.bind(this)} value = {this.state.edit_name} />
            </div>
            <div className = 'input-group'>
              <label>Стоимость</label>
              <input id = 'edit_value' onChange = {this.numberChanger.bind(this)} value = {this.state.edit_value} />
            </div>
            <div className = 'tags edit-tags'>
              { this.state.allTags.map((el, index) => {
                let clss = 'tag edit-tag'
                if (index === this.state.currentEditTag)
                  clss += ' active-tag'
                return <div onClick = {this.onEditTagClick.bind(this, index)} className = {clss} key = {index}>{el}</div>
              }) }
            </div>
            <div className = 'row'>
              <div className = 'input-group'>
                <label>Year</label>
                <input id = 'edit_year' onChange = {this.numberChanger.bind(this)} value = {this.state.edit_year} />
              </div>

              <div className = 'input-group'>
                <label>Month</label>
                <input id = 'edit_month' onChange = {this.numberChanger.bind(this)} value = {this.state.edit_month} />
              </div>

              <div className = 'input-group'>
                <label>Day</label>
                <input id = 'edit_day' onChange = {this.numberChanger.bind(this)} value = {this.state.edit_day} />
              </div>

              <div className = 'input-group'>
                <label>Hour</label>
                <input id = 'edit_hour' onChange = {this.numberChanger.bind(this)} value = {this.state.edit_hour} />
              </div>

              <div className = 'input-group'>
                <label>Minute</label>
                <input id = 'edit_minute' onChange = {this.numberChanger.bind(this)} value = {this.state.edit_minute} />
              </div>
            </div>
          </div>
          <br />
          <div className = 'row'>
            <button onClick = {this.doChange.bind(this)} className = 'btn btn-danger'>CHANGE</button>
            <button onClick = {this.hideModal.bind(this)} className = 'btn btn-ok'>CANCEL</button>
          </div>
        </div>
      )
    } else if (this.state.modalType === 'remove') {
      return (
        <div>
          <h3>You are really want to remove this record?</h3>
          <br/>
          <div className = 'row'>
            <button onClick = {this.doRemove.bind(this, this.state.current_edit_record)} className = 'btn btn-danger'>REMOVE</button>
            <button onClick = {this.hideModal.bind(this)} className = 'btn btn-ok'>CANCEL</button>
          </div>
        </div>
      )
    } else if (this.state.modalType === 'add tag') {
      return (
        <AddTagForm addTag = {this.addTag.bind(this)} />
      )
    } else if (this.state.modalType === 'processing' || this.state.modalType === 'processing_success' || this.state.modalType === 'processing_error') {
      let type = 'in_progress'
      if (this.state.modalType === 'processing_success')
        type = 'success'
      if (this.state.modalType === 'processing_error')
        type = 'error'
      return <Processing close = {this.hideModal.bind(this)} type = {type} info = {this.state.processing_info} />
    } else if (this.state.modalType === 'template creation') {
      return <CreateTemplate wallets = {this.state.allWallets} tags = {this.state.allTags} createTemplate = {this.createTemplate.bind(this)} />
    } else {
      return null
    }
  }

  createTemplate(name, value, wallet, tag) {
    this.setState({
      modalVisible: true,
      modalHeader: 'Processing',
      modalType: 'processing',
      processing_info: '',
    })
    api.createTemplate(this.props.token, this.props.login, name, parseFloat(value, 10), wallet, tag)
      .then(data => {
        this.setState({ modalType: 'processing_success', processing_info: data })
      })
      .catch(err => {
        this.setState({ modalType: 'processing_error', processing_info: err })
      })
  }

  addTagButtonClicked(event) {
    event.preventDefault()
    this.setState({
      modalVisible: true,
      modalType: 'add tag',
      modalHeader: 'Create tag'
    })
  }

  changeHistoryLengthIndex(index, event) {
    event.preventDefault()
    this.setState({
      currentHistoryLengthIndex: index
    })
  }

  toggleAddMode(event) {
    event.preventDefault()
    this.setState({
      fromTemplate: !this.state.fromTemplate
    })
  }

  createNewTemplate() {
    this.setState({
      modalVisible: true,
      modalHeader: 'Create new template',
      modalType: 'template creation',
    })
  }

  render() {
    let data = []

    let dt = []
    let labels = []

    for (let tag in this.props.counter) {
      let sum = this.props.counter[tag].sum
      let value = -sum
      value = +value.toFixed(2)
      data.push({ label: tag, value: value })

      labels.push(tag)
      dt.push(value)
    }

    data.sort((a, b) => {
      return -(a.value - b.value)
    })

    let barData = []
    let barLabels = []

    for (let el in this.props.daySum) {
      barData.push(this.props.daySum[el])
      barLabels.push(el)
    }

    barData = barData.slice(-this.state.historyLenghts[this.state.currentHistoryLengthIndex])
    barLabels = barLabels.slice(-this.state.historyLenghts[this.state.currentHistoryLengthIndex])

    let prefDaySum = []
    let prefDayLabels = []
    let currentSum = 0
    for (let elem in this.props.daySum) {
      currentSum = +this.props.daySum[elem].toFixed(2)
      prefDaySum.push(currentSum)
      prefDayLabels.push(elem)
    }
    
    for (let i = 1; i < prefDaySum.length; ++i) {
      prefDaySum[i] += prefDaySum[i - 1]
    }

    for (let i = 0; i < prefDaySum.length; ++i) {
      prefDaySum[i] /= (i + 1)
    }

    return (
      <div className = 'wrapper'>
        <ModalPopup renderContent = {this.changeModalRender.bind(this)} open = {this.showModal.bind(this)} close = {this.hideModal.bind(this)} visible = {this.state.modalVisible} header = {this.state.modalHeader} content = {this.state.modalType} />
        <header>
          <h1>Money Saver</h1>
        </header>
        <main>
          <div className = 'content'>
            <Profile
              addTagButtonClicked = {this.addTagButtonClicked.bind(this)}
              tags = {this.state.allTags}
              wallets = {this.state.allWallets}
              logout = {this.logout.bind(this)}
              addRecord = {this.addRecord.bind(this)}
              tagsLoadingState = {this.state.tagsLoadingState}
              add_panel_error = {this.state.add_panel_error}
              add_panel_success = {this.state.add_panel_success}
              createNewTemplate = {this.createNewTemplate.bind(this)}
              templates = {this.state.templates}
            />
            {prefDayLabels.length > 0 && (
              <div className = 'card'>
                <Line data = {{ 
                  labels: prefDayLabels, 
                  datasets: [{ 
                    label: "Средний расход", 
                    data: prefDaySum, 
                    borderWidth: 3, 
                    pointRadius: 1, 
                    backgroundColor: 'rgba(0, 166, 237, 0.05)', 
                    borderColor: '#00A6ED' 
                  }] }} options = {{
                    elements: {
                      line: {
                        tension: 0
                      }
                    }
                  }} />
              </div>
            )}
            <div className = 'dashboard'>
              <div className = 'info-table card'>
                <div className = 'fullSum'>
                  <div className = 'value'>{this.props.fullSum} &#8381;</div>
                  <div className = 'label'>Полный расход</div>
                </div>

                <div className = 'average'>
                  <div className = 'value'>{this.props.average} &#8381;</div>
                  <div className = 'label'>Средний ежесуточный расход</div>
                </div>
                {barData.length > 0 && (
                  <div>
                    <div className = 'historyRange'>
                      {this.state.historyLenghts.map((el, index) => {
                        let currentClass = 'ranger'
                        if (index === this.state.currentHistoryLengthIndex)
                          currentClass += ' active'
                        return (
                          <div onClick = {this.changeHistoryLengthIndex.bind(this, index)} key = {index} className = {currentClass}>{el} Days</div>
                        )
                      })}
                    </div>
                    <Bar data = {{ labels: barLabels, datasets: [{ data: barData, label: 'Расходы', backgroundColor: '#04E762' }] }} />
                  </div>
                )}
              </div>
              {labels.length > 0 && <div className = 'card'><Doughnut height = {300} data = {{ datasets: [{ data: dt, borderColor: this.allColors, backgroundColor: this.allColors }], labels: labels }} /></div> }
            </div>
            <ByTagSum data = {data} countOfDays = {this.props.countOfDays} />
            <History editRecord = {this.editRecord.bind(this)} removeRecord = {this.removeRecord.bind(this)} /> 
          </div>
        </main>
        <footer>
            Footer // to do
        </footer>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return state
}

export default connect(mapStateToProps)(App)