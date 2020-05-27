import React from "react";

export default function SearchBox(props) {
  // const [latitude, setLatitude] = useState(props.latitude)
  // const [longitude]'
  return (
    <div className="searchbox" onClick={props.onClick}>
      <p style={{ fontSize: "12px", margin: "3px" }}>{props.address}</p>
    </div>
  );
}
