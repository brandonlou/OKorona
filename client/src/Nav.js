//Sends request for user location, if not allowed, the application will return to Los Angeles
export default class Nav {
  constructor(props) {
    console.log("In Nav");
    this.props = props;
    this.lat = null;
    this.lon = null;
    this.getLocation = this.getLocation.bind(this);
    this.userLoc = props.userLoc;
  }
  getLocation() {
    console.log("In Nav");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lon = position.coords.longitude;
        this.props(position.coords.latitude, position.coords.longitude, true);
      });
    } else {
      alert("Geolocation is not supported by this browser");
      return false;
    }
  }
}
