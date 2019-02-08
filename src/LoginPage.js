import React, { Component } from 'react'
// import 

export default class LoginPage extends Component {
  constructor(prps) {
    super(prps)
    this.state = {
      login: '',
      password: '',
    }
  }

  inputChange(event) {
    this.setState({ [event.target.id]: event.target.value })
    this.forceUpdate()
  }

  login() {

  }

  register() {
    
  }
  
  render() {
    return (
      <div className = 'wrapper'>
        {/* <ModalPopup renderContent = {this.changeModalRender.bind(this)} open = {this.showModal.bind(this)} close = {this.hideModal.bind(this)} visible = {this.state.modalVisible} header = {this.state.modalHeader} content = {this.state.modalContent} /> */}
        <header>
          <h1>Money Saver</h1>
        </header>
        <main>
          <form className = 'login-form'>
            <h2>Please login:</h2>
            <input id = 'login' type = 'text' placeholder = 'Login' value = {this.state.login} onChange = {this.inputChange.bind(this)} />
            <input id = 'password' type = 'password' placeholder = 'Password' value = {this.state.password} onChange = {this.inputChange.bind(this)} />
            <div className = 'buttons'>
              <button className = 'btn' onClick = {this.login.bind(this)}>Login</button>
              <button className = 'btn' onClick = {this.register.bind(this)}>Register</button>
            </div>
          </form>
        </main>
        <footer>
            Footer // to do
        </footer>
      </div>
    )
  }
}