import React from "react";
import { inject, observer } from "mobx-react";

@inject("deepdetectStore")
@observer
export default class ServiceInfo extends React.Component {
  render() {
    const { service } = this.props.deepdetectStore;

    if (service == null) return null;

    return (
      <div className="serviceinfo">
        <h5>
          <i className="fas fa-info-circle" /> Service Info
        </h5>
        <div className="block">
          <table className="table table-sm">
            <tbody>
              {Object.keys(service).map((key, index) => {
                let value = service[key];

                if (typeof value === "boolean") {
                  value = value ? "True" : "False";
                }

                return (
                  <tr key={index}>
                    <th scope="row">{key}</th>
                    <td>{value}</td>
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
