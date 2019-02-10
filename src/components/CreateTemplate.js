import React, { Component } from 'react'
import PropTypes from 'prop-types'

class CreateTemplate extends Component {
  static propTypes = {
    createTemplate: PropTypes.func.isRequired,
    tags: PropTypes.array.isRequired,
    wallets: PropTypes.array.isRequired,
  }
  
  constructor(prps) {
    super(prps)
    this.state = {
      name: '',
      value: '',
      currentTag: 0,
      currentWallet: 0,
    }
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

  numberChange(event) {
    if (this.validNumber(event.target.value))
      this.setState({ [event.target.id]: event.target.value })
  }

  inputChange(event) {
    this.setState({ [event.target.id]: event.target.value })
  }

  createTemplate() {
    this.props.createTemplate(
        this.state.name,
        this.state.value,
        this.props.wallets[this.state.currentWallet],
        this.props.tags[this.state.currentTag]
      )
  }

  chooseTag(index) {
    this.setState({ currentTag: index })
  }

  changeSelect(event) {
    let index = this.state.allWallets.indexOf(event.target.value)
    this.setState({ currentWallet: index })
  }

  render() {
    return (
      <div>
        <h2>Here you can create new template</h2>
        <br/>
        <div className = 'input-group'>
          <label>Name</label>
          <input id = 'name' onChange = {this.inputChange.bind(this)} value = {this.state.name} />
        </div>
        <br/>
        <div className = 'input-group'>
          <label>Value</label>
          <input id = 'value' onChange = {this.numberChange.bind(this)} value = {this.state.value} />
        </div>
        <br/>
        <div className = 'tags edit-tags'>
          { this.props.tags.map((el, index) => {
            let clss = 'tag edit-tag'
            if (index === this.state.currentTag)
              clss += ' active-tag'
            return <div onClick = {this.chooseTag.bind(this, index)} className = {clss} key = {index}>{el}</div>
          }) }
        </div>
        <br/>
        <select onChange = {this.changeSelect.bind(this)} value = {this.props.wallets[this.state.currentWallet]} className = 'picker' name = 'wallet'>
          {this.props.wallets.map((el, key) => {
            return (
              <option key = {key}>{el}</option>
            )
          })}
        </select>
        <br/> <br/>
        <div className = 'centered'>
          <div className = 'btn btn-ok' onClick = {this.createTemplate.bind(this)}>Create template</div>
        </div>
      </div>
    )
  }
}

export default CreateTemplate
