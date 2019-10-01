import React from "react";
import { inject, observer } from "mobx-react";

import ImageConnector from "./connectors/Image";
import TxtConnector from "./connectors/Txt";
import WebcamConnector from "./connectors/Webcam";
import StreamConnector from "./connectors/Stream";
import MjpegConnector from "./connectors/Mjpeg";

@inject("imaginateStore")
@inject("configStore")
@observer
export default class Imaginate extends React.Component {
  constructor(props) {
    super(props);

    this.getServiceConnector = this.getServiceConnector.bind(this);
  }

  componentWillReceiveProps(nextProps) {}

  getServiceConnector() {
    const { imaginateStore } = this.props;
    const { service } = imaginateStore;

    let connector = null;

    if (service) {
      const serviceInfo = service.respInfo;
      if (
        serviceInfo &&
        serviceInfo.body &&
        serviceInfo.body.parameters &&
        serviceInfo.body.parameters.input &&
        serviceInfo.body.parameters.input.length === 1 &&
        serviceInfo.body.parameters.input[0].connector
      ) {
        connector = serviceInfo.body.parameters.input[0].connector;
      }

      if (imaginateStore.service.name.indexOf("_webcam") !== -1) {
        connector = "webcam";
        imaginateStore.settings.default.keepJson = true;
      }

      if (imaginateStore.service.name.indexOf("_stream") !== -1)
        connector = "stream";
    }

    if (service.name.indexOf("_mjpeg") !== -1) {
      connector = "mjpeg";
    }

    return connector;
  }

  render() {
    if (this.props.configStore.isComponentBlacklisted("Imaginate")) return null;

    const { imaginateStore } = this.props;

    if (!imaginateStore.service) return null;

    const connector = this.getServiceConnector();
    let connectorComponent = null;

    switch (connector) {
      case "txt":
        connectorComponent = <TxtConnector />;
        break;
      case "image":
        connectorComponent = <ImageConnector />;
        break;
      case "webcam":
        connectorComponent = <WebcamConnector />;
        break;
      case "stream":
        connectorComponent = <StreamConnector />;
        break;
      case "mjpeg":
        connectorComponent = <MjpegConnector />;
        break;
      case "csv":
        connectorComponent = (
          <div className="alert alert-warning" role="alert">
            <i className="fas fa-exclamation-circle" /> CSV connector interface
            not available.
          </div>
        );
        break;
      default:
        connectorComponent = (
          <div className="alert alert-warning" role="alert">
            <i className="fas fa-exclamation-circle" /> Missing attribute{" "}
            <code>body.parameters.input[0].connector</code> in Service json.
          </div>
        );
        break;
    }

    return (
      <div
        className={`imaginate-${connector}`}
        data-servicename={imaginateStore.service.name}
      >
        {connectorComponent}
      </div>
    );
  }
}
