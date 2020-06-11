import React from "react";

//Functional component that displays the search options
export default function SearchBox(props) {
  return (
    <div className="searchbox" onClick={props.onClick}>
      <div style={{ fontSize: "14px" }}>{props.address}</div>
    </div>
  );
}
