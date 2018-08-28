import React from "react";
import { observer } from "mobx-react";

@observer
export default class GpuInfoItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      detailsVisible: false
    };

    this.toggleDetails = this.toggleDetails.bind(this);
  }

  toggleDetails() {
    this.setState({ detailsVisible: !this.state.detailsVisible });
  }

  render() {
    const index = this.props.index;
    const gpu = this.props.gpu;

    const memoryMo = parseInt(gpu["memory.used"], 10);
    const memoryTotal = parseInt(gpu["memory.total"], 10);
    //const memoryPercent = parseInt(memoryMo * 100 / gpu['memory.total'], 10);
    const utilPercent = parseInt(gpu["utilization.gpu"], 10);

    let alerts = [];

    let utilPercentDisplay = `${utilPercent}%`;
    if (utilPercent > 70) {
      utilPercentDisplay = <b>{utilPercent}%</b>;
      alerts.push("util");
    }

    let memoryDisplay = memoryMo;
    if (memoryMo / memoryTotal > 0.7) {
      memoryDisplay = <b>{memoryMo}</b>;
      alerts.push("memory");
    }

    return (
      <div key={`gpuInfoItem-${index}`} className="block">
        <div>
          <span className="font-weight-bold">{index}</span>. &nbsp;
          <span className="temp">{gpu["temperature.gpu"]}°C</span>
          ,&nbsp;
          <span className="util">{utilPercentDisplay}</span>
          ,&nbsp;
          <span className="memUsed text-primary">{memoryDisplay}</span> /{" "}
          <span className="memTotal text-secondary">{memoryTotal}</span>
          {alerts.length > 0 ? (
            <span className="alerts">
              &nbsp;<i className="fas fa-fire" style={{ color: "#3c457d" }} />
            </span>
          ) : (
            ""
          )}
          <div
            className={
              gpu.processes.length > 0 ? "badge detailsBadge" : "hidden"
            }
            onClick={this.toggleDetails}
          >
            <span className="fa-stack fa-xs">
              <i className="fas fa-circle fa-stack-2x" />
              <i
                className={
                  this.state.detailsVisible
                    ? "fas fa-angle-down fa-inverse fa-stack-1x"
                    : "fas fa-angle-right fa-inverse fa-stack-1x"
                }
              />
            </span>
          </div>
        </div>

        <div
          className="list processList"
          style={this.state.detailsVisible ? {} : { display: "none" }}
        >
          <table className="table table-sm">
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">PID</th>
                <th scope="col">Memory</th>
              </tr>
            </thead>
            <tbody>
              {gpu.processes.map((process, idx) => {
                let levelMemory = "secondary";

                if (parseInt(process.gpu_memory_usage, 10) > 2000)
                  levelMemory = "primary";

                return (
                  <tr key={idx}>
                    <td>{process.username}</td>
                    <td className="processPID">{process.pid}</td>
                    <td>
                      <span className={`badge badge-${levelMemory}`}>
                        {process.gpu_memory_usage}M
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
