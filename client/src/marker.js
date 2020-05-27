import React from "react";

export default class marker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resource: this.props.resource,
    };
  }
  componentDidMount() {}
}