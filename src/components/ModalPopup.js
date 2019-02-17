import React, { Component } from 'react'

class ModalPopup extends Component {
  render() {
    if (!this.props.visible) return null
    return (
      <div className = 'modalWrapper'>
        <div className = 'modalFrame'>
          <div className = 'modalHeader row'>
            <div>{this.props.header}</div>
            <div className = 'modal-close-btn' onClick = {this.props.close}>close</div>
          </div>
          <div className = 'modalContent'>{this.props.renderContent()}</div>
        </div>
      </div>
    )
  }
}

export default ModalPopup