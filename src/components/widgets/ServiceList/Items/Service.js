import React from "react";
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

@inject("deepdetectStore")
@withRouter
@observer
export default class ServiceItem extends React.Component {
  render() {
    const { server, serverIndex, service, serviceIndex } = this.props;
    const ddStore = this.props.deepdetectStore;
    const isActive =
      ddStore.currentServerIndex === serverIndex &&
      ddStore.server.currentServiceIndex === serviceIndex;

    return (
      <li className={isActive ? "active" : ""}>
        <Link
          to={`/${service.settings.training ? "training" : "predict"}/${
            server.name
          }/${service.name}`}
        >
          <span className="nav-item-name">
            {service.name}
            <span className="badge badge-secondary float-right">
              {server.name}
            </span>
          </span>
        </Link>
      </li>
    );
  }
}
