import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'

class LoginPage extends Component {
  constructor(prps) {
    super(prps)
    this.state = {
      login: '',
      password: '',
      loading: false,
    }
  }

  inputChange(event) {
    this.setState({ [event.target.id]: event.target.value })
    this.forceUpdate()
  }

  login(event) {
    event.preventDefault()
    this.setState({
      loading: true,
      error: '',
    })
    axios.post('/api/login', { login: this.state.login, password: this.state.password }).then(data => data.data).then(data => {
      if (data.error) {
        this.setState({
          error: data.error,
          loading: false,
        })
      } else {
        this.setState({
          loading: false,
        })
        let { token, last_name, first_name, login } = data.data

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
        <header>
          <h1>Money Saver</h1>
        </header>
        <main>
          <div style = {{ backgroundColor: '#292929' }} className = 'centered'>
            <form className = 'login-form'>
              <h2>Please login:</h2>
              { this.state.error && <h3 style = {{ padding: 0, marginTop: 0, marginBottom: 0 }} className = 'error'>{this.state.error}</h3> }
              <input id = 'login' type = 'text' placeholder = 'Login' value = {this.state.login} onChange = {this.inputChange.bind(this)} />
              <input id = 'password' type = 'password' placeholder = 'Password' value = {this.state.password} onChange = {this.inputChange.bind(this)} />
              <div className = 'buttons'>
                <button style = {{textAlign: 'center'}} className = 'btn' onClick = {this.login.bind(this)}>
                  <div className = 'row' style = {{ padding: 0, margin: 0, textAlign: 'center', justifyContent: 'space-around' }}>{this.state.loading && <div className = 'small-loading'></div>}Login</div>
                </button>
                <button className = 'btn' onClick = {this.register.bind(this)}>Register</button>
              </div>
            </form>
          </div>
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