import React from "react";
import { inject, observer } from "mobx-react";

import GpuStatServer from "./Server";

@inject("configStore")
@inject("gpuStore")
@observer
class GpuInfo extends React.Component {
  render() {
    if (this.props.configStore.isComponentBlacklisted("GpuInfo")) return null;

    const { servers } = this.props.gpuStore;

    const jetsonSensors = servers.filter(s => s.type === "jetson");
    const gpuServers = servers.filter(s => s.type === "standard");

    return (
      <div className="gpuinfo">
        {gpuServers.map((s, i) => {
          return <GpuStatServer key={i} server={s} />;
        })}
        {jetsonSensors.length > 0 ? (
          <div>
            <hr />
            <h4>Sensors</h4>
          </div>
        ) : null}
        {jetsonSensors.map((s, i) => {
          return <GpuStatServer key={i} server={s} />;
        })}
      </div>
    );
  }
}
export default GpuInfo;
