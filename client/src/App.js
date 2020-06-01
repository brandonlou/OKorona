import React from "react";
import ReactMapGL from "react-map-gl";
import Search from "./search.js";
import SearchBox from "./searchbox.js";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { css } from "emotion";
import Nav from "./Nav.js";
import Mark from "./marker.js";
import Submit from "./submit.js";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      viewport: {
        width: 400,
        height: 400,
        latitude: 34.052235,
        longitude: -118.453683,
        zoom: 13,
      },
      showFoodbanks: true,
      clear: false,
      autoComp: {},
      testing: {},
      stores: {},
      bounds: {},
      showForm: false,
    };
    this.elements = [
      { lat: 37.77993, lon: -121.97802, id: 0, Ref: React.createRef() },
      { lat: 37.7239, lon: -121.93103, id: 1, Ref: React.createRef() },
      { lat: 37.72, lon: -121.9031, id: 2, Ref: React.createRef() },
    ];
    this.pastFood = [];
    this.foodbanks = [];
    this.zips = [];
    this.nav = null;
    this.research = false;
    this.map = null;
    this.mapRef = React.createRef();
    this.options = {};
    this.onViewportChange = this._onViewportChange.bind(this);
    this.autoComplete = this.autoComplete.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.clearResults = this.clearResults.bind(this);
    this.reSearch = this.reSearch.bind(this);
    this.getZip = this.getZip.bind(this);
    this.showFood = this.showFood.bind(this);
    this.userLoc = this.userLoc.bind(this);
    // this.bringToTop = this.bringToTop.bind(this);
    //this.getBounds = this.getBounds.bind(this);
  }
  _onViewportChange = (viewport) => {
    this.setState({ viewport: viewport });
    // if (this.map) {
    //   const bounds = this.map.getMap().getBounds();
    //   this.setState({
    //     bounds: {
    //       minLat: bounds["_sw"]["lat"],
    //       minLon: bounds["_sw"]["lng"],
    //       maxLat: bounds["_ne"]["lat"],
    //       maxLon: bounds["_ne"]["lng"],
    //     },
    //   });
    //   this.getZipInBound();
    // }
  };

  componentWillMount() {
    this.nav = new Nav(this.userLoc);
    this.nav.getLocation();
  }
  showFood() {
    this.setState({
      showFoodbanks: !this.state.showFoodbanks,
    });
  }

  userLoc(lat, lon) {
    this.setState({
      viewport: {
        width: 400,
        height: 400,
        latitude: lat,
        longitude: lon,
        zoom: this.state.viewport.zoom,
      },
    });
  }
  componentDidMount() {
    this.map = this.mapRef.current;

    if (this.nav !== null) {
      this.userLoc(this.nav.latitude, this.nav.longitude);
    }
    // if (this.elements[0]["Ref"].current) {
    //   this.bringToTop();
    // }
  }
  // componentDidUpdate() {
  //   if (this.elements[0]["Ref"].current) {
  //     this.bringToTop();
  //   }
  // }
  clearResults(bool) {
    this.setState({
      clear: bool,
    });
  }

  reSearch(bool) {
    this.research = bool;
  }

  getZipInBound() {
    this.zips = [];
    const diffLat =
      (this.state.bounds["maxLat"] - this.state.bounds["minLat"] + 0.2) * 0.1;
    const diffLon =
      (this.state.bounds["maxLon"] - this.state.bounds["minLon"] + 0.2) * 0.1;
    for (
      let i = this.state.bounds["minLat"] - 0.1;
      i <= this.state.bounds["maxLat"] + 0.1;
      i += diffLat
    ) {
      for (
        let j = this.state.bounds["minLon"] - 0.1;
        j <= this.state.bounds["maxLon"] + 0.1;
        j += diffLon
      ) {
        this.getZip(i, j);
      }
    }
  }

  getZip(lat, lon) {
    let endpoint =
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
      lon +
      "%2C%20" +
      lat;
    let query =
      ".json?access_token=pk.eyJ1IjoiYXNobGV5dHoiLCJhIjoiY2s5ajV4azIwMDQ4aDNlbXAzZnlwZ2U0YyJ9.P2n2zrXhGxl1xhFoEdNTnw";
    fetch(endpoint + query)
      .then((response) => response.json())
      .then((results) => {
        let zip = null;
        if (!results["features"]) return;
        for (const id of results["features"]["0"]["context"]) {
          if (id["id"].startsWith("postcode")) zip = parseInt(id["text"]);
        }
        if (!zip) {
          return;
        }
        if (!(this.zips.indexOf(zip) >= 0)) this.zips.push(zip);
      });
  }
  getFoodbanks(zip) {
    if (!this.state.showFoodbanks) return;
    fetch("foodbanks/" + zip)
      .then((response) => response.json())
      .then((results) => {
        for (const result of results) {
          let endpoint =
            "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
            result["address"].replace(" ", "+");
          let query =
            ".json?&access_token=pk.eyJ1IjoiYXNobGV5dHoiLCJhIjoiY2s5ajV4azIwMDQ4aDNlbXAzZnlwZ2U0YyJ9.P2n2zrXhGxl1xhFoEdNTnw";
          fetch(endpoint + query)
            .then((response2) => response2.json())
            .then((results2) => {
              if (results2["features"]) {
                for (const bank of this.foodbanks) {
                  if (bank["id"] == results2["features"][0]["id"]) return;
                }
                this.foodbanks.push(results2["features"][0]);
              }
            });
        }
      });
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
    this.clearResults(false);
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
              <SearchBox
                onClick={() =>
                  this.userLoc(
                    option["geometry"]["coordinates"][1],
                    option["geometry"]["coordinates"][0]
                  )
                }
                key={option["id"]}
                address={option["place_name"]}
              />
            );
          })}
        </React.Fragment>
      );
    }
  }

  componentWillUpdate() {
    if (this.zips.length > 0) {
      for (const zip of this.zips) {
        this.getFoodbanks(zip);
      }
    }
    if (this.foodbanks) {
      this.pastFood = this.foodbanks.slice(0);
    }
  }

  // bringToTop(obj) {
  //   let elem = this.elements;
  //   if (!obj) return;
  //   console.log(obj);
  //   window.getComputedStyle(obj).getPropertyValue("z-index") =
  //   obj.style.zIndex = 10;
  //   for (let i = 0; i < elem.length; i++) {
  //     if (elem[i]["id"] !== obj.state["id"]) {
  //       elem[i]["Ref"].current.style.zIndex = 1;
  //     }
  //   }
  //   for (let j = 0; j < elem.length; j++) {
  //     elem[j]["Ref"].current.handleClick = function (num) {
  //       for (let k = 0; k < elem.length; k++) {
  //         if (elem) {
  //           elem[k]["Ref"].current.style.zIndex = 10;
  //         } else {
  //           elem[k]["Ref"].current.style.zIndex = 1;
  //         }
  //       }
  //     };
  //     console.log(elem[j]["Ref"].current.handleClick);
  //   }
  // }

  render() {
    return (
      <div className="App">
        {this.state.showForm ? <Submit className="popup" /> : <div></div>}
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
            Show Foodbanks
            <input
              type="checkbox"
              defaultChecked="true"
              text="Show Foodbanks"
              onClick={this.showFood}
            ></input>
            <div className="search">
              <Search
                enter={() => {
                  if (this.state.autoComp["features"]) {
                    this.userLoc(
                      this.state.autoComp["features"][0]["geometry"][
                        "coordinates"
                      ][1],
                      this.state.autoComp["features"][0]["geometry"][
                        "coordinates"
                      ][0]
                    );
                  }
                }}
                autoComplete={this.autoComplete}
                clearResults={this.clearResults}
                reSearch={this.reSearch}
              />
            </div>
            <div className="searchwindow">{this.getOptions()}</div>
            <button
              onClick={() => {
                this.setState({
                  showForm: true,
                });
              }}
              style={{ position: "absolute", bottom: "5px" }}
            >
              Add Resource
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
              minZoom={10}
              mapboxApiAccessToken="pk.eyJ1IjoiYXNobGV5dHoiLCJhIjoiY2s5ajV4azIwMDQ4aDNlbXAzZnlwZ2U0YyJ9.P2n2zrXhGxl1xhFoEdNTnw"
              onViewportChange={this._onViewportChange}
              mapStyle="mapbox://styles/ashleytz/ckaepanj10jmq1hr4ivacke50"
              ref={this.mapRef}
            >
              {this.state.showFoodbanks === true ? (
                this.elements.map((pt) => (
                  <Mark
                    // click={(i) => this.bringToTop(i)}
                    ref={pt["Ref"]}
                    key={pt["id"]}
                    lat={pt["lat"]}
                    lon={pt["lon"]}
                  />
                ))
              ) : (
                <div></div>
              )}
              {this.state.showFoodbanks === true && this.pastFood ? (
                this.pastFood.map((pt) => {
                  const lat = pt["geometry"]["coordinates"][1];
                  const lon = pt["geometry"]["coordinates"][0];
                  return <Mark key={String(pt["id"])} lat={lat} lon={lon} />;
                })
              ) : (
                <div></div>
              )}
            </ReactMapGL>
          </div>
        </div>
      </div>
    );
  }
}
