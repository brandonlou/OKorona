import React, { Component } from "react";
import "./App.css";
// import ReactMapGL from "react-map-gl";

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "",
    };
    this.search = React.createRef();
  }
  componentDidUpdate() {
    this.props.reSearch(true);
  }
  render() {
    return (
      <div style={{ width: "100%", display: "flex" }}>
        <input
          className="input"
          type="text"
          placeholder="Search..."
          style={{ float: "left" }}
          ref={this.search}
          onChange={() => {
            if (
              this.search.current.value &&
              this.search.current.value.length > 3
            ) {
              this.props.autoComplete(this.search.current.value);
            } else {
              this.props.clearResults();
            }
          }}
        ></input>
        <button>
          <svg
            style={{ float: "right", cursor: "pointer" }}
            className="bi bi-arrow-return-left"
            width="1em"
            height="1em"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M5.854 5.646a.5.5 0 010 .708L3.207 9l2.647 2.646a.5.5 0 01-.708.708l-3-3a.5.5 0 010-.708l3-3a.5.5 0 01.708 0z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M13.5 2.5a.5.5 0 01.5.5v4a2.5 2.5 0 01-2.5 2.5H3a.5.5 0 010-1h8.5A1.5 1.5 0 0013 7V3a.5.5 0 01.5-.5z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    );
  }
}

// const useScript = (url) => {
//   useEffect(() => {
//     const script = document.createElement("script");

//     script.src = url;
//     script.async = true;

//     document.body.appendChild(script);

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, [url]);
// };
