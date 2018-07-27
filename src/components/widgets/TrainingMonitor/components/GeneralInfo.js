import React from "react";
import PropTypes from "prop-types";

import MeasureChart from "./MeasureChart";

export default class GeneralInfo extends React.Component {
  render() {
    let infoCharts = [];

    const { service } = this.props;

    const mltype = service.respInfo.body.mltype;
    const measure = service.respTraining.body.measure;

    infoCharts.push(
      <MeasureChart
        title="Train Loss"
        key="train_loss"
        attribute="train_loss"
        {...this.props}
      />
    );

    switch (mltype) {
      case "segmentation":
        infoCharts.push(
          <MeasureChart
            title="Accuracy"
            attribute="acc"
            key="acc"
            steppedLine={true}
            {...this.props}
          />
        );
        infoCharts.push(
          <MeasureChart
            title="Mean Accuracy"
            attribute="meanacc"
            key="meanacc"
            steppedLine={true}
            {...this.props}
          />
        );
        infoCharts.push(
          <MeasureChart
            title="Mean IOU"
            attribute="meaniou"
            key="meaniou"
            steppedLine={true}
            {...this.props}
          />
        );
        break;
      case "detection":
        infoCharts.push(
          <MeasureChart
            title="MAP"
            attribute="map"
            key="map"
            steppedLine={true}
            {...this.props}
          />
        );
        break;
      case "classification":
        infoCharts.push(
          <MeasureChart
            title="Accuracy"
            attribute="acc"
            key="acc"
            steppedLine={true}
            {...this.props}
          />
        );
        infoCharts.push(
          <MeasureChart
            title="Mean Accuracy"
            attribute="meanacc"
            key="meanacc"
            steppedLine={true}
            {...this.props}
          />
        );
        infoCharts.push(
          <MeasureChart
            title="F1"
            attribute="f1"
            key="f1"
            steppedLine={true}
            {...this.props}
          />
        );
        infoCharts.push(
          <MeasureChart
            title="Mcll"
            attribute="mcll"
            key="mcll"
            steppedLine={true}
            {...this.props}
          />
        );
        break;
      case "regression":
        infoCharts.push(
          <MeasureChart
            title="Eucll"
            attribute="eucll"
            key="eucll"
            steppedLine={true}
            {...this.props}
          />
        );
        break;
      default:
        break;
    }

    return (
      <div className="trainingmonitor-generalinfo">
        <div className="row">{infoCharts}</div>
        <div className="row">
          <div className="col-md-3">
            <span>
              <b># Iteration</b>: {measure.iteration}
            </span>
          </div>
          <div className="col-md-3">
            <span>
              <b>Iteration Time</b>: {measure.iter_time}
            </span>
          </div>
          <div className="col-md-6">
            <span>
              <b>Remaining Time</b>: {measure.remain_time_str}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

GeneralInfo.propTypes = {
  service: PropTypes.object.isRequired
};
