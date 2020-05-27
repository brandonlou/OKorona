export default class Nav {
  constructor(props) {
    this.props = props;
    this.getLocation = this.getLocation.bind(this);
    this.userLoc = props.userLoc;
  }
  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log(position.coords.latitude + " " + position.coords.longitude);
        this.props(position.coords.latitude, position.coords.longitude);
      });
    } else {
      alert("Geolocation is not supported by this browser");
    }
  }
  render() {}
}
