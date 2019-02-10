import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Processing extends Component {
  static propTypes = {
    info: PropTypes.string,
    type: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
  }

  render() {
    if (this.props.type === 'in_progress')
      return <div className = 'centered'><div className = 'processing_in_progress'>Processing</div></div>
    else if (this.props.type === 'success') {
      return (
        <div>
          <div className = 'centered'>
            <div className = 'processing_success'></div>
          </div>
          <br/>
          <h2>{this.props.info}</h2>
          <br/>
          <div className = 'centered'>
            <button className = 'btn btn-ok' onClick = {this.props.close}>Continue</button>
          </div>
        </div>
      )
    } else if (this.props.type === 'error') {
      return (
        <div>
          <div className = 'centered'>
            <div className = 'processing_error'></div>
          </div>
          <br/>
          <h2>{this.props.info}</h2>
          <br/>
          <div className = 'centered'>
            <button className = 'btn btn-ok' onClick = {this.props.close}>Continue</button>
          </div>
        </div>
      )
    }
  }
}