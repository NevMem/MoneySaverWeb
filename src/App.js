import React, { Component } from 'react'
import './main.css'
import { connect } from 'react-redux'
import axios from 'axios'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import delete_icon from './delete-icon.svg'
import ModalPopup from './components/ModalPopup'

class App extends Component {

  constructor(prps) {
    super(prps)
    
    let current = new Date()

    this.state = {
      login: '', 
      password: '',
      name: '', 
      value: '', 
      year: current.getFullYear(), 
      month: current.getMonth() + 1, 
      day: current.getDate(), 
      hour: current.getHours(), 
      minute: current.getMinutes(), 
      allTags: [ 'Еда', 'Транспорт', 'Проживание', 'Электроника', 'Одежда', 'Линзы', 'Посуда', 'Химия', 'Связь', 'Разное' ], 
      currentTag: 0, 
      currentEditTag: 0, 
      allWallets: [ 'Наличные', 'Сбербанк', 'ВТБ', 'АкБарс' ], 
      currentWallet: 0, 
      add_panel_error: '', 
      add_panel_success: '', 

      modalVisible: false, 
      modalHeader: '-- TODO --', 
      modalContent: '-- TODO --', 

      edit_name: '', 
      edit_value: 0, 
      edit_day: -1, 
      edit_year: -1, 
      edit_month: -1, 
      edit_hour: -1, 
      edit_minute: -1, 
      current_edit_record: undefined, 

      historyLenghts: [ 7, 14, 21, 28, 56, 28 * 4 ],
      currentHistoryLengthIndex: 0
    }
  }

  inputChange(event) {
    this.setState({ [event.target.id]: event.target.value })
    this.forceUpdate()
  }

  login(event) {
    event.preventDefault()
    axios.post('/api/login', { login: this.state.login, password: this.state.password }).then(data => data.data).then(data => {
      if (data.err) {
        alert(data.err)
      } else {
        let { token, last_name, first_name, login } = data

        localStorage.setItem('login', login)
        localStorage.setItem('last_name', last_name)
        localStorage.setItem('first_name', first_name)
        localStorage.setItem('token', token)

        this.props.dispatch({ type: 'LOGGED_IN', payload: { login: login, first_name: first_name, last_name: last_name, token: token } })
      }
    })
    .catch(err => {
      console.log(err)
    })
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
    ret += this.norm(date.day) + ':' + this.norm(date.month) + ':' + date.year + ' '
    ret += date.hour + ':' + this.norm(date.minute)
    return ret
  }

  logout() {
    this.props.dispatch({ type: 'LOGGED_OUT', payload: {} })
  }

  allColors = [ '#7678ED', '#04E762', '#FF206E', '#5C80BC', '#4CB944', '#A2D729', '#F0E100', '#F7CB15', '#F55D3E', '#85FF9E', '#E7BB41', '#F45B69', '#FBFF12' ]

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

  addRecord() {
    let { login, token } = this.props
    let { name, value, year, month, day, hour, minute } = this.state
    let wallet = this.state.allWallets[this.state.currentWallet]
    let tag = this.state.allTags[this.state.currentTag]
    
    value = -value

    if (login && token && name && value !== undefined) {
      axios.post('/api/add', { 
        login: login, 
        token: token, 
        wallet: wallet, 
        tags: [ tag ], 
        date: { 
          year: year, 
          month: month, 
          day: day, 
          hour: hour, 
          minute: minute 
        }, 
        name: name, 
        value: value 
      })
      .then(data => data.data)
      .then(data => {
        console.log(data)
        if (data.err) {
          this.setState({ add_panel_error: data.err })
        } else {
          this.setState({ add_panel_success: 'Record was successfully added' })
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
      year: this.state.edit_year, 
      month: this.state.edit_month, 
      day: this.state.edit_day, 
      hour: this.state.edit_hour, 
      minute: this.state.edit_minute
    }

    axios.post('/api/edit', {
      token, login, name, date, value: -parseInt(value, 10), wallet, tags, id
    }).then(data => data.data)
    .then(data => {
      if (data.err) {
        console.log(data.err)
      } else {
        alert('All is ok')
      }
    })
  }

  removeRecord(record, event) {
    event.preventDefault()
    this.setState({ modalHeader: 'Remove record', current_edit_record: record, modalContent: 'remove' })
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
      modalContent: 'edit' 
    })
    this.showModal()
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
    if (this.state.modalContent === 'edit') {
      return (
        <div>
          <h3>You can edit record here</h3>
          <div className = 'edit-form'>
            <div className = 'edit-form-input-group'>
              <label>Название</label>
              <input id = 'edit_name' onChange = {this.inputChange.bind(this)} value = {this.state.edit_name} />
            </div>
            <div className = 'edit-form-input-group'>
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
              <div className = 'edit-form-input-group'>
                <label>Year</label>
                <input id = 'edit_year' onChange = {this.numberChanger.bind(this)} value = {this.state.edit_year} />
              </div>

              <div className = 'edit-form-input-group'>
                <label>Month</label>
                <input id = 'edit_month' onChange = {this.numberChanger.bind(this)} value = {this.state.edit_month} />
              </div>

              <div className = 'edit-form-input-group'>
                <label>Day</label>
                <input id = 'edit_day' onChange = {this.numberChanger.bind(this)} value = {this.state.edit_day} />
              </div>

              <div className = 'edit-form-input-group'>
                <label>Hour</label>
                <input id = 'edit_hour' onChange = {this.numberChanger.bind(this)} value = {this.state.edit_hour} />
              </div>

              <div className = 'edit-form-input-group'>
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
    } else if (this.state.modalContent === 'remove') {
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
    } else {
      return null
    }
  }

  changeHistoryLengthIndex(index, event) {
    event.preventDefault()
    this.setState({
      currentHistoryLengthIndex: index
    })
  }

  render() {
    let data = []

    let dt = []
    let labels = []

    for (let tag in this.props.counter) {
      let sum = this.props.counter[tag].sum
      let value = -sum
      value = (value * 100 | 0) / 100.
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

    barData.reverse()
    barLabels.reverse()

    barData = barData.slice(-this.state.historyLenghts[this.state.currentHistoryLengthIndex])
    barLabels = barLabels.slice(-this.state.historyLenghts[this.state.currentHistoryLengthIndex])

    let prefDaySum = []
    let prefDayLabels = []
    let currentSum = 0
    for (let elem in this.props.daySum) {
      currentSum = (this.props.daySum[elem] * 100. | 0) / 100.
      prefDaySum.push(currentSum)
      prefDayLabels.push(elem)
    }
    prefDayLabels.reverse()
    prefDaySum.reverse()
    
    for (let i = 1; i < prefDaySum.length; ++i) {
      prefDaySum[i] += prefDaySum[i - 1]
    }

    for (let i = 0; i < prefDaySum.length; ++i) {
      prefDaySum[i] /= (i + 1)
    }

    return (
      <div className = 'wrapper'>
        <ModalPopup renderContent = {this.changeModalRender.bind(this)} open = {this.showModal.bind(this)} close = {this.hideModal.bind(this)} visible = {this.state.modalVisible} header = {this.state.modalHeader} content = {this.state.modalContent} />
        <header>
          <h1>Money Saver</h1>
        </header>
        <main>
          {this.props.token ? (
            <div className = 'content'>
              <div className = 'profile'>
                <div className = 'info-part'>
                  <h1>Profile info</h1>
                  <h2>{this.props.first_name + ' ' + this.props.last_name}</h2>
                  <h3 className = 'grayed'>{'@' + this.props.login}</h3>
                  <br/>
                  <button className = 'btn' onClick = {this.logout.bind(this)}>Logout</button>
                </div>

                <div className = 'add-part'>
                  {this.state.add_panel_error && <h4 className = 'error'>{this.state.add_panel_error}</h4>}
                  {this.state.add_panel_success && <h4 className = 'success'>{this.state.add_panel_success}</h4>}
                  <div className = 'input-block'>
                    <div className = 'input-label'>Название</div>
                    <input onChange = {this.inputChange.bind(this)} value = {this.state.name} id = 'name' type = 'text' autoComplete = 'false' />
                  </div>
                  <div className = 'input-block'>
                    <div className = 'input-label'>Стоимость</div>
                    <input onChange = {this.numberChanger.bind(this)} value = {this.state.value} id = 'value' type = 'text' autoComplete = 'false' />
                  </div>
                  <div className = 'input-label'>Теги</div>
                  <div className = 'tags'>
                    {this.state.allTags.map((el, key) => {
                      let cls = 'tag'
                      if (key === this.state.currentTag)
                        cls += ' active-tag'
                      return (
                        <div onClick = {this.onTagClick.bind(this, key)} className = {cls} key = {key}>{el}</div>
                      )
                    })}
                  </div>
                  <select onChange = {this.changeSelect.bind(this)} value = {this.state.allWallets[this.state.currentWallet]} className = 'wallet' name = 'wallet'>
                    {this.state.allWallets.map((el, key) => {
                      return (
                        <option key = {key}>{el}</option>
                      )
                    })}
                  </select>
                  <div className = 'input-label'>Время</div>
                  <div className = 'date-block'>
                    <input onChange = {this.numberChanger.bind(this)} value = {this.state.year} placeholder = 'year' type = 'text' id = 'year' />
                    <input onChange = {this.numberChanger.bind(this)} value = {this.state.month} placeholder = 'month' type = 'text' id = 'month' />
                    <input onChange = {this.numberChanger.bind(this)} value = {this.state.day} placeholder = 'day' type = 'text' id = 'day' />
                    <input onChange = {this.numberChanger.bind(this)} value = {this.state.hour} placeholder = 'hour' type = 'text' id = 'hour' />
                    <input onChange = {this.numberChanger.bind(this)} value = {this.state.minute} placeholder = 'minute' type = 'text' id = 'minute' />
                  </div>
                  <button onClick = {this.addRecord.bind(this)} className = 'btn'>Добавить</button>
                </div>
              </div>
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
                    <div className = 'value'>{(-this.props.fullSum * 100 | 0) / 100.} &#8381;</div>
                    <div className = 'label'>Полный расход</div>
                  </div>

                  <div className = 'average'>
                    <div className = 'value'>{-this.props.average} &#8381;</div>
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
                {labels.length > 0 && <div className = 'card'><Doughnut width = '200px' height = '200px' data = {{ datasets: [{ data: dt, borderColor: this.allColors, backgroundColor: this.allColors }], labels: labels }} /></div> }
              </div>
              <br />
              <h2>Полная сумма по каждому тегу</h2>
              <br />
              <table className = 'main-info'>
                <thead>
                  <tr>
                    <td width = '33%'>Тег</td>
                    <td width = '33%'>Сумма</td>
                    <td width = '33%'>Средний расход в день</td>
                  </tr>
                </thead>
                <tbody>
                  {data.map((el, key) => {
                    return (
                      <tr key = {key}>
                        <td>{el.label}</td>
                        <td>{el.value}</td>
                        <td>{(el.value / this.props.countOfDays * 100 | 0) / 100.}</td>
                      </tr>
                    )
                })}
                </tbody>
              </table>

              <br />
              <h2>Последение действия</h2>
              <br />

              <table className = 'records'>
                <thead>
                  <tr>
                    <td>Wallet</td>
                    <td>Name</td>
                    <td>Value</td>
                    <td>Tags</td>
                    <td>Date</td>
                  </tr>
                </thead>
                <tbody>
                  {this.props.records.map((el, key) => {
                    let cls = 'increase'
                    if (el.value < 0)
                      cls = 'decrease'

                    let tags = 'no tags'
                    let date = 'not specified'

                    if (el.tags)
                      tags = el.tags
                    if (el.date)
                      date = this.getDate(el.date)
                    
                    return (
                      <tr className = {cls} key = {key}>
                        <td>{el.wallet}</td>
                        <td>{el.name}</td>
                        <td>{el.value}</td>
                        <td>{tags}</td>
                        <td>{date}</td>
                        <td><button className = 'edit-btn' onClick = {this.editRecord.bind(this, el)}>edit</button></td>
                        <td className = 'remove-btn'><img onClick = {this.removeRecord.bind(this, el)} src = {delete_icon} alt = 'delete' /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <form className = 'login-form'>
              <h2>Please login:</h2>
              <input id = 'login' type = 'text' placeholder = 'Login' value = {this.state.login} onChange = {this.inputChange.bind(this)} />
              <input id = 'password' type = 'password' placeholder = 'Password' value = {this.state.password} onChange = {this.inputChange.bind(this)} />
              <div className = 'buttons'>
                <button className = 'btn' onClick = {this.login.bind(this)}>Login</button>
                <button className = 'btn' onClick = {this.register.bind(this)}>Register</button>
              </div>
            </form>
          )}
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