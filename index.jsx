import React from "react"
import ReactDOM from "react-dom"

import {
  redirectToSignIn,
  isUserSignedIn,
  loadUserData,
  isSignInPending,
  handlePendingSignIn,
  signUserOut,
  getFile,
  putFile,
} from "blockstack"

import "bulma/css/bulma.css"
import "./index.css"

class LoginButton extends React.Component {
  onClick() {
    console.log("kurac")
    redirectToSignIn()
  }

  render() {
    return (
      <a className="button rp15 is-success" onClick={this.onClick}>
        Sign in
      </a>
    )
  }
}

class LogoutButton extends React.Component {
  constructor(props) {
    super(props)

    this.onClick = this.onClick.bind(this)
  }

  onClick() {
    signUserOut()
    this.props.onLogout()
  }

  render() {
    return (
      <a className="button rp15 is-danger" onClick={this.onClick}>
        Log out
      </a>
    )
  }
}


class LoginModal extends React.Component {
  render() {
    return (
      <div className="section">
        <h1 className="title">Decentralized password manager</h1>
        <LoginButton />
      </div>
    )
  }
}

class Password extends React.Component {
  render() {
    const { id, website, username, password, onPasswordDelete } = this.props

    return (
      <article className="message password">
        <div className="message-header">
          <p>{website}</p>
          <button
            className="delete"
            aria-label="delete"
            onClick={() => onPasswordDelete(id)}
          ></button>
        </div>
        <div className="message-body">
          <div>
            <span>Username:</span>
            <p>{username}</p>
          </div>
          <div>
            <span>Password:</span>
            <p>{password}</p>
          </div>
        </div>
      </article>
    )
  }
}

class PasswordList extends React.Component {
  render() {
    const { passwords, onPasswordDelete } = this.props

    const rendered = passwords
      .map((password, i) => (
        <Password
          key={i}
          {...password}
          onPasswordDelete={onPasswordDelete}
        />
      ))

    return (
      <div className="section">
        {rendered.length ? rendered : "no passwords"}
      </div>
    )
  }
}

class AddPasswordForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      website: "",
      username: "",
      password: "",
    }

    this.onSubmit = this.onSubmit.bind(this)
  }

  onChange(key) {
    return e => {
      this.setState({ [key]: e.target.value })
    }
  }

  onWebsiteChange() {
    return this.onChange("website")
  }

  onUsernameChange() {
    return this.onChange("username")
  }

  onPasswordChange() {
    return this.onChange("password")
  }

  onSubmit() {
    this.props.onNewPassword(this.state)
    this.setState({ website: "", username: "", password: "" })
  }

  render() {
    const { website, username, password } = this.state

    return (
      <div className="form">
        <div className="field">
          <p className="control has-icons-left has-icons-right">
            <input
              className="input"
              type="text"
              placeholder="Website"
              value={website}
              onChange={this.onWebsiteChange()}
            />
            <span className="icon is-small is-left">
              <i className="fas fa-envelope"></i>
            </span>
            <span className="icon is-small is-right">
              <i className="fas fa-check"></i>
            </span>
          </p>
        </div>
        <div className="field">
          <p className="control has-icons-left">
            <input
              className="input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={this.onUsernameChange()}
            />
            <span className="icon is-small is-left">
              <i className="fas fa-lock"></i>
            </span>
          </p>
        </div>
        <div className="field">
          <p className="control has-icons-left">
            <input
              className="input"
              type="text"
              placeholder="Password"
              value={password}
              onChange={this.onPasswordChange()}
            />
            <span className="icon is-small is-left">
              <i className="fas fa-lock"></i>
            </span>
          </p>
        </div>
        <div className="field">
          <p className="control">
            <button className="button is-success" onClick={this.onSubmit}>
              Save
            </button>
          </p>
        </div> 
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loggedIn: false,
      profile: null,
      passwords: [],
    }

    this.onLogout = this.onLogout.bind(this)
    this.onNewPassword = this.onNewPassword.bind(this)
    this.onPasswordDelete = this.onPasswordDelete.bind(this)
  }

  componentWillMount() {
    if (isUserSignedIn()) {
      const { profile } = loadUserData()

      getFile("passwords.json").then(passwords => {
        this.setState({
          loggedIn: true,
          profile,
          passwords: passwords ? JSON.parse(passwords) : [],
        })
      })
    }

    if (isSignInPending()) {
      handlePendingSignIn().then(function(userData) {
        window.location = window.location.origin
      })
    }
  }

  isLoggedIn() {
    return !!this.state.loggedIn
  }

  onLogout() {
    this.setState({
      loggedIn: false,
      profile: null,
      passwords: [],
    })
  }

  onNewPassword(values) {
    console.log(values)

    const { passwords } = this.state

    let newPasswords = [...passwords]

    newPasswords.unshift(Object.assign({}, values, { id: newPasswords.length }))

    putFile('passwords.json', JSON.stringify(newPasswords)).then(() => {
      this.setState({ passwords: newPasswords })
    })
  }

  onPasswordDelete(id) {
    const { passwords } = this.state
    const index = passwords.findIndex(({ id: _id }) => id === _id)

    const newPasswords = [...passwords]
    newPasswords.splice(index, 1)

    putFile("passwords.json", JSON.stringify(newPasswords))
      .then(() => this.setState({ passwords: newPasswords }))
  }

  render() {
    const { passwords } = this.state

    return (
      <div className="container app-container">
        {!this.isLoggedIn() &&
          <LoginModal />
        }
        {this.isLoggedIn() &&
          <div>
            <div className="section">
              <LogoutButton onLogout={this.onLogout} />
            </div>
            <div className="section">
              <AddPasswordForm onNewPassword={this.onNewPassword} />
            </div>
            <PasswordList
              passwords={passwords}
              onPasswordDelete={this.onPasswordDelete}
            />
          </div>
        }
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById("app"))