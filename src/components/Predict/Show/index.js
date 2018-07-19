import LeftPanel from "../commons/LeftPanel";
import MainView from "./MainView";
import Modals from "./Modals";
import React from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

@inject("deepdetectStore")
@inject("imaginateStore")
@inject("configStore")
@withRouter
@observer
export default class PredictShow extends React.Component {
  constructor(props) {
    super(props);

    this.setDeepdetectServer = this.setDeepdetectServer.bind(this);
  }

  setDeepdetectServer(params) {
    const imaginateStore = this.props.imaginateStore;
    const ddStore = this.props.deepdetectStore;

    if (!ddStore.init(params)) {
      this.props.history.push("/404");
    } else if (!ddStore.server.service) {
      this.props.history.push("/");
    } else {
      imaginateStore.connectToDdStore(ddStore);
    }
  }

  componentWillMount() {
    this.setDeepdetectServer(this.props.match.params);
  }

  componentWillReceiveProps(nextProps) {
    this.setDeepdetectServer(nextProps.match.params);
  }

  render() {
    if (
      this.props.configStore.isComponentBlacklisted("Predict") ||
      this.props.configStore.isComponentBlacklisted("PredictShow")
    )
      return null;

    return (
      <div className="layout-page page-gutter page-with-contextual-sidebar right-sidebar-collapsed page-with-icon-sidebar service-component">
        <LeftPanel />
        <MainView />
        <Modals />
      </div>
    );
  }
}
