import React from "react";
import ReactMapGL from "react-map-gl";
import Search from "./search.js";
import SearchBox from "./searchbox.js";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { css } from "emotion";
import Nav from "./Nav.js";
import Mark from "./marker.js";
import Submit from "./submit.js";
import SignUp from "./signup.js";
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
      showStore: true,
      showTest: true,
      clear: false,
      autoComp: {},
      showForm: false,
      showSign: false,
      // userLoggedIn: localStorage.getItem("LoggedIn") ? true : false,
    };
    this.theme = [
      {
        name: "Frank",
        markers: "red",
        info: "pink",
      },
    ];
    this.testing = [
      {
        _id: "1",
        address: "1998 Market Street San Francisco CA 914102",
        location: {
          coordinates: [-121.97802, 37.77993],
          type: "Point",
        },
        name: "Castro Urgent Care San Francisco - Carbon Health",
        type: "testing_site",
        votes: 0,
      },
    ];
    this.change = false;
    this.origin = [];
    this.stores = [];
    this.foodbanks = [];
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
    this.userLoc = this.userLoc.bind(this);
    this.getLocations = this.getLocations.bind(this);
    // this.bringToTop = this.bringToTop.bind(this);
  }

  _onViewportChange = (viewport) => {
    // console.log("Logged in? " + localStorage.getItem("loggedIn"));
    // console.log("User ID: " + localStorage.getItem("userID"));
    this.setState({ viewport: viewport });
    if (this.map) {
      this.getLocations();
    }
  };

  componentWillMount() {
    this.nav = new Nav(this.userLoc);
    this.nav.getLocation();
  }

  getLocations() {
    const bounds = this.map.getMap().getBounds();
    const halfLat = (bounds._ne.latitude - bounds._sw.latitude) / 2;
    const halfLon = (bounds._ne.longitude = bounds._sw.longitude) / 2;
    const maxRad = Math.sqrt(
      Math.pow(halfLat + 1, 2) + Math.pow(halfLon + 1, 2)
    );
    const radius = Math.sqrt(
      Math.pow(this.state.viewport.latitude - this.origin.latitude, 2) +
        Math.pow(this.state.viewport.longitude - this.origin.longitude, 2)
    );
    if ((radius > maxRad - 0.4) | this.change) {
      fetch("./api/get_resource", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trLon: bounds._ne.lng + 2,
          trLat: bounds._ne.lat + 2,
          blLon: bounds._sw.lng - 2,
          blLat: bounds._sw.lat - 2,
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          console.log(json);
          for (const obj of json) {
            let add = true;
            switch (obj.type) {
              case "testing_site":
                for (const elem of this.testing) {
                  if (elem["_id"] === obj["_id"]) {
                    add = false;
                  }
                }
                if (add) this.testing.push(obj);
                break;
              case "foodbank":
                for (const elem of this.foodbanks) {
                  if (elem["_id"] === obj["_id"]) {
                    add = false;
                  }
                }
                if (add) this.foodbanks.push(obj);
                break;
              case "store":
                for (const elem of this.stores) {
                  if (elem["_id"] === obj["_id"]) {
                    add = false;
                  }
                }
                if (add) this.stores.push(obj);
                break;
                default:
                  break;
            }
          }
        })
        .catch((error) => console.log(error));
      this.origin = [
        this.state.viewport.latitude,
        this.state.viewport.longitude,
      ];
      this.change = false;
    }
  }

  userLoc(lat, lon) {
    this.setState({
      viewport: {
        width: 400,
        height: 400,
        latitude: lat,
        longitude: lon,
        zoom: this.state.viewport.zoom,
        clear: true,
      },
    });
    this.change = true;
    this.origin = [this.state.viewport.latitude, this.state.viewport.longitude];
  }
  componentDidMount() {
    this.map = this.mapRef.current;

    if (this.nav !== null) {
      this.userLoc(this.nav.latitude, this.nav.longitude);
    }

    this.getLocations();
  }

  clearResults(bool) {
    this.setState({
      clear: bool,
    });
  }

  reSearch(bool) {
    this.research = bool;
  }

  // getZipInBound() {
  //   this.zips = [];
  //   const diffLat =
  //     (this.state.bounds["maxLat"] - this.state.bounds["minLat"] + 0.2) * 0.1;
  //   const diffLon =
  //     (this.state.bounds["maxLon"] - this.state.bounds["minLon"] + 0.2) * 0.1;
  //   for (
  //     let i = this.state.bounds["minLat"] - 0.1;
  //     i <= this.state.bounds["maxLat"] + 0.1;
  //     i += diffLat
  //   ) {
  //     for (
  //       let j = this.state.bounds["minLon"] - 0.1;
  //       j <= this.state.bounds["maxLon"] + 0.1;
  //       j += diffLon
  //     ) {
  //       this.getZip(i, j);
  //     }
  //   }
  // }

  // getZip(lat, lon) {
  //   let endpoint =
  //     "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
  //     lon +
  //     "%2C%20" +
  //     lat;
  //   let query =
  //     ".json?access_token=pk.eyJ1IjoiYXNobGV5dHoiLCJhIjoiY2s5ajV4azIwMDQ4aDNlbXAzZnlwZ2U0YyJ9.P2n2zrXhGxl1xhFoEdNTnw";
  //   fetch(endpoint + query)
  //     .then((response) => response.json())
  //     .then((results) => {
  //       let zip = null;
  //       if (!results["features"]) return;
  //       for (const id of results["features"]["0"]["context"]) {
  //         if (id["id"].startsWith("postcode")) zip = parseInt(id["text"]);
  //       }
  //       if (!zip) {
  //         return;
  //       }
  //       if (!(this.zips.indexOf(zip) >= 0)) this.zips.push(zip);
  //     });
  // }
  // getFoodbanks(zip) {
  //   if (!this.state.showFoodbanks) return;
  //   fetch("foodbanks/" + zip)
  //     .then((response) => response.json())
  //     .then((results) => {
  //       for (const result of results) {
  //         let endpoint =
  //           "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
  //           result["address"].replace(" ", "+");
  //         let query =
  //           ".json?&access_token=pk.eyJ1IjoiYXNobGV5dHoiLCJhIjoiY2s5ajV4azIwMDQ4aDNlbXAzZnlwZ2U0YyJ9.P2n2zrXhGxl1xhFoEdNTnw";
  //         fetch(endpoint + query)
  //           .then((response2) => response2.json())
  //           .then((results2) => {
  //             if (results2["features"]) {
  //               for (const bank of this.foodbanks) {
  //                 if (bank["id"] === results2["features"][0]["id"]) return;
  //               }
  //               this.foodbanks.push(results2["features"][0]);
  //             }
  //           });
  //       }
  //     });
  // }

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
    // if (this.zips.length > 0) {
    //   for (const zip of this.zips) {
    //     this.getFoodbanks(zip);
    //   }
    // }
    // if (this.foodbanks) {
    //   this.pastFood = this.foodbanks.slice(0);
    // }
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
        {this.state.showSign ? (
          <SignUp
            onClick={() => {
              this.setState({
                showSign: false,
              });
            }}
          />
        ) : (
          <div />
        )}
        {this.state.showForm ? (
          <Submit
            getLoc={this.getLocations}
            onClick={() => {
              this.setState({
                showForm: false,
              });
            }}
            sendForm={(form) => this.sendForm(form)}
          />
        ) : (
          <div></div>
        )}
        <div
          className={css`
            display: flex;
          `}
        >
          <div
            className={css`
              width: 20vw;
              height: 100%;
              margin: 5px;
            `}
          >
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
            <div className="grid">
              <div
                style={{
                  position: "absolute",
                  bottom: "16%",
                  height: "5vh",
                  maxWidth: "20vw",
                  paddingBottom: "3px",
                }}
              >
                <div
                  style={{ paddingBottom: "5px" }}
                  onClick={() => {
                    this.setState({
                      showForm: false,
                      showSign: true,
                    });
                  }}
                >
                  Customize Map:
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "12%",
                  height: "5vh",
                  paddingBottom: "3px",
                }}
              >
                <select
                  onChange={(e) => {
                    console.log(e.target.value);
                    let theme = "";
                    switch (e.target.value) {
                      case "Decimal":
                        theme =
                          "mapbox://styles/ashleytz/ckaxpmear03nw1ilnsrbf75if";
                        break;
                      case "Standard":
                        theme =
                          "mapbox://styles/ashleytz/ckaxps4bp0ukt1jpmt2uxbvg8";
                        break;
                      case "Blueprint":
                        theme =
                          "mapbox://styles/ashleytz/ckaxptnwn05b61ioon15refau";
                        break;
                      case "Frank":
                        theme =
                          "mapbox://styles/ashleytz/ckaepanj10jmq1hr4ivacke50";
                        break;
                      case "Night":
                        theme =
                          "mapbox://styles/mapbox/navigation-guidance-night-v4";
                        break;
                      case "Day":
                        theme =
                          "mapbox://styles/mapbox/navigation-guidance-day-v4";
                        break;
                      case "Satellite Streets":
                        theme = "mapbox://styles/mapbox/satellite-streets-v11";
                        break;
                      case "Satellite":
                        theme = "mapbox://styles/mapbox/satellite-v9";
                        break;
                      case "Dark":
                        theme = "mapbox://styles/mapbox/dark-v10";
                        break;
                      case "Light":
                        theme = "mapbox://styles/mapbox/light-v10";
                        break;
                      case "Outdoors":
                        theme = "mapbox://styles/mapbox/outdoors-v11";
                        break;
                      default:
                        // theme = "mapbox://styles/ashleytz/ckaepanj10jmq1hr4ivacke50";
                        theme = "mapbox://styles/mapbox/navigation-guidance-day-v4";
                    }

                    if (this.map) {
                      console.log(this.map.getMap());
                      this.map.getMap().setStyle(theme);
                    }
                  }}
                >
                  <option value="Frank">Frank</option>
                  <option value="Decimal">Decimal</option>
                  <option value="Standard">Standard</option>
                  <option value="Blueprint">Blueprint</option>
                  <option value="Night">Night</option>
                  <option value="Day">Day</option>
                  <option value="Satellite Streets">Satellite Streets</option>
                  <option value="Satellite">Satellite</option>
                  <option value="Dark">Dark</option>
                  <option value="Light">Light</option>
                  <option value="Outdoors">Outdoors</option>
                </select>
              </div>

              <div
                className="button"
                style={{
                  position: "absolute",
                  bottom: "8%",
                  maxWidth: "20vw",
                }}
              >
                <div
                  onClick={() => {
                    this.setState({
                      showForm: true,
                      showSign: false,
                    });
                  }}
                >
                  Add Resource
                </div>
              </div>
              {localStorage.getItem("userID") !== null ? (
                <div
                  style={{
                    position: "absolute",
                    bottom: "4%",
                    maxWidth: "20vw",
                  }}
                >
                  <div
                    className="button"
                    onClick={() => {
                      console.log("remov");
                      localStorage.removeItem("userID");
                      this.setState({
                        userLoggedIn: false,
                      });
                    }}
                  >
                    Log out
                  </div>
                </div>
              ) : (
                <div
                  className="button"
                  style={{
                    position: "absolute",
                    bottom: "4%",
                    maxWidth: "20vw",
                  }}
                >
                  <div
                    onClick={() => {
                      this.setState({
                        showForm: false,
                        showSign: true,
                      });
                    }}
                  >
                    Log In / Sign Up
                  </div>
                </div>
              )}
            </div>
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
              minZoom={8}
              mapboxApiAccessToken="pk.eyJ1IjoiYXNobGV5dHoiLCJhIjoiY2s5ajV4azIwMDQ4aDNlbXAzZnlwZ2U0YyJ9.P2n2zrXhGxl1xhFoEdNTnw"
              onViewportChange={this._onViewportChange}
              // mapStyle="mapbox://styles/ashleytz/ckb07cp3006nd1imm9qg9ug18"
              mapStyle="mapbox://styles/mapbox/navigation-guidance-day-v4"
              ref={this.mapRef}
            >
              <div
                style={{
                  fontSize: "15px",
                }}
              >
                <label className="switch">
                  <input
                    type="checkbox"
                    onClick={() => {
                      this.setState({
                        showTest: !this.state.showTest,
                      });
                    }}
                  />
                  <span className="toggle">Testing Centers</span>
                </label>
                <label className="switch">
                  <input
                    type="checkbox"
                    onClick={() =>
                      this.setState({
                        showFoodbanks: !this.state.showFoodbanks,
                      })
                    }
                  />
                  <span className="toggle">Foodbanks</span>
                </label>
                <label className="switch">
                  <input
                    type="checkbox"
                    onClick={() => {
                      this.setState({
                        showSore: !this.state.showStore,
                      });
                    }}
                  />
                  <span className="toggle">Stores</span>
                </label>
              </div>
              {(this.state.showFoodbanks === true) & this.foodbanks ? (
                this.foodbanks.map((pt) => (
                  <Mark
                    // click={(i) => this.bringToTop(i)}
                    //send in upvote,downvote,addressname, and
                    key={pt["_id"]}
                    id={pt["_id"]}
                    lat={pt["location"]["coordinates"][1]}
                    lon={pt["location"]["coordinates"][0]}
                    address={pt["address"]}
                    type={pt["type"]}
                    name={pt["name"]}
                    votes={pt["votes"]}
                  />
                ))
              ) : (
                <div></div>
              )}
              {this.state.showTest === true && this.testing ? (
                this.testing.map((pt) => (
                  <Mark
                    key={pt["_id"]}
                    id={pt["_id"]}
                    lat={pt["location"]["coordinates"][1]}
                    lon={pt["location"]["coordinates"][0]}
                    address={pt["address"]}
                    type={pt["type"]}
                    name={pt["name"]}
                    votes={pt["votes"]}
                  />
                ))
              ) : (
                <div></div>
              )}
              {this.state.showStore === true && this.stores ? (
                this.stores.map((pt) => (
                  <Mark
                    key={pt["_id"]}
                    id={pt["_id"]}
                    lat={pt["location"]["coordinates"][1]}
                    lon={pt["location"]["coordinates"][0]}
                    address={pt["address"]}
                    type={pt["type"]}
                    name={pt["name"]}
                    votes={pt["votes"]}
                  />
                ))
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
