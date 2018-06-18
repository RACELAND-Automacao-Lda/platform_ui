import React from "react";

import ServiceList from "../widgets/ServiceList";

export default class LeftPanel extends React.Component {
  render() {
    return (
      <div className="nav-sidebar left-sidebar">
        <div className="nav-sidebar-inner-scroll">
          <ServiceList />
        </div>
      </div>
    );
  }
}
