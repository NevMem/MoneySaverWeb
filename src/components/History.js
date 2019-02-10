import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import delete_icon from '../delete-icon.svg'

class History extends Component {
  static defaultShow = 15
  static showMoreStep = 15
  static propTypes = {
    records: PropTypes.array.isRequired,
    editRecord: PropTypes.func.isRequired,
    removeRecord: PropTypes.func.isRequired,
  }

  constructor(prps) {
    super(prps)
    this.state = {
      show: Math.min(History.defaultShow, this.props.records.length)
    }
    console.log(this.state.show)
  }

  componentWillUpdate(nextProps) {
    if (nextProps.records.length !== this.props.records.length) {
      this.setState(state => {
        return { ...state, show: Math.max(state.show, Math.min(nextProps.records.length, History.defaultShow)) }
      })
    }
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

  showMore() {
    let nxtShow = Math.min(this.props.records.length, this.state.show + History.showMoreStep)
    if (nxtShow !== this.state.show)
      this.setState({ show: nxtShow })
  }
  
  render() {
    return (
      <div className = 'history-card'>
        <h2>Последние действия</h2>
        <table className = 'records'>
          <thead>
            <tr>
              <td>Wallet</td>
              <td>Name</td>
              <td>Value</td>
              <td>Tags</td>
              <td>Date</td>
              <td></td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {this.props.records.map((el, key) => {
              if (key >= this.state.show)
                return null
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
                  <td><button className = 'edit-btn' onClick = {this.props.editRecord.bind(this, el)}>edit</button></td>
                  <td className = 'remove-btn'><img onClick = {this.props.removeRecord.bind(this, el)} src = {delete_icon} alt = 'delete' /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {this.state.show < this.props.records.length && 
          <div className = 'centered'>
            <div className = 'btn btn-special' onClick = {this.showMore.bind(this)}>Show more</div>
          </div>
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
  return state
}

export default connect(mapStateToProps)(History)
