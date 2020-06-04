import React from "react";
import { Marker } from "react-map-gl";
export default class Mark extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
    this.state = {
      address: this.props.address,
      name: this.props.name,
      lat: this.props.lat,
      lon: this.props.lon,
      id: this.props.id,
      type: this.props.type,
      link:
        "https://google.com/maps/search/" +
        this.props.address.replace(/\s/g, "+") +
        "/@" +
        this.props.lat +
        "," +
        this.props.lon,
      showInfo: false,
      votes: this.props.votes,
      user: localStorage.getItem("userID"),
    };
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  handleMouseEnter() {
    this.setState({
      showInfo: true,
    });
  }

  handleClick() {
    this.setState({
      showInfo: false,
    });
  }

  increaseValue(value) {
    switch (value) {
      case "good":
        /***IF USER VOTED ALREADY SWITCH THE VOTES ***/
        fetch("./api/vote", {
          method: "POST",
          header: { "Content-type": "application/json" },
          body: {
            id: this.state.id,
            value: 1,
          },
        });
        this.setState({
          good: this.state.good + 1,
        });
        //fetch(post to database about the upvote)
        break;
      case "bad":
        /***IF USER VOTED ALREADY SWITCH THE VOTES ***/
        fetch("./api/vote", {
          method: "POST",
          header: { "Content-type": "application/json" },
          body: {
            id: this.state.id,
            value: -1,
          },
        });
        this.setState({
          bad: this.state.bad + 1,
        });
        //fetch(post to database about the upvote)
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <Marker latitude={this.state.lat} longitude={this.state.lon}>
        <div className="markerSymbol" onMouseEnter={this.handleMouseEnter}>
          <svg
            className="bi bi-geo-alt"
            width="2em"
            height="2em"
            viewBox="0 0 16 16"
            fill={this.state.showInfo ? "rgb(187, 183, 163)" : "red"}
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
                onClick={this.handleClick}
                style={{ width: "5%" }}
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
            <div>
              <a
                href={this.state.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Navigation Route
              </a>
            </div>
            <div className="markerBottom">
              <svg
                className="bi bi-caret-up-fill"
                width="1em"
                height="1em"
                viewBox="0 0 16 16"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => {
                  if (localStorage.getItem("userID") !== null)
                    this.increaseValue("bad");
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
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => {
                  if (localStorage.getItem("userID") !== null)
                    this.increaseValue("good");
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
