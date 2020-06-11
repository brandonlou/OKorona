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
      welcome: true,

      //state variables that check whether something should be cleared or updated
      clear: false,
      update: false,

      //these arrays/dicts hold data that will show markers/search results
      foodbanks: [],
      stores: [],
      testing: [],
      autoComp: {},
    };
    //these arrays hold the marker data until completely collected
    //afterwards they are transferred to the state arrays to update the map
    this.testing = [];
    this.stores = [];
    this.foodbanks = [];

    //update map variables
    this.change = true;
    this.research = false;
    this.options = {};
    this.origin = [];
    this.userHome = {};

    //references
    this.mapRef = React.createRef();
    this.select = React.createRef();
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

    //if the map is rendered, get the markers in the area
    if (this.map) {
      this.getLocations();
    }
  };

  //if the application has properly rendered
  UNSAFE_componentcomponentWillMount() {
    //create a navigation object that will get the user's location
    this.nav = new Nav(this.userLoc);
    this.nav.getLocation();
  }

  //If the component has updated,
  UNSAFE_componentDidUpdate() {
    if (this.map) {
      //get locations of items
      this.getLocations();
    }
  }

  //gets information for markers
  getLocations() {
    /*
    This entire section calculates the distance from the initial calculation of
    locations to where the user is currently at. After the user has moved a decent amount from the 
    initial position, the application will re-fetch the information to update the map
    The purpose of this calculation is to reduce computation.
    */
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

    //if the user has moved far enough or the user has teleported using search, fetch information
    if ((radius > maxRad - 0.4) | this.change) {
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
          //reset information arrays
          this.testing = [];
          this.foodbanks = [];
          this.stores = [];

          //for every item, split the items into the different categories and only add the item to the array if there is no matching id
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
                  this.stores.push(obj);
                }
                break;
              default:
                break;
            }

            //set state to re-render the application
            this.setState({
              testing: this.testing,
              foodbanks: this.foodbanks,
              stores: this.stores,
            });
          }
        })
        .catch((error) => console.log(error));

      //reset the origin so that future radius calculations are okay
      this.origin = [
        this.state.viewport.latitude,
        this.state.viewport.longitude,
      ];

      //switch change to false if it was true coming into the method
      this.change = false;
    }
  }

  //changes the viewport to the location specified by the user
  userLoc(lat, lon, home = false) {
    //if the coordinates are invalid return
    if (!lat || !lon) return;

    //else re-set the viewport
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

    //if the user provides location, save this into application for later use
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
          console.log("userHome: " + this.userHome);
        });
    }
    //set change to true, reset the origin, and get new locations
    this.change = true;
    this.origin = [lat, lon];
    if (this.map) this.getLocations();
  }

  /*
  if the component has mounted, check to see if the user has visited already
  if not, show the welcome pop up
  set the map reference and get locations
  */
  componentDidMount() {
    this.nav = new Nav(this.userLoc);
    this.nav.getLocation();
    this.map = this.mapRef.current;
    let visited = localStorage["visited"];
    if (visited) {
      this.setState({
        welcome: false,
      });
    } else {
      localStorage["visited"] = true;
      this.setState({ welcome: true });
    }
    if (this.nav !== null) {
      this.userLoc(this.nav.latitude, this.nav.longitude);
    }

    this.getLocations();
  }

  //clear the options search window
  clearResults(bool) {
    this.setState({
      clear: bool,
    });
  }

  //search again for options (for the sake of reducing the amount of requests we send to mapbox)
  reSearch(bool) {
    this.research = bool;
  }

  //autocomplete the user's search with related locations
  autoComplete(address) {
    if (!this.research) return;

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

    //set the clear booleans to false
    this.reSearch(false);
    this.clearResults(false);
  }

  //return the autocomplete options as html components for the user to see and interact with
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
                  return;
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

  //for finding the URL of a map theme
  getTheme(name) {
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
        return "mapbox://styles/mapbox/navigation-guidance-day-v4";
    }
  }

  //when the user wants to change themes / switch to user-saved theme
  changeTheme(e) {
    //if e is an event vs if e is a name
    const change = e.target.value ? e.target.value : e;
    let theme = this.getTheme(change);

    //if user is logged in, save theme
    if (e.target.value && localStorage.getItem("userID")) {
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
          localStorage.setItem("theme", theme);
        })
        .catch((error) => console.log(error));
    }

    //set the style
    if (this.map) {
      this.map.getMap().setStyle(theme);
    }
  }

  render() {
    //calculation of closer boundaries so that the map doesn't have to render all of the resources in the array every time
    let maxLon = 0;
    let maxLat = 0;
    let minLon = 0;
    let minLat = 0;

    if (this.map) {
      const bounds = this.map.getMap().getBounds();
      maxLon = bounds._ne.lng + 0.1;
      maxLat = bounds._ne.lat + 0.1;
      minLon = bounds._sw.lng - 0.1;
      minLat = bounds._sw.lat - 0.1;
    }

    //if the map theme is stored in localStorage ==> set theme
    let mapTHEME = localStorage.getItem("theme")
      ? localStorage.getItem("theme")
      : "mapbox://styles/mapbox/navigation-guidance-day-v4";
    if (this.select.current) {
      const name = this.getTheme(this.select.current.value);
      if (name !== "mapbox://styles/mapbox/navigation-guidance-day-v4")
        this.select.current.value = 0;
    }

    return (
      <div className="App">
        {this.state.welcome ? (
          <div className="popup welcome">
            <div className="row" style={{ maxHeight: "4vh" }}>
              <svg
                onClick={() => {
                  this.setState({
                    welcome: false,
                  });
                }}
                style={{
                  position: "absolute",
                  width: "5%",
                  right: "2%",
                  margin: "2%",
                  height: "2vh",
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
            <div style={{ margin: "5%" }}>
              Welcome! <br />
              <br /> Search for locations to find COVID-19-related resources
              that we've compiled from the web and from user contributions.
              Filter our the resources using the toggles below, and customize
              the map to your pleasure. Log in or sign up to rate the resources
              or add resources yourself! <br /> <br />
              Wishing you the best, <br /> the OKorona Team
            </div>
          </div>
        ) : (
          <div />
        )}
        {this.state.showSign ? (
          <SignUp
            onClick={() => {
              this.setState({
                showSign: false,
              });
              return;
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
              return;
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
            style={{ top: "0", bottom: "0", position: "absolute" }}
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
                      key={pt["_id"]}
                      id={pt["_id"]}
                      signUp={() => {
                        this.setState({
                          showSign: true,
                        });
                      }}
                      lat={lat}
                      lon={lon}
                      address={pt["address"]}
                      type={pt["type"]}
                      name={pt["name"]}
                      votes={pt["votes"]}
                      color="rgb(247, 129, 50)"
                      userHome={this.userHome}
                    />
                  );
                return <div key={pt["_id"]}></div>;
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
                      key={pt["_id"]}
                      id={pt["_id"]}
                      signUp={() => {
                        this.setState({
                          showSign: true,
                        });
                      }}
                      lat={lat}
                      lon={lon}
                      address={pt["address"]}
                      type={pt["type"]}
                      name={pt["name"]}
                      votes={pt["votes"]}
                      color="rgb(236, 59, 59)"
                      userHome={this.userHome}
                    />
                  );
                return <div key={pt["_id"]}></div>;
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
                      key={pt["_id"]}
                      id={pt["_id"]}
                      signUp={() => {
                        this.setState({
                          showSign: true,
                        });
                      }}
                      lat={lat}
                      lon={lon}
                      address={pt["address"]}
                      type={pt["type"]}
                      name={pt["name"]}
                      votes={pt["votes"]}
                      color="rgb(62, 226, 98)"
                      userHome={this.userHome}
                    />
                  );
                return <div key={pt["_id"]}></div>;
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
                  <div>Customize Map:</div>
                  <select
                    ref={this.select}
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
                      localStorage.removeItem("upvotes");
                      localStorage.removeItem("downvotes");
                      localStorage.removeItem("theme");
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