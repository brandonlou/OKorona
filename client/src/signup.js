import React from "react";

const fetch = require("node-fetch");

export default class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signup: false,
      user: "",
      pass: "",
      email: "",
    };
    this.form = React.createRef();
    this.handleUser = this.handleUser.bind(this);
    this.handlePass = this.handlePass.bind(this);
    this.handleEmail = this.handleEmail.bind(this);
  }
  handleUser(event) {
    this.setState({
      user: event.target.value,
    });
  }

  handlePass(event) {
    this.setState({
      pass: event.target.value,
    });
  }

  handleEmail(event) {
    this.setState({
      email: event.target.value,
    });
  }
  handleSubmit = () => {
    fetch('./api/login', {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        "username": this.state.user,
        "password": this.state.pass
      })
    })
    .then((userID) => {
      localStorage.setItem("userID", userID);
    })
    .catch((error) => {
      alert("Invalid username!");
      console.log(error);
    });
  };

  render() {
    return (
      <div className="popup">
        <form name="log-in" onSubmit={this.handleSubmit}>
          <div className="row">
            <svg
              onClick={this.props.onClick}
              style={{
                position: "absolute",
                width: "5%",
                right: "2%",
                margin: "2%",
                height: "2vh",
              }}
              className="bi bi-x-circle-fill"
              width="1em"
              height="1em"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.146-3.146a.5.5 0 0 0-.708-.708L8 7.293 4.854 4.146a.5.5 0 1 0-.708.708L7.293 8l-3.147 3.146a.5.5 0 0 0 .708.708L8 8.707l3.146 3.147a.5.5 0 0 0 .708-.708L8.707 8l3.147-3.146z"
              />
            </svg>
          </div>
          <div
            style={{
              display: "flex",
            }}
          >
            <div className="logo" />
            <h2 className="okorona">OKorona</h2>
          </div>
          <div
            className="row"
            style={{ position: "absolute", transform: "translate(5vw,13vh)" }}
          >
            <p
              style={{ width: "10vw" }}
              onClick={() => {
                this.setState({
                  signup: false,
                });
              }}
            >
              LOG IN
            </p>
            <p
              style={{ width: "10vw" }}
              onClick={() => {
                this.setState({
                  signup: true,
                });
              }}
            >
              SIGN UP
            </p>
          </div>
          <div style={{ transform: "translateY(18vh)" }}>
            <div className="row">
              <label
                style={{ position: "absolute", left: "5%", maxWidth: "30%" }}
              >
                Username
              </label>
              <input
                type="text"
                value={this.state.user}
                onChange={this.handleUser}
                style={{ position: "absolute", right: "5vw", width: "60%" }}
              ></input>
            </div>
            <div className="row">
              <label
                style={{ position: "absolute", left: "5%", maxWidth: "30%" }}
              >
                Password
              </label>
              <input
                type="password"
                value={this.state.pass}
                onChange={this.handlePass}
                style={{ position: "absolute", right: "5vw", width: "60%" }}
              ></input>
            </div>
            {this.state.signup ? (
              <div className="row">
                <label
                  style={{ position: "absolute", left: "5%", maxWidth: "30%" }}
                >
                  E-mail
                </label>
                <input
                  type="text"
                  value={this.state.email}
                  onChange={this.handleEmail}
                  style={{ position: "absolute", right: "5vw", width: "60%" }}
                ></input>
              </div>
            ) : (
              <div></div>
            )}
          </div>
          <button
            type="submit"
            style={{
              position: "absolute",
              left: "50%",
              bottom: "5%",
            }}
          >
            Submit
          </button>
        </form>
      </div>
    );
  }
}
