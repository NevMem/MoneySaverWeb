import React, { Component } from 'react'
import PropTypes from 'prop-types'
import utils from '../utils';

export default class DatePicker extends Component {
  static propTypes = {
    changeState: PropTypes.func.isRequired,
    changeMode: PropTypes.func.isRequired,
  }

  constructor(prps) {
    super(prps)
    this.state = {
      useCurrentTime: true,
      ...utils.createDate(),
    }
  }

  toggleMode() {
    this.setState({
      useCurrentTime: !this.state.useCurrentTime
    })
    this.props.changeMode(this.state.useCurrentTime ? 'current time' : 'choosed date')
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

  dateFromState() {
    return {
      year: parseInt(this.state.year, 10),
      month: parseInt(this.state.month, 10),
      day: parseInt(this.state.day, 10),
      hour: parseInt(this.state.hour, 10),
      minute: parseInt(this.state.minute, 10),
    }
  }

  numberChanger(event) {
    if (this.validNumber(event.target.value)) {
      this.setState({ [event.target.id]: event.target.value })
      this.props.changeDate(this.dateFromState())
    }
  }

  render() {
    if (this.state.useCurrentTime) {
      return(
        <div className = 'date-block'>
          <button className = 'current-time-toggler' onClick = {this.toggleMode.bind(this)}>
            <div>Current time</div>
            <div>Choose time</div>
          </button>
        </div>
      )
    } else {
      return (
        <div className = 'date-block'>
          <button className = 'current-time-toggler toggled' onClick = {this.toggleMode.bind(this)}>
            <div>Current time</div>
            <div>Choose time</div>
          </button>
          <input onChange = {this.numberChanger.bind(this)} value = {this.state.year} placeholder = 'year' type = 'text' id = 'year' />
          <input onChange = {this.numberChanger.bind(this)} value = {this.state.month} placeholder = 'month' type = 'text' id = 'month' />
          <input onChange = {this.numberChanger.bind(this)} value = {this.state.day} placeholder = 'day' type = 'text' id = 'day' />
          <input onChange = {this.numberChanger.bind(this)} value = {this.state.hour} placeholder = 'hour' type = 'text' id = 'hour' />
          <input onChange = {this.numberChanger.bind(this)} value = {this.state.minute} placeholder = 'minute' type = 'text' id = 'minute' />
        </div>
      )
    }
  }
}