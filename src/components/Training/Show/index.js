import LeftPanel from "../commons/LeftPanel";
import MainView from "./MainView";
import Modals from "./Modals";
import React from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

@inject("deepdetectStore")
@inject("configStore")
@withRouter
@observer
export default class TrainingShow extends React.Component {
  componentWillMount() {
    const ddStore = this.props.deepdetectStore;
    ddStore.init(this.props.match.params);
  }

  componentWillReceiveProps(nextProps) {
    const ddStore = this.props.deepdetectStore;
    ddStore.init(nextProps.match.params);
  }

  render() {
    if (
      this.props.configStore.isComponentBlacklisted("Training") ||
      this.props.configStore.isComponentBlacklisted("TrainingShow")
    )
      return null;

    return (
      <div className="layout-page page-gutter page-with-contextual-sidebar right-sidebar-collapsed page-with-icon-sidebar training-show-component">
        <LeftPanel />
        <MainView />
        <Modals />
      </div>
    );
  }
}
