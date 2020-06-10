import React from "react";

export default function SearchBox(props) {
  // const [latitude, setLatitude] = useState(props.latitude)
  // const [longitude]'
  return (
    <div className="searchbox" onClick={props.onClick}>
      <div style={{ fontSize: "14px" }}>{props.address}</div>
    </div>
  );
}
