import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class AddTagForm extends Component {
  static propTypes = {
    addTag: PropTypes.func.isRequired,
  }

  constructor(prps) {
    super(prps)
    this.state = {
      tagName: ''
    }
  }

  onChange(event) {
    this.setState({ [event.target.id]: event.target.value })
  }

  addButtonClicked(event) {
    event.preventDefault()
    this.props.addTag(this.state.tagName)
  }
  
  render() {
    return (
      <div>
        <h3>Please enter new tag name, which you want to create</h3>
        <br/>
        <div className = 'input-group'>
          <label>Tag name</label>
          <input id = 'tagName' onChange = {this.onChange.bind(this)} value = {this.state.tagName} />
        </div>
        <br/>
        <div className = 'centered'>
          <button className = 'btn btn-ok' onClick = {this.addButtonClicked.bind(this)}>Add this tag</button>
        </div>
      </div>
    )
  }
}