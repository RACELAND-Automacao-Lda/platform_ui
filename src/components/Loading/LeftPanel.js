import React from "react";
import { observer } from "mobx-react";
import { withRouter } from "react-router-dom";

import ServiceList from "../widgets/ServiceList";

@withRouter
@observer
class LeftPanel extends React.Component {
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
export default LeftPanel;
