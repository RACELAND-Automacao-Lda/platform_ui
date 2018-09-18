import React from "react";
import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

import ImageList from "./ImageList";
import BoundingBoxDisplay from "./BoundingBoxDisplay";
import Threshold from "./Threshold";
import InputForm from "./InputForm";

import ParamSlider from "../commons/ParamSlider";
import Description from "../commons/Description";
import CardCommands from "../commons/CardCommands";
import ToggleControl from "../commons/ToggleControl";

@inject("imaginateStore")
@withRouter
@observer
export default class ImageConnector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedBoxIndex: -1,
      sliderBest: 1
    };

    this.onOver = this.onOver.bind(this);
    this.onLeave = this.onLeave.bind(this);

    this.confidenceTooltipFormatter = this.confidenceTooltipFormatter.bind(
      this
    );
    this.handleConfidenceThreshold = this.handleConfidenceThreshold.bind(this);
    this.handleBestThreshold = this.handleBestThreshold.bind(this);
    this.handleMultisearchRoi = this.handleMultisearchRoi.bind(this);
  }

  onOver(index) {
    this.setState({ selectedBoxIndex: index });
  }

  onLeave() {
    this.setState({ selectedBoxIndex: -1 });
  }

  confidenceTooltipFormatter(value) {
    return (value / 100).toFixed(2);
  }

  handleConfidenceThreshold(value) {
    const { serviceSettings } = this.props.imaginateStore;
    serviceSettings.threshold.confidence = parseFloat((value / 100).toFixed(2));
    if (serviceSettings.threshold.confidence === 0) {
      serviceSettings.threshold.confidence = 0.01;
    }
    this.props.imaginateStore.predict();
  }

  handleBestThreshold(value) {
    const { serviceSettings } = this.props.imaginateStore;
    serviceSettings.request.best = parseInt(value, 10);
    this.setState({ sliderBest: value });
    this.props.imaginateStore.predict();
  }

  handleMultisearchRoi(value) {
    const { serviceSettings } = this.props.imaginateStore;
    this.setState({ multisearch_roi: !this.state.multisearch_roi });
    serviceSettings.request.multisearch_roi = !this.state.multisearch_roi;
    this.props.imaginateStore.predict();
  }

  render() {
    const { service, serviceSettings } = this.props.imaginateStore;

    if (!service) return null;

    const input = service.selectedInput;

    let uiControls = [];

    if (
      input &&
      !input.hasPredictionValues &&
      !input.isCtcOuput &&
      !input.isSegmentationInput
    ) {
      uiControls.push(<Threshold key="threshold" />);

      // Note: the threshold confidence variable in the key attribute
      // is a hack to update the slider when user pushes
      // on other external threshold (salient/medium/detailed for example)
      uiControls.push(
        <ParamSlider
          key={`paramSliderConfidence-${serviceSettings.threshold.confidence}`}
          title="Confidence threshold"
          defaultValue={parseInt(
            serviceSettings.threshold.confidence * 100,
            10
          )}
          onAfterChange={this.handleConfidenceThreshold}
          tipFormatter={this.confidenceTooltipFormatter}
        />
      );

      if (service.settings.mltype === "classification") {
        // && service.respInfo.body.parameters.mllib[0].nclasses.length > 0

        uiControls.push(
          <ParamSlider
            key="paramSliderBest"
            title="Best threshold"
            defaultValue={this.state.sliderBest}
            onAfterChange={this.handleBestThreshold}
            min={1}
            max={20}
          />
        );
      }
    }

    if (service.respInfo.body.mltype === "rois") {
      uiControls.push(
        <ToggleControl
          key="paramMultisearchRoi"
          title="Multisearch ROI"
          value={this.state.multisearch_roi}
          onChange={this.handleMultisearchRoi}
        />
      );
    }

    return (
      <div className="imaginate">
        <div className="row">
          <div className="col-md-7">
            <div className="row">
              <div className="img-list col-sm-12">
                <ImageList />
              </div>
            </div>

            {service.isRequesting ? (
              <div className="alert alert-primary" role="alert">
                <i className="fas fa-spinner fa-spin" />&nbsp; Loading...
              </div>
            ) : (
              ""
            )}

            <div className="row">
              <BoundingBoxDisplay
                selectedBoxIndex={this.state.selectedBoxIndex}
                onOver={this.onOver}
                input={toJS(service.selectedInput)}
                displaySettings={toJS(serviceSettings.display)}
              />
            </div>
          </div>
          <div className="col-md-5">
            <InputForm />
            {uiControls}
            <div className="description">
              <Description
                selectedBoxIndex={this.state.selectedBoxIndex}
                onOver={this.onOver}
                onLeave={this.onLeave}
              />
            </div>
            <div className="commands">
              <CardCommands />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
