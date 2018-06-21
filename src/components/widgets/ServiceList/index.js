import React from "react";
import { inject, observer } from "mobx-react";
import { Link } from "react-router-dom";
import { withRouter } from "react-router-dom";

@inject("deepdetectStore")
@withRouter
@observer
export default class ServiceList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      intervalId: null
    };

    this.timer();
  }

  componentDidMount() {
    const refreshRate = this.props.deepdetectStore.settings.infoRefreshRate;
    var intervalId = setInterval(this.timer.bind(this), refreshRate);
    this.setState({ intervalId: intervalId });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  timer() {
    const status = true;
    this.props.deepdetectStore.loadServices(status);
  }

  render() {
    const ddStore = this.props.deepdetectStore;

    if (!ddStore.isReady || !ddStore.server || !ddStore.service) return null;

    return (
      <ul
        className="serviceList sidebar-top-level-items"
        key={`serviceList-${ddStore.refresh}`}
      >
        {ddStore.servers.map((server, serverIndex) => {
          return server.services.map((service, serviceIndex) => {
            const isActive =
              ddStore.currentServerIndex === serverIndex &&
              ddStore.server.currentServiceIndex === serviceIndex;

            return (
              <li
                key={`service-item-${serverIndex}-${serviceIndex}`}
                className={isActive ? "active" : ""}
              >
                <Link
                  key={`service-link-${serverIndex}-${serviceIndex}`}
                  to={`/predict/${server.name}/${service.name}`}
                >
                  <span className="nav-item-name">
                    {service.name}
                    <span className="badge badge-secondary float-right">
                      {server.name}
                    </span>
                    {service.training ? (
                      <span className="badge badge-warning float-right badge-training">
                        Training
                      </span>
                    ) : (
                      ""
                    )}
                  </span>
                </Link>
              </li>
            );
          });
        })}
      </ul>
    );
  }
}
