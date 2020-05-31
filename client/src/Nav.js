export default class Nav {
  constructor(props) {
    this.props = props;
    this.lat = null;
    this.lon = null;
    this.getLocation = this.getLocation.bind(this);
    this.userLoc = props.userLoc;
  }
  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lon = position.coords.longitude;
        this.props(position.coords.latitude, position.coords.longitude);
      });
    } else {
      alert("Geolocation is not supported by this browser");
      return false;
    }
  }
}
