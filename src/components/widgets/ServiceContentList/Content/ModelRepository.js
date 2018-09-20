import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

@withRouter
@observer
export default class ModelRepositoryContent extends React.Component {
  constructor(props) {
    super(props);

    this.getValue = this.getValue.bind(this);
  }

  getValue(attr) {
    const { service } = this.props;
    const { measure, measure_hist } = service.jsonMetrics.body;

    let value = "--";

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

    if (attr !== "remain_time_str" && value && value !== "--") {
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

    const { mltype } = repository.jsonMetrics.body;

    const archiveUrl = `/trainingArchive/${repository.name}`;

    let badges = [];

    badges.push({
      classNames: "badge badge-secondary",
      status: mltype
    });

    let tags = repository.trainingTags;
    if (tags && tags.length > 0) {
      tags.forEach(t => {
        badges.push({
          classNames: "badge badge-info",
          status: t
        });
      });
    }

    let info = [
      {
        text: "Train Loss",
        val: this.getValue("train_loss")
      }
    ];

    let val_acc, val_accp;

    switch (mltype) {
      case "segmentation":
        info.push({
          text: "Mean IOU",
          val: this.getValue("meaniou")
        });
        break;
      case "detection":
        info.push({
          text: "MAP",
          val: this.getValue("map")
        });
        break;
      case "ctc":
        val_acc = this.getValue("acc");
        val_accp = this.getValue("accp");
        info.push({
          text: "Accuracy",
          val: val_acc || val_accp
        });
        break;
      case "classification":
        val_acc = this.getValue("acc");
        val_accp = this.getValue("accp");
        info.push({
          text: "Accuracy",
          val: val_acc || val_accp
        });
        info.push({
          text: "F1",
          val: this.getValue("f1")
        });

        info.push({
          text: "mcll",
          val: this.getValue("mcll")
        });
        break;
      case "regression":
        info.push({
          text: "Eucll",
          val: this.getValue("eucll")
        });
        break;
      default:
        break;
    }

    let bestModelInfo = null;
    if (repository.bestModel) {
      bestModelInfo = (
        <div>
          <ul>
            {Object.keys(repository.bestModel).map((k, i) => {
              let attrTitle =
                i === 0
                  ? k.replace(/\b\w/g, l => l.toUpperCase())
                  : k.toUpperCase();

              if (attrTitle === "MEANIOU") attrTitle = "Mean IOU";

              return (
                <li key={i}>
                  {attrTitle} [best]: <b>{repository.bestModel[k]}</b>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    return (
      <div
        className="row"
        style={{ borderTop: "1px solid #ccc", padding: "5px 0" }}
      >
        <div className="col-md-4 main-info">
          <h5>{repository.name}</h5>
          <span classNames="badges">
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
          </span>
        </div>
        <div className="col-md-3 main-values">
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
        </div>
        <div className="col-md-3 main-best">{bestModelInfo}</div>
        <div className="col-md-2 main-meta">
          <Link to={archiveUrl} className="btn btn-outline-primary view">
            <i class="fas fa-search" /> View
          </Link>
        </div>
      </div>
    );
  }
}

ModelRepositoryContent.propTypes = {
  repository: PropTypes.object
};
