import React from "react";

const fetch = require("node-fetch");

export default class Submit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      address: "",
      type: "Foodbank",
    };
    this.select = React.createRef();
    this.handleName = this.handleName.bind(this);
    this.handleAddress = this.handleAddress.bind(this);
    this.handleType = this.handleType.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleName(event) {
    this.setState({
      name: event.target.value,
    });
  }
  handleAddress(event) {
    this.setState({
      address: event.target.value,
    });
  }

  handleType(event) {
    this.setState({
      type: event.target.value,
    });
  }

  handleSubmit = (e) => {
    let type = "";
    switch (this.state.type) {
      case "Foodbank":
        type = "foodbank";
        break;
      case "Store":
        type = "store";
        break;
      case "Testing Center":
        type = "testing_site";
        break;
      default:
        break;
    }
    e.preventDefault();
    fetch("./api/add_resource", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        name: this.state.name,
        type: type,
        address: this.state.address,
      }),
    })
      .then((response) => {
        if (response["ok"] === false) {
          alert("Gateway Timeout");
          return;
        }
        this.props.getLoc();
        this.props.onClick();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    return (
      <div className="popup">
        <form name="resource" onSubmit={(e) => this.handleSubmit(e)}>
          <div className="row">
            <h2 style={{ width: "95%", textAlign: "center" }}>
              Add to our resource database!
            </h2>
            <svg
              onClick={this.props.onClick}
              style={{
                width: "5%",
                transform: "translate(-7px,7px)",
              }}
              className="bi bi-x-circle-fill"
              width="1em"
              height="1em"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              cursor="pointer"
            >
              <path
                fillRule="evenodd"
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.146-3.146a.5.5 0 0 0-.708-.708L8 7.293 4.854 4.146a.5.5 0 1 0-.708.708L7.293 8l-3.147 3.146a.5.5 0 0 0 .708.708L8 8.707l3.146 3.147a.5.5 0 0 0 .708-.708L8.707 8l3.147-3.146z"
              />
            </svg>
          </div>
          <p style={{ padding: "1vw", marginTop: "1vh" }}>
            Your contribution will be verified and shown on the map. Note that
            if you receive at least 10 downvotes, your addition will be removed
            from the application.
          </p>
          <div className="row">
            <label
              style={{ position: "absolute", left: "5%", maxWidth: "30%" }}
            >
              Name of Resource
            </label>
            <input
              type="text"
              value={this.state.name}
              onChange={this.handleName}
              style={{ position: "absolute", right: "5vw", width: "60%" }}
            ></input>
          </div>
          <div className="row">
            <label
              style={{ position: "absolute", left: "5%", maxWidth: "30%" }}
            >
              Address
            </label>
            <input
              type="text"
              value={this.state.address}
              onChange={this.handleAddress}
              style={{ position: "absolute", right: "5vw", width: "60%" }}
            ></input>
          </div>
          <div className="row" style={{ height: "5vh" }}>
            <label
              style={{ position: "absolute", left: "5%", maxWidth: "30%" }}
            >
              Type of resource:
            </label>
            <select
              value={this.state.type}
              onChange={this.handleType}
              style={{ position: "absolute", left: "32%" }}
              ref={this.select}
            >
              <option value="Foodbank">Foodbank</option>
              <option value="Store">Store</option>
              <option value="Testing Center">Testing Center</option>
            </select>
          </div>
          <button
            className="button"
            type="submit"
            style={{
              position: "absolute",
              left: "45%",
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
