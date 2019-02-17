import React, { Component } from 'react'
import PropTypes from 'prop-types'
import api from '../api'
import utils from '../utils'
import { connect } from 'react-redux'

class Template extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    tag: PropTypes.string.isRequired,
    wallet: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
  }

  constructor(prps) {
    super(prps)
    this.state = {
      loading: false,
      message: '',
      type: undefined,
    }
  }

  messageExpiration() {
    setInterval(() => {
      this.setState({ message: '' })
    }, 3000)
  }

  use() {
    if (this.state.loading === false && this.state.editMode === false) {
      this.setState({ loading: true })
      api.useTemplate(this.props.token, this.props.login, this.props.id, utils.createDate())
        .then(data => {
          this.setState({ loading: false, message: data, type: 'success' })
          this.messageExpiration()
        })
        .catch(err => {
          this.setState({ loading: false, message: err, type: 'error' })
          this.messageExpiration()
        })
    }
  }

  removeTemplate() {
    api.removeTemplate(this.props.token, this.props.login, this.props.id)
      .then(data => {
        console.log(data)
      })
      .catch(err => {
        console.log('error', err)
      })
  }

  render() {
    if (!this.state.loading && this.state.message === '') {
      return (
        <div className = { this.props.editMode ? 'template inEditMode' : 'template' } onClick = {this.use.bind(this)}>
          { this.props.editMode && <div className = 'remove-template-button' onClick = {this.removeTemplate.bind(this)}></div> }
          <div className = 'template-name'>{this.props.name}</div>
          <div className = 'template-value'>{this.props.value}</div>
          <div className = 'template-tag'>{this.props.tag}</div>
          <div className = 'template-wallet'>{this.props.wallet}</div>
        </div>
      )
    } else {
      return (
        <div className = 'template applying'>
          { this.state.loading && <div>Applying this template</div> }
          { this.state.message !== '' && this.state.type === 'success' && <div className = 'success'>{this.state.message}</div> }
          { this.state.message !== '' && this.state.type === 'error' && <div className = 'error'>{this.state.message}</div> }
        </div>
      )
    }
  }
}

function mapStateToProps(state) {
  return { token: state.token, login: state.login }
}

export default connect(mapStateToProps)(Template)
