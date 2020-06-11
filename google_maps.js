const common = require("./common");
const baseurl = "https://www.google.com/maps/dir/";

const google_maps = {};

google_maps.openNavigation = (source, destination) =>
{
    let src = common.convertAddressToCoords(source);
    let dest = common.convertAddressToCoords(destination);

    if (src && dest)
        window.open(baseurl + src.lat + "," + src.lon + "/" + dest.lat + "," + dest.lon + "/@?hl=en");
    else
    {
        if (!src)
            alert("Couldn't find " + source + "!");
        else
            alert("Couldn't find " + destination + "!");
    }
};

module.exports = google_maps;