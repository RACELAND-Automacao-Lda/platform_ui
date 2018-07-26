import React from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

import GpuInfo from "../../widgets/GpuInfo";
import ServiceInfo from "../../widgets/ServiceInfo";
import TrainingMeasure from "../../widgets/TrainingMeasure";

@inject("configStore")
@withRouter
@observer
export default class RightPanel extends React.Component {
  render() {
    if (typeof this.props.configStore.gpuInfo === "undefined") {
      return null;
    }

    return (
      <aside className="right-sidebar right-sidebar right-sidebar-expanded">
        <div className="issuable-sidebar">
          <GpuInfo />
          {this.props.serviceInfo ? <ServiceInfo /> : ""}
          {this.props.measure ? <TrainingMeasure {...this.props} /> : ""}
        </div>
      </aside>
    );
  }
}

RightPanel.propTypes = {
  configStore: PropTypes.object,
  searviceInfo: PropTypes.object,
  measure: PropTypes.object
};
