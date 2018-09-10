import React, { Component } from 'react'

class ModalPopup extends Component {
    constructor(prps) {
        super(prps)
        console.log(this.props)
    }

    render() {
        if (!this.props.visible) return null

        return (
            <div className = 'modalWrapper'>
                <div className = 'modalFrame'>
                    <div onClick = {this.props.close} className = 'modalHeader'>{this.props.header}</div>
                    <div className = 'modalContent'>{this.props.content}</div>
                </div>
            </div>
        )
    }
}

export default ModalPopup