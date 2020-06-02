import React from "react";

export default class Submit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: null,
      address: null,
      type: null,
    };
    this.form = React.createRef();
  }

  render() {
    return (
      <div className="popup">
        <form name="resource" action="" ref={this.form}></form>
        <div className="row">
          <h1 style={{ width: "90%" }}>Add to our resource database!</h1>
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
          >
            <path
              fillRule="evenodd"
              d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.146-3.146a.5.5 0 0 0-.708-.708L8 7.293 4.854 4.146a.5.5 0 1 0-.708.708L7.293 8l-3.147 3.146a.5.5 0 0 0 .708.708L8 8.707l3.146 3.147a.5.5 0 0 0 .708-.708L8.707 8l3.147-3.146z"
            />
          </svg>
        </div>
        <br />
        <p style={{ padding: "1vw", marginTop: "1vh" }}>
          Your contribution will be verified and shown on the map. Note that if
          you receive at least 10 downvotes, your addition will be removed from
          the application.
        </p>
        <div className="row">
          <div style={{ position: "absolute", left: "10px", maxWidth: "30%" }}>
            Name of Resource
          </div>
          <input
            type="text"
            style={{ position: "absolute", right: "5vw", width: "60%" }}
          ></input>
        </div>
        <div className="row">
          <div style={{ position: "absolute", left: "10px", maxWidth: "30%" }}>
            Address
          </div>
          <input
            type="text"
            style={{ position: "absolute", right: "5vw", width: "60%" }}
          ></input>
        </div>
        <p>Type of resource: </p>
        <div className="row">
          <input
            style={{
              position: "absolute",
              width: "10%",
              left: "5%",
              transform: "translate(-30px,5px)",
            }}
            type="radio"
            name="type"
          ></input>
          <p style={{ position: "absolute", width: "90%", left: "10%" }}>
            Food bank
          </p>
        </div>
        <div className="row">
          <input
            style={{
              position: "absolute",
              width: "10%",
              left: "5%",
              transform: "translate(-30px,5px)",
            }}
            type="radio"
            name="type"
          ></input>
          <p style={{ position: "absolute", width: "90%", left: "10%" }}>
            Store
          </p>
        </div>
        <div className="row">
          <input
            style={{
              position: "absolute",
              width: "10%",
              left: "5%",
              transform: "translate(-30px,5px)",
            }}
            type="radio"
            name="type"
          ></input>
          <p style={{ position: "absolute", width: "90%", left: "10%" }}>
            Testing Center
          </p>
        </div>
        <button
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateY(-15px)",
          }}
          onClick={this.process}
        >
          Submit
        </button>
      </div>
    );
  }
}
