import React from "react";
import data from "../src/exGeo.json";
import ReactMapGL, { Marker } from "react-map-gl";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { css } from "emotion";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      viewport: {
        width: 400,
        height: 400,
        latitude: 34.052235,
        longitude: -118.453683,
        zoom: 9,
      },
      value: "",
      showDonations: true,
    };
    this.map = null;
    this.mapRef = React.createRef();
    this.data = [];
    this.search = React.createRef();
    this.query = "";
    this.onViewportChange = this._onViewportChange.bind(this);
  }

  _onViewportChange = (viewport) => {
    this.setState({ viewport: viewport });
  };
  componentWillMount() {
    this.data = data;
  }
  componentDidMount() {
    this.map = this.mapRef.current;
    if (!this.map) {
      return;
    }
    // this.map = this.map.getMap();
    // this.map.on("load", () => {
    //   this.map.addSource("accounts", {
    //     type: "geojson",
    //     data: this.data,
    //   });
    // });
  }

  componentWillUpdate() {
    //get new data
  }

  render() {
    return (
      <div className="App">
        <div
          className={css`
            display: flex;
          `}
        >
          <div
            className={css`
              width: 30vw;
              height: 100vw;
            `}
            style={{ display: "inline", margin: "5px" }}
          >
            <input
              type="text"
              id="search"
              placeholder="Search..."
              style={{ width: "80%" }}
              ref={this.search}
            ></input>
            <button
              className="submit"
              onClick={() => {
                this.setState({
                  query: this.search.value,
                });
              }}
              style={{ width: "20%" }}
            >
              Search
            </button>
          </div>
          <div
            className={css`
              height: 100vh;
              width: 80vw;
            `}
          >
            <ReactMapGL
              {...this.state.viewport}
              width="100%"
              height="100%"
              maxZoom={20}
              mapboxApiAccessToken="pk.eyJ1IjoiZ2FuZ3N0YTEyMzQ1dGVzdCIsImEiOiJjazhiNXBqaGMwMGV4M2VqeHZ6eGc3bWhiIn0.PdIld03YzyQxkORAfJL91g"
              onViewportChange={this._onViewportChange}
              mapStyle="mapbox://styles/ashleytz/ckaepanj10jmq1hr4ivacke50"
              // ref={this.mapRef}
            >
              {data["features"].map((pt) => {
                return (
                  <Marker
                    key={pt["properties"]["id"]}
                    latitude={pt["geometry"]["coordinates"][1]}
                    longitude={pt["geometry"]["coordinates"][0]}
                  >
                    <button>
                      <svg
                        class="bi bi-bag-fill"
                        width="1em"
                        height="1em"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M1 4h14v10a2 2 0 01-2 2H3a2 2 0 01-2-2V4zm7-2.5A2.5 2.5 0 005.5 4h-1a3.5 3.5 0 117 0h-1A2.5 2.5 0 008 1.5z" />
                      </svg>
                    </button>
                  </Marker>
                );
              })}
            </ReactMapGL>
          </div>
        </div>
      </div>
    );
  }
}
