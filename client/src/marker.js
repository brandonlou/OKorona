import React from "react";
import { Marker } from "react-map-gl";

const navigateBaseUrl = "https://www.google.com/maps/dir/";

export default class Mark extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: this.props.address,
      name: this.props.name,
      lat: this.props.lat,
      lon: this.props.lon,
      id: this.props.id,
      type: this.props.type,
      showInfo: false,
      color: this.props.color,
      votes: this.props.votes,
      userVote: 0,
    };
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleNavigate = this.handleNavigate.bind(this);
  }
  componentDidMount() {
    for (const resource of JSON.parse(localStorage.getItem("upvotes"))) {
      console.log(resource + " " + this.state.id);
      if (this.state.id === resource) {
        console.log("Upvoted");
        this.setState({
          userVote: 1,
        });
      }
    }
    for (const resource of JSON.parse(localStorage.getItem("downvotes"))) {
      if (this.state.id === resource)
        this.setState({
          userVote: -1,
        });
    }
  }
  handleMarkerClick() {
    this.setState({
      showInfo: true,
    });
  }

  handleClick() {
    this.setState({
      showInfo: false,
    });
  }

  handleNavigate() {
    window.open(
      navigateBaseUrl + "/" + this.state.lat + "," + this.state.lon + "/@?hl=en"
    );
  }

  increaseValue(value) {
    const user = localStorage.getItem("userID");
    let upvotes = JSON.parse(localStorage.getItem("upvotes"));
    let downvotes = JSON.parse(localStorage.getItem("downvotes"));
    const resource = this.state.id;
    console.log(user + " " + resource);
    console.log(upvotes);
    console.log(downvotes);
    switch (value) {
      case "good":
        /***IF USER VOTED ALREADY SWITCH THE VOTES ***/
        if (upvotes.indexOf(resource) > -1) {
          const index = upvotes.indexOf(resource);
          upvotes.splice(index, 1);
          this.setState({
            votes: this.state.votes - 1,
            userVote: 0,
          });
          fetch("./api/downvote", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              userID: user,
              resourceID: resource,
            }),
          })
            .then((response) => {
              console.log(response);
            })
            .catch((error) => console.log(error));
          localStorage.setItem("upvotes", JSON.stringify(upvotes));
          return;
        } else if (downvotes.indexOf(resource) > -1) {
          const index = downvotes.indexOf(resource);
          downvotes.splice(index, 1);
          this.setState({
            votes: this.state.votes + 1,
            userVote: 0,
          });
          localStorage.setItem("downvotes", JSON.stringify(downvotes));
        } else {
          upvotes.push(resource);
          this.setState({
            votes: this.state.votes + 1,
            userVote: 1,
          });
        }
        localStorage.setItem("upvotes", JSON.stringify(upvotes));
        fetch("./api/upvote", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            userID: user,
            resourceID: resource,
          }),
        })
          .then((response) => {
            console.log(response);
          })
          .catch((error) => console.log(error));
        //fetch(post to database about the upvote)
        break;
      case "bad":
        /***IF USER VOTED ALREADY SWITCH THE VOTES ***/
        if (downvotes.indexOf(resource) > -1) {
          const index = downvotes.indexOf(resource);
          downvotes.splice(index, 1);
          this.setState({
            votes: this.state.votes + 1,
            userVote: 0,
          });
          fetch("./api/upvote", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              userID: user,
              resourceID: resource,
            }),
          })
            .then((response) => {
              console.log(response);
            })
            .catch((error) => console.log(error));
          localStorage.setItem("upvotes", JSON.stringify(downvotes));
          return;
        } else if (upvotes.indexOf(resource) > -1) {
          const index = upvotes.indexOf(resource);
          upvotes.splice(index, 1);
          this.setState({
            votes: this.state.votes - 1,
            userVote: 0,
          });
          localStorage.setItem("downvotes", JSON.stringify(upvotes));
        } else {
          downvotes.push(resource);
          this.setState({
            votes: this.state.votes - 1,
            userVote: -1,
          });
        }
        localStorage.setItem("downvotes", JSON.stringify(downvotes));
        fetch("./api/downvote", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            userID: user,
            resourceID: resource,
          }),
        })
          .then((response) => {
            console.log(response);
          })
          .catch((error) => console.log(error));
        break;
      default:
        return;
    }
  }
  render() {
    return (
      <Marker latitude={this.state.lat} longitude={this.state.lon}>
        <div className="markerSymbol" onClick={this.handleMarkerClick}>
          <svg
            className="bi bi-geo-alt"
            width="2em"
            height="2em"
            viewBox="0 0 16 16"
            fill={this.state.showInfo ? "rgb(187, 183, 163)" : this.state.color}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
            />
          </svg>
        </div>
        {this.state.showInfo ? (
          <div className="markerInfo">
            <div className="markerHead">
              <h5 style={{ width: "95%" }}>{this.state.name}</h5>
              <svg
                onClick={() => {
                  this.handleClick();
                  console.log(this.state.id);
                  console.log(this.state.userVote);
                }}
                style={{ width: "5%" }}
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
            <div>Address: {this.state.address}</div>
            <div>
              Facility Type:{" "}
              {this.state.type
                .replace("_", " ")
                .replace(/(?:\s(.))|(?:^(.))/g, (c) =>
                  c.length === 1
                    ? c.charAt(0).toUpperCase()
                    : " " + c.charAt(1).toUpperCase()
                )}
            </div>
            <div
              style={{
                position: "absolute",
                width: "auto",
                maxWidth: "85%",
                bottom: "0",
                margin: "8%",
              }}
              className="button"
              id="navigate"
              onClick={this.handleNavigate}
            >
              Navigate (Google Maps)
            </div>
            <div className="markerBottom">
              <svg
                className="bi bi-caret-up-fill"
                width="1em"
                height="1em"
                viewBox="0 0 16 16"
                fill={this.state.userVote === 1 ? "orange" : "currentColor"}
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => {
                  if (localStorage.getItem("userID") !== null) {
                    this.increaseValue("good");
                  } else {
                    this.props.signUp();
                  }
                }}
              >
                <path d="M7.247 4.86l-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
              </svg>
              {this.state.votes}
              <svg
                className="bi bi-caret-down-fill"
                width="1em"
                height="1em"
                viewBox="0 0 16 16"
                fill={this.state.userVote === -1 ? "orange" : "currentColor"}
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => {
                  if (localStorage.getItem("userID") !== null) {
                    this.increaseValue("bad");
                  } else {
                    this.props.signUp();
                  }
                }}
              >
                <path d="M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
              </svg>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </Marker>
    );
  }
}
