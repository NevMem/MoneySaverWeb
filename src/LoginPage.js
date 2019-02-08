import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'

class LoginPage extends Component {
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

  login(event) {
    event.preventDefault()
    axios.post('/api/login', { login: this.state.login, password: this.state.password }).then(data => data.data).then(data => {
      if (data.err) {
        alert(data.err)
      } else {
        let { token, last_name, first_name, login } = data

        localStorage.setItem('login', login)
        localStorage.setItem('last_name', last_name)
        localStorage.setItem('first_name', first_name)
        localStorage.setItem('token', token)

        this.props.dispatch({ type: 'LOGGED_IN', payload: { login: login, first_name: first_name, last_name: last_name, token: token } })
        this.props.history.push('/home')
      }
    })
    .catch(err => {
      console.log(err)
    })
  }

  register(event) {
    event.preventDefault()
    alert('This feature is not supported yet')
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

function mapStateToProps(state) {
  return state
}

export default connect(mapStateToProps)(LoginPage)