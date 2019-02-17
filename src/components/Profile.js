import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import './profile-styles.css'
import Template from './Template';

class Profile extends Component {
  static propTypes = {
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired, 
    login: PropTypes.string.isRequired,
    logout: PropTypes.func.isRequired,
    tags: PropTypes.array.isRequired,
    wallets: PropTypes.array.isRequired,
    addTagButtonClicked: PropTypes.func.isRequired,
    addRecord: PropTypes.func.isRequired,
    tagsLoadingState: PropTypes.string.isRequired,
    add_panel_error: PropTypes.string.isRequired,
    add_panel_success: PropTypes.string.isRequired,
    createNewTemplate: PropTypes.func.isRequired,
    templates: PropTypes.array.isRequired,
  }

  constructor(prps) {
    super(prps)
    const current = new Date()
    this.state = {
      fromTemplate: true,
      currentWallet: 0,
      currentTag: 0,
      year: current.getFullYear(), 
      month: current.getMonth() + 1, 
      day: current.getDate(), 
      hour: current.getHours(), 
      minute: current.getMinutes(),
      name: '', 
      value: '',
      editTemplatesMode: true, // TODO: set it false
    }
  }

  changeSelect(event) {
    let index = this.props.wallets.indexOf(event.target.value)
    this.setState({ currentWallet: index })
  }

  onTagClick(index, event) {
    this.setState({ currentTag: index })
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

  inputChange(event) {
    this.setState({ [event.target.id]: event.target.value })
  }

  toggleAddMode(event) {
    event.preventDefault()
    this.setState({ fromTemplate: !this.state.fromTemplate })
  }

  addRecord(event) {
    event.preventDefault()
    this.props.addRecord(
      this.state.name,
      this.state.value,
      this.state.year,
      this.state.month,
      this.state.day,
      this.state.hour,
      this.state.minute,
      this.props.wallets[this.state.currentWallet],
      this.props.tags[this.state.currentTag]
    )
  }

  toggleEditableMode() {
    this.setState({
      editTemplatesMode: !this.state.editTemplatesMode
    })
  }

  render() {
    return (
      <div className = 'profile'>
        <div className = 'info-part'>
          <h1>Profile info</h1>
          <h2>{this.props.first_name + ' ' + this.props.last_name}</h2>
          <h3 className = 'grayed'>{'@' + this.props.login}</h3>
          <br/>
          <button className = 'btn' onClick = {this.props.logout.bind(this)}>Logout</button>
          <br/>
          <br/>
          <button className = { !this.state.fromTemplate ? 'btn btn-toggle' : 'btn btn-toggle btn-toggled' } onClick = {this.toggleAddMode.bind(this)}>Use templates</button>
        </div>
        { !this.state.fromTemplate &&
          <div className = 'add-part'>
            {this.props.add_panel_error && <h4 className = 'error'>{this.props.add_panel_error}</h4>}
            {this.props.add_panel_success && <h4 className = 'success'>{this.props.add_panel_success}</h4>}
            <div className = 'input-block'>
              <div className = 'input-label'>Название</div>
              <input onChange = {this.inputChange.bind(this)} value = {this.state.name} id = 'name' type = 'text' autoComplete = 'false' />
            </div>
            <div className = 'input-block'>
              <div className = 'input-label'>Стоимость</div>
              <input onChange = {this.numberChanger.bind(this)} value = {this.state.value} id = 'value' type = 'text' autoComplete = 'false' />
            </div>
            <div className = 'input-label'>Выберете тег</div>
            <div className = 'tags'>
              { this.props.tagsLoadingState === 'loading' && <div className = 'tag tag-loading'></div> }
              { this.props.tagsLoadingState === 'error' && <div className = 'tag tag-errored'></div> }
              { this.props.tags.map((el, key) => {
                let cls = 'tag'
                if (key === this.state.currentTag)
                  cls += ' active-tag'
                return (
                  <div onClick = {this.onTagClick.bind(this, key)} className = {cls} key = {key}>{el}</div>
                )
              }) }
              <div className = 'tag add-tag-button' onClick = {this.props.addTagButtonClicked.bind(this)}>Add Tag</div>
            </div>
            <select onChange = {this.changeSelect.bind(this)} value = {this.props.wallets[this.state.currentWallet]} className = 'wallet' name = 'wallet'>
              {this.props.wallets.map((el, key) => {
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
        }
        { this.state.fromTemplate &&
          <div>
            <div className = 'templates-heading'>
              <h2>Your templates</h2>
              <button className = 'change-button' onClick = {this.toggleEditableMode.bind(this)}>edit</button>
            </div>
            <div className = 'templates'>
              { this.props.templates.map((el, index) => {
                return <Template key = {index} editMode = {this.state.editTemplatesMode} id = {el.id} name = {el.name} value = {el.value} tag = {el.tags[0]} wallet = {el.wallet} />
              }) }
              <div className = 'template add-template' onClick = {this.props.createNewTemplate}>
                Add new template
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
  return state
}

export default connect(mapStateToProps)(Profile)