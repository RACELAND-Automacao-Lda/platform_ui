import React from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";
import moment from "moment";

@withRouter
@inject("deepdetectStore")
@inject("modelRepositoriesStore")
@observer
export default class ModelRepositoryCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isPublishing: false,
      publishError: null
    };

    this.getValue = this.getValue.bind(this);
    this.handlePublishClick = this.handlePublishClick.bind(this);
  }

  handlePublishClick() {
    this.setState({ isPublishing: true });

    const { deepdetectStore, modelRepositoriesStore, service } = this.props;

    const { repositoryStores } = modelRepositoriesStore;
    const privateStore = repositoryStores.find(r => r.name === "private");
    const targetRepository =
      privateStore.systemPath + privateStore.nginxPath + service.name;

    const serviceConfig = {
      description: "",
      model: {
        repository: targetRepository,
        create_repository: true
      },
      mllib: "caffe",
      type: "supervised",
      parameters: {
        input: {
          connector: "image",
          height: 300,
          width: 300
        },
        output: {
          store_config: true
        },
        mllib: {
          nclasses: 2,
          gpu: true,
          gpuid: 0,
          from_repository: service.location
        }
      }
    };

    const ddServer = deepdetectStore.hostableServer;
    //const ddServer = deepdetectStore.servers.find(
    //  s => s.name === "training_test"
    //);

    const existingServices = ddServer.services.map(s => s.name.toLowerCase());
    if (existingServices.includes(service.name.toLowerCase())) {
      this.setState({
        isPublishing: false,
        publishError: "Service name already exists"
      });
    } else {
      ddServer.newService(service.name, serviceConfig, () => {
        this.props.history.push(`/predict/${ddServer.name}/${service.name}`);
      });
    }
  }

  getValue(attr) {
    const { service } = this.props;

    if (!service.jsonMetrics) return null;

    const { measure, measure_hist } = service.jsonMetrics.body;

    let value = null;

    if (measure) {
      value = measure[attr];
    } else if (
      measure_hist &&
      measure_hist[`${attr}_hist`] &&
      measure_hist[`${attr}_hist`].length > 0
    ) {
      value =
        measure_hist[`${attr}_hist`][measure_hist[`${attr}_hist`].length - 1];
    }

    if (attr !== "remain_time_str" && value) {
      if (attr === "train_loss") {
        value = value.toFixed(10);
      } else {
        value = value.toFixed(5);
      }
    }

    return value;
  }

  render() {
    const repository = this.props.service;

    if (!repository) return null;

    const mltype = repository.jsonMetrics
      ? repository.jsonMetrics.body.mltype
      : null;

    const archiveUrl = `/trainingArchive${repository.path}`;

    let badges = [];

    if (mltype) {
      badges.push({
        classNames: "badge badge-secondary",
        status: mltype
      });
    }

    let tags = repository.trainingTags;
    if (tags && tags.length > 0) {
      tags.forEach(t => {
        badges.push({
          classNames: "badge badge-info",
          status: t
        });
      });
    }

    if (repository.metricsDate) {
      badges.push({
        classNames: "badge badge-light",
        status: moment(repository.metricsDate).format("L LT")
      });
    }

    let info = [];

    const train_loss = this.getValue("train_loss");
    if (train_loss)
      info.push({
        text: "Train Loss",
        val: train_loss
      });

    switch (mltype) {
      case "segmentation":
        const meaniou = this.getValue("meaniou");
        if (meaniou)
          info.push({
            text: "Mean IOU",
            val: meaniou
          });
        break;
      case "detection":
        const map = this.getValue("map");
        if (map)
          info.push({
            text: "MAP",
            val: map
          });
        break;
      case "ctc":
        const ctc_acc = this.getValue("acc");
        const ctc_accp = this.getValue("accp");
        if (ctc_acc || ctc_accp)
          info.push({
            text: "Accuracy",
            val: ctc_acc || ctc_accp
          });
        break;
      case "classification":
        const classif_acc = this.getValue("acc");
        const classif_accp = this.getValue("accp");
        if (classif_acc || classif_accp)
          info.push({
            text: "Accuracy",
            val: classif_acc || classif_accp
          });

        const f1 = this.getValue("f1");
        if (f1)
          info.push({
            text: "F1",
            val: f1
          });

        const mcll = this.getValue("mcll");
        if (mcll)
          info.push({
            text: "mcll",
            val: mcll
          });
        break;
      case "regression":
        const eucll = this.getValue("eucll");
        if (eucll)
          info.push({
            text: "Eucll",
            val: eucll
          });
        break;
      default:
        break;
    }

    let bestModelInfo = null;
    if (repository.bestModel) {
      bestModelInfo = (
        <div>
          <hr />
          <p>Best Model</p>
          <ul>
            {Object.keys(repository.bestModel).map((k, i) => {
              let attrTitle =
                i === 0
                  ? k.replace(/\b\w/g, l => l.toUpperCase())
                  : k.toUpperCase();

              if (attrTitle === "MEANIOU") attrTitle = "Mean IOU";

              return (
                <li key={i}>
                  {attrTitle}: <b>{repository.bestModel[k]}</b>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    let publishButton = repository.jsonConfig ? (
      <a
        onClick={this.handlePublishClick}
        className="btn btn-outline-secondary"
      >
        Publish
      </a>
    ) : null;

    if (this.state.isPublishing) {
      publishButton = (
        <a className="btn btn-outline-secondary">
          <i className="fas fa-spinner fa-spin" /> Publishing...
        </a>
      );
    }

    return (
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">
            {repository.name}
            <br />
            {badges.map((badge, key) => {
              return (
                <span key={key} className={badge.classNames}>
                  {badge.loading ? (
                    <i className="fas fa-spinner fa-spin" />
                  ) : (
                    ""
                  )}
                  {badge.status}
                </span>
              );
            })}
          </h5>
          <ul>
            {info.map((i, index) => {
              return (
                <li key={index}>
                  {i.text}: {i.breakline ? <br /> : ""}
                  <b>{i.val}</b>
                </li>
              );
            })}
          </ul>
          {bestModelInfo}
          {this.state.publishError ? (
            <div className="alert alert-danger" role="alert">
              <i class="fas fa-exclamation-triangle" />{" "}
              {this.state.publishError}
            </div>
          ) : (
            ""
          )}
          <Link to={archiveUrl} className="btn btn-outline-primary">
            View
          </Link>
          &nbsp;
          {publishButton}
        </div>
      </div>
    );
  }
}

ModelRepositoryCard.propTypes = {
  repository: PropTypes.object
};
