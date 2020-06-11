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
import fetch from "node-fetch";

//Entire Application
export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //Defines the view of the map
      viewport: {
        width: 400,
        height: 400,
        latitude: 34.052235,
        longitude: -118.453683,
        zoom: 13,
      },
      //state variables to determine whether to show certain items
      showFoodbanks: true,
      showStore: true,
      showTest: true,
      showTab: true,
      showForm: false,
      showSign: false,

      //state variables that check whether something should be cleared or updated
      clear: false,
      update: false,

      //these arrays/dicts hold data that will show markers/search results
      foodbanks: [],
      stores: [],
      testing: [],
      autoComp: {},
    };
    //marker to map style theme
    // this.theme = [
    //   {
    //     name: "Frank",
    //     markers: "red",
    //     info: "pink",
    //   },
    // ];
    //these arrays hold the marker data until completely collected
    //afterwards they are transferred to the state arrays to update the map
    this.testing = [];
    this.stores = [];
    this.foodbanks = [];

    //update map variables
    this.change = false;
    this.research = false;
    this.options = {};
    this.origin = [];
    this.userHome = {};

    //references
    this.markRefs = [];
    this.mapRef = React.createRef();
    this.nav = null;
    this.map = null;
    this.tab = null;

    //binding functions just in case a this hierarchy error occurs
    this.onViewportChange = this._onViewportChange.bind(this);
    this.autoComplete = this.autoComplete.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.clearResults = this.clearResults.bind(this);
    this.reSearch = this.reSearch.bind(this);
    this.userLoc = this.userLoc.bind(this);
    this.getLocations = this.getLocations.bind(this);
    this.render = this.render.bind(this);
  }

  //whenever viewport (what you see) changes
  _onViewportChange = (viewport) => {
    //reset the viewport of the app
    this.setState({ viewport: viewport });

    // //if the map is rendered, get the markers in the area
    // if (this.map) {
    //   this.getLocations();
    // }
  };

  //if the application has properly rendered
  componentWillMount() {
    //create a navigation object that will get the user's location
    this.nav = new Nav(this.userLoc);
    this.nav.getLocation();
  }

  //If the component has updated,
  componentDidUpdate() {
    if (this.map) {
      this.getLocations();
    }
  }

  getLocations() {
    const bounds = this.map.getMap().getBounds();
    const halfLat = (bounds._ne.lat - bounds._sw.lat) / 2;
    const halfLon = (bounds._ne.lng - bounds._sw.lng) / 2;
    const maxRad = Math.sqrt(
      Math.pow(halfLat + 1, 2) + Math.pow(halfLon + 1, 2)
    );
    const radius = Math.sqrt(
      Math.pow(this.state.viewport.latitude - this.origin[0], 2) +
        Math.pow(this.state.viewport.longitude - this.origin[1], 2)
    );
    if ((radius > maxRad - 0.4) | this.change) {
      console.log(maxRad);
      console.log(radius);
      fetch("./api/get_resource", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trLon: bounds._ne.lng + 1,
          trLat: bounds._ne.lat + 1,
          blLon: bounds._sw.lng - 1,
          blLat: bounds._sw.lat - 1,
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          console.log(json);
          this.testing = [];
          this.foodbanks = [];
          this.stores = [];
          for (const obj of json) {
            let add = true;
            switch (obj.type) {
              case "testing_site":
                for (const elem of this.testing) {
                  if (elem["_id"] === obj["_id"]) {
                    add = false;
                  }
                }
                if (add) {
                  this.markRefs.push(React.createRef());
                  this.testing.push(obj);
                }
                break;
              case "foodbank":
                for (const elem of this.foodbanks) {
                  if (elem["_id"] === obj["_id"]) {
                    add = false;
                  }
                }
                if (add) {
                  this.markRefs.push(React.createRef());
                  this.foodbanks.push(obj);
                }
                break;
              case "store":
                for (const elem of this.stores) {
                  if (elem["_id"] === obj["_id"]) {
                    add = false;
                  }
                }
                if (add) {
                  this.markRefs.push(React.createRef());
                  this.stores.push(obj);
                }
                break;
              default:
                break;
            }

            this.setState({
              testing: this.testing,
              foodbanks: this.foodbanks,
              stores: this.stores,
            });
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

  userLoc(lat, lon, home = false) {
    if (!lat || !lon) return;
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
    if (home) {
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
          if (!results["features"]) return;
          this.userHome = results["features"][0];
        });
    }
    this.change = true;
    this.origin = [lat, lon];
    if (this.map) this.getLocations();
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
  // let endpoint =
  //   "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
  //   lon +
  //   "%2C%20" +
  //   lat;
  // let query =
  //   ".json?access_token=pk.eyJ1IjoiYXNobGV5dHoiLCJhIjoiY2s5ajV4azIwMDQ4aDNlbXAzZnlwZ2U0YyJ9.P2n2zrXhGxl1xhFoEdNTnw";
  // fetch(endpoint + query)
  //   .then((response) => response.json())
  //   .then((results) => {
  //     let zip = null;
  //     if (!results["features"]) return;
  //     for (const id of results["features"]["0"]["context"]) {
  //       if (id["id"].startsWith("postcode")) zip = parseInt(id["text"]);
  //     }
  //     if (!zip) {
  //       return;
  //     }
  //     if (!(this.zips.indexOf(zip) >= 0)) this.zips.push(zip);
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
      .catch((error) => {
        return console.log(error);
      });
    this.reSearch(false);
    this.clearResults(false);
  }

  getOptions() {
    if (this.state.clear) return;

    if (this.state.autoComp["features"]) {
      return (
        <div className="searchwindow">
          <div style={{ height: "1vh", fontSize: "8px" }}>
            <em>Search Results</em>
          </div>
          {this.state.autoComp["features"].map((option) => {
            return (
              <SearchBox
                onClick={() => {
                  this.userLoc(
                    option["geometry"]["coordinates"][1],
                    option["geometry"]["coordinates"][0]
                  );
                  this.clearResults(true);
                }}
                key={option["id"]}
                address={option["place_name"]}
              />
            );
          })}
        </div>
      );
    }
  }

  singleMarker(i) {
    for (let c = 0; c < this.markRefs.length(); c++) {
      console.log(this.markRefs[c].current);
      if (c !== i) this.markRefs[c].current.handleMarkerClick();
    }
  }
  getTheme(name) {
    console.log(name);
    switch (name) {
      case "Decimal":
        return "mapbox://styles/ashleytz/ckaxpmear03nw1ilnsrbf75if";
      case "Standard":
        return "mapbox://styles/ashleytz/ckaxps4bp0ukt1jpmt2uxbvg8";
      case "Blueprint":
        return "mapbox://styles/ashleytz/ckaxptnwn05b61ioon15refau";
      case "Frank":
        return "mapbox://styles/ashleytz/ckaepanj10jmq1hr4ivacke50";
      case "Night":
        return "mapbox://styles/mapbox/navigation-guidance-night-v4";
      case "Day":
        return "mapbox://styles/mapbox/navigation-guidance-day-v4";
      case "Satellite Streets":
        return "mapbox://styles/mapbox/satellite-streets-v11";
      case "Satellite":
        return "mapbox://styles/mapbox/satellite-v9";
      case "Dark":
        return "mapbox://styles/mapbox/dark-v10";
      case "Light":
        return "mapbox://styles/mapbox/light-v10";
      case "Outdoors":
        return "mapbox://styles/mapbox/outdoors-v11";
      default:
        // return "mapbox://styles/ashleytz/ckaepanj10jmq1hr4ivacke50";
        return "mapbox://styles/mapbox/navigation-guidance-day-v4";
    }
  }
  changeTheme(e) {
    const change = e.target.value ? e.target.value : e;
    let theme = this.getTheme(change);
    if (e.target.value && localStorage.getItem("userID")) {
      console.log(localStorage.getItem("userID"));
      console.log(theme);
      console.log(
        JSON.stringify({
          userID: localStorage.getItem("userID"),
          theme: theme,
        })
      );
      fetch("./api/set_theme", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          userID: localStorage.getItem("userID"),
          theme: theme,
        }),
      })
        .then((response) => {
          console.log(response);
          localStorage.setItem("theme", theme);
        })
        .catch((error) => console.log(error));
    }
    if (this.map) {
      this.map.getMap().setStyle(theme);
    }
  }

  // componentWillUpdate() {
  // if (this.zips.length > 0) {
  //   for (const zip of this.zips) {
  //     this.getFoodbanks(zip);
  //   }
  // }
  // if (this.foodbanks) {
  //   this.pastFood = this.foodbanks.slice(0);
  // }
  // }
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
    let count = 0;
    let maxLon = 0;
    let maxLat = 0;
    let minLon = 0;
    let minLat = 0;
    let mapTHEME = localStorage.getItem("theme")
      ? localStorage.getItem("theme")
      : "mapbox://styles/mapbox/navigation-guidance-day-v4";
    if (this.map) {
      const bounds = this.map.getMap().getBounds();
      maxLon = bounds._ne.lng + 0.1;
      maxLat = bounds._ne.lat + 0.1;
      minLon = bounds._sw.lng - 0.1;
      minLat = bounds._sw.lat - 0.1;
    }
    return (
      <div className="App">
        {this.state.showSign ? (
          <SignUp
            onClick={() => {
              this.setState({
                showSign: false,
              });
            }}
            changeTheme={this.changeTheme}
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
            height: 100vh;
            width: 100vw;
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
            mapStyle={mapTHEME}
            ref={this.mapRef}
          >
            {this.state.showFoodbanks === true && this.foodbanks ? (
              this.state.foodbanks.map((pt) => {
                const lat = pt["location"]["coordinates"][1];
                const lon = pt["location"]["coordinates"][0];
                if (
                  minLat < lat &&
                  lat < maxLat &&
                  minLon < lon &&
                  lon < maxLon
                )
                  return (
                    <Mark
                      style={{ position: "fixed", zIndex: "0" }}
                      ref={this.markRefs[count]}
                      key={pt["_id"]}
                      id={pt["_id"]}
                      signUp={() => {
                        this.setState({
                          showSign: true,
                        });
                      }}
                      markerClick={() => this.singleMarker(count++)}
                      lat={lat}
                      lon={lon}
                      address={pt["address"]}
                      type={pt["type"]}
                      name={pt["name"]}
                      votes={pt["votes"]}
                      color="rgb(247, 129, 50)"
                    />
                  );
              })
            ) : (
              <div></div>
            )}
            {this.state.showTest === true && this.testing ? (
              this.state.testing.map((pt) => {
                const lat = pt["location"]["coordinates"][1];
                const lon = pt["location"]["coordinates"][0];
                if (
                  minLat < lat &&
                  lat < maxLat &&
                  minLon < lon &&
                  lon < maxLon
                )
                  return (
                    <Mark
                      ref={this.markRefs[count]}
                      key={pt["_id"]}
                      id={pt["_id"]}
                      signUp={() => {
                        this.setState({
                          showSign: true,
                        });
                      }}
                      markerClick={() => this.singleMarker(count++)}
                      lat={lat}
                      lon={lon}
                      address={pt["address"]}
                      type={pt["type"]}
                      name={pt["name"]}
                      votes={pt["votes"]}
                      color="rgb(236, 59, 59)"
                    />
                  );
              })
            ) : (
              <div></div>
            )}
            {this.state.showStore === true && this.stores ? (
              this.state.stores.map((pt) => {
                const lat = pt["location"]["coordinates"][1];
                const lon = pt["location"]["coordinates"][0];
                if (
                  minLat < lat &&
                  lat < maxLat &&
                  minLon < lon &&
                  lon < maxLon
                )
                  return (
                    <Mark
                      style={{ position: "fixed", zIndex: "0" }}
                      ref={this.markRefs[count]}
                      key={pt["_id"]}
                      id={pt["_id"]}
                      signUp={() => {
                        this.setState({
                          showSign: true,
                        });
                      }}
                      markerClick={() => this.singleMarker(count++)}
                      lat={lat}
                      lon={lon}
                      address={pt["address"]}
                      type={pt["type"]}
                      name={pt["name"]}
                      votes={pt["votes"]}
                      color="rgb(62, 226, 98)"
                    />
                  );
              })
            ) : (
              <div></div>
            )}
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
                  this.change = true;
                }
              }}
              autoComplete={this.autoComplete}
              clearResults={this.clearResults}
              reSearch={this.reSearch}
            />
            <div>{this.getOptions()}</div>
            <div className="tab" ref={this.tab}>
              <label className="switch">
                <input
                  type="checkbox"
                  onClick={() => {
                    this.setState({
                      showTest: !this.state.showTest,
                    });
                  }}
                />
                <span className="toggle3">Testing Centers</span>
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
                <span className="toggle2">Foodbanks</span>
              </label>
              <label className="switch">
                <input
                  type="checkbox"
                  onClick={() => {
                    this.setState({
                      showStore: !this.state.showStore,
                    });
                  }}
                />
                <span className="toggle">Stores</span>
              </label>

              <div className="bar">
                <div className="column space">
                  <div
                    onClick={() => {
                      this.setState({
                        showForm: false,
                        showSign: true,
                      });
                    }}
                  >
                    Customize Map:
                  </div>
                  <select
                    onChange={(e) => {
                      this.changeTheme(e);
                    }}
                  >
                    <option value="Day">Day</option>
                    <option value="Frank">Frank</option>
                    <option value="Decimal">Decimal</option>
                    <option value="Standard">Standard</option>
                    <option value="Blueprint">Blueprint</option>
                    <option value="Night">Night</option>
                    <option value="Satellite Streets">Satellite Streets</option>
                    <option value="Satellite">Satellite</option>
                    <option value="Dark">Dark</option>
                    <option value="Light">Light</option>
                    <option value="Outdoors">Outdoors</option>
                  </select>
                </div>
                <div className="button space">
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
                    className="button space"
                    onClick={() => {
                      localStorage.removeItem("userID");
                      this.setState({
                        userLoggedIn: false,
                      });
                    }}
                  >
                    Log out
                  </div>
                ) : (
                  <div
                    className="button space"
                    onClick={() => {
                      this.setState({
                        showForm: false,
                        showSign: true,
                      });
                    }}
                  >
                    Log In / Sign Up
                  </div>
                )}
              </div>
            </div>
          </ReactMapGL>
        </div>
      </div>
    );
  }
}
