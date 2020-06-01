import React from "react";

export default class Submit extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="popup">
        <h1>Add to our resource database!</h1>
        <br />
        <p>
          Your contribution will be verified and shown on the map. Note that if
          you receive at least 10 downvotes, your addition will be removed from
          the application.
        </p>
        <div className="row">
          <p>Name of Resource: </p>
          <input type="text" style={{ float: "right" }}></input>
        </div>
        <div className="row">
          <p>Address: </p>
          <input type="text" style={{ float: "right" }}></input>
        </div>
        <p>Type of resource: </p>
        <div className="row">
          <input type="checkbox" text="Foodbank"></input>
          <p>Food bank</p>
        </div>
        <div className="row">
          <input type="checkbox" text="Foodbank"></input>
          <p>Store</p>
        </div>
        <div className="row">
          <input type="checkbox" text="Foodbank"></input>
          <p>Testing Center</p>
        </div>
      </div>
    );
  }
}
