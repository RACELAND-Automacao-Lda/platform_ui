import React from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";

import Home from "./Home";
import Loading from "./Loading";
import Header from "./Header";

import PredictHome from "./Predict/Home";
import PredictNew from "./Predict/New";
import PredictShow from "./Predict/Show";

import TrainingHome from "./Training/Home";
import TrainingShow from "./Training/Show";
import TrainingArchive from "./Training/Archive";

import GenericNotFound from "./GenericNotFound";

import Imaginate from "./widgets/Imaginate";
import deepdetectService from "../stores/deepdetect/service";

@inject("configStore")
@inject("buildInfoStore")
@inject("gpuStore")
@inject("deepdetectStore")
@inject("imaginateStore")
@inject("modelRepositoriesStore")
@inject("dataRepositoriesStore")
@inject("modalStore")
@inject("authTokenStore")
@withRouter
@observer
export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      infoIntervalId: null,
      trainingIntervalId: null,
      gpuInfoIntervalId: null
    };
  }

  componentWillReceiveProps(nextProps) {
    // timer has to be called in order to refresh Training Show component
    // fix issue #157 - https://gitlab.com/jolibrain/core-ui/issues/157
    // this.props.deepdetectStore.refreshTrainInfo();
  }

  componentWillMount() {
    const {
      configStore,
      gpuStore,
      buildInfoStore,
      deepdetectStore,
      imaginateStore,
      authTokenStore,
      modelRepositoriesStore,
      dataRepositoriesStore
    } = this.props;

    configStore.loadConfig(config => {
      if (config.layout === "minimal") {
        const serviceSettings = imaginateStore.settings.services[0];

        imaginateStore.service = new deepdetectService({
          serviceSettings: serviceSettings,
          serverName: deepdetectStore.server.name,
          serverSettings: deepdetectStore.server.settings
        });
      } else {
        deepdetectStore.setup(config);
        deepdetectStore.loadServices(true);
        deepdetectStore.refreshTrainInfo();

        if (config.gpuInfo) {
          gpuStore.setup(config);
          gpuStore.loadGpuInfo();
        }

        imaginateStore.setup(config);
        authTokenStore.setup();

        if (config.modelRepositories) {
          modelRepositoriesStore.setup(config);
        }

        if (config.dataRepositories) {
          dataRepositoriesStore.setup(config);
          dataRepositoriesStore.refresh();
        }

        buildInfoStore.loadBuildInfo();
      }
    });
  }

  render() {
    const { configStore, deepdetectStore } = this.props;

    if (!configStore.isReady) return null;

    if (configStore.layout === "minimal") {
      // Minimal Layout

      return (
        <div>
          <Route exact path="/" component={Imaginate} />
        </div>
      );
    } else if (!deepdetectStore.isReady) {
      // Loading screen

      return (
        <div>
          <Header />
          <Loading />
        </div>
      );
    } else {
      // Full Layout

      return (
        <div>
          <Header />
          <Switch>
            <Route exact path="/" component={Home} />

            <Route exact path="/predict" component={PredictHome} />
            <Route exact path="/predict/new" component={PredictNew} />
            <Route
              exact
              path="/predict/:serverName/:serviceName"
              component={PredictShow}
            />

            <Route exact path="/training" component={TrainingHome} />
            <Route exact path="/trainingArchive" component={TrainingHome} />
            <Route
              exact
              path="/training/:serverName/:serviceName"
              component={TrainingShow}
            />
            <Route
              exact
              path="/trainingArchive/:modelPath*"
              component={TrainingArchive}
            />

            <Route exact path="/404" component={GenericNotFound} />
          </Switch>
        </div>
      );
    }
  }
}
