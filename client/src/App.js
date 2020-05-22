import React from "react";
import data from "./exGeo.json";
import ReactMapGL, { Marker } from "react-map-gl";
import Search from "./search.js";
import SearchBox from "./searchbox.js";
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
      showDonations: true,
      autoComp: {},
      clear: false,
    };
    this.research = false;
    this.map = null;
    this.mapRef = React.createRef();
    this.data = [];
    this.options = {};
    this.onViewportChange = this._onViewportChange.bind(this);
    this.autoComplete = this.autoComplete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.clearResults = this.clearResults.bind(this);
    this.reSearch = this.reSearch.bind(this);
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
  clearResults() {
    this.setState({
      clear: true,
    });
  }

  reSearch(bool) {
    this.research = bool;
  }

  autoComplete(address) {
    if (!this.research) return;
    this.setState({
      clear: false,
    });
    let endpoint =
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" + address;
    let query =
      ".json?&access_token=pk.eyJ1IjoiYXNobGV5dHoiLCJhIjoiY2s5ajV4azIwMDQ4aDNlbXAzZnlwZ2U0YyJ9.P2n2zrXhGxl1xhFoEdNTnw";
    fetch(endpoint + query)
      .then((response) => response.json())
      .then((results) => {
        this.setState({
          autoComp: results,
        });
      })
      .catch((error) => {});
    this.reSearch(false);
  }

  handleSubmit() {
    console.log("submit");
  }

  getOptions() {
    if (this.state.clear) return;
    if (this.state.autoComp["features"]) {
      return (
        <React.Fragment>
          <p style={{ height: "1vh", fontSize: "8px" }}>
            <em>Search Results</em>
          </p>
          {this.state.autoComp["features"].map((option) => {
            return (
              <SearchBox key={option["id"]} address={option["place_name"]} />
            );
          })}
        </React.Fragment>
      );
    }
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
              width: 20vw;
              height: 100vw;
              margin: 5px;
            `}
          >
            <div className="search">
              <Search
                autoComplete={this.autoComplete}
                clearResults={this.clearResults}
                reSearch={this.reSearch}
              />
            </div>
            <div className="searchwindow">{this.getOptions()}</div>
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
              mapboxApiAccessToken="pk.eyJ1IjoiYXNobGV5dHoiLCJhIjoiY2s5ajV4azIwMDQ4aDNlbXAzZnlwZ2U0YyJ9.P2n2zrXhGxl1xhFoEdNTnw"
              onViewportChange={this._onViewportChange}
              mapStyle="mapbox://styles/gangsta12345test/ck8b63tva08qe1jpdba1keneo"
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
                        className="bi bi-bag-fill"
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
