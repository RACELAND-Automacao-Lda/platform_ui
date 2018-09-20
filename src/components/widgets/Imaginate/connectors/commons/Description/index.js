import React from "react";
import { inject, observer } from "mobx-react";

import { findDOMNode } from "react-dom";
import ReactTooltip from "react-tooltip";
import Boundingbox from "react-bounding-box";

@inject("imaginateStore")
@observer
export default class Description extends React.Component {
  constructor(props) {
    super(props);
    this._nodes = new Map();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedBoxIndex === -1) {
      this._nodes.forEach(n => ReactTooltip.hide(findDOMNode(n)));
    } else {
      const node = findDOMNode(this._nodes.get(nextProps.selectedBoxIndex));
      ReactTooltip.show(node);
    }
  }

  render() {
    const store = this.props.imaginateStore;
    const service = store.service;

    if (!service || !service.selectedInput) return null;

    const input = service.selectedInput;

    if (
      input.error ||
      !input.json ||
      !input.json.body ||
      !input.json.body.predictions ||
      input.json.body.predictions.length === 0 ||
      !input.json.body.predictions[0]
    ) {
      return null;
    }

    const inputClasses = input.json.body.predictions[0].classes;

    let displayFormat = store.serviceSettings.display.format;

    if (this.props.displayFormat) {
      displayFormat = this.props.displayFormat;
    } else {
      if (store.serviceSettings.display.boundingBox) {
        displayFormat = "icons";
      }

      if (store.service.settings.mltype === "ctc") {
        displayFormat = "category";
      }
    }

    if (service.settings.mltype === "rois") {
      displayFormat = "nns";
    }

    if (
      service.respInfo &&
      service.respInfo.body &&
      service.respInfo.body.mltype === "classification"
    ) {
      displayFormat = "category";
    }

    let output = "";
    switch (displayFormat) {
      default:
      case "simple":
        output = (
          <div>
            {inputClasses.map((category, index) => {
              return (
                <div className="predictDisplay" key={index}>
                  {category.cat} - {category.prob}
                </div>
              );
            })}
          </div>
        );
        break;

      case "expectation":
        output = (
          <span>
            {Math.ceil(
              inputClasses.reduce((acc, current) => {
                return acc + parseInt(current.cat, 10) * current.prob;
              }, 0)
            )}
          </span>
        );
        break;

      case "list":
        output = (
          <div>
            {inputClasses.map((category, index) => {
              const percent = parseInt(category.prob * 100, 10);
              const progressStyle = { width: `${percent}%` };
              let progressBg = "bg-success";

              if (percent < 60) {
                progressBg = "bg-warning";
              }

              if (percent < 30) {
                progressBg = "bg-danger";
              }

              if (this.props.selectedBoxIndex === index) {
                progressBg = "bg-info";
              }

              return (
                <div className="progress">
                  <div
                    className={`progress-bar ${progressBg}`}
                    role="progressbar"
                    style={progressStyle}
                    aria-valuenow={percent}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    onMouseOver={this.props.onOver.bind(this, index)}
                    onMouseLeave={this.props.onLeave}
                  >
                    {category.cat}
                  </div>
                </div>
              );
            })}
          </div>
        );
        break;

      case "nns":
        const { selectedBoxIndex } = this.props;
        const prediction = input.json.body.predictions[0];
        let cells = [];

        if (!prediction) break;

        if (prediction.rois) {
          const source = prediction.rois;

          if (source.length === 0 || !source[selectedBoxIndex]) break;

          cells = source[selectedBoxIndex].nns
            .sort((a, b) => b.prob - a.prob)
            .map((category, index) => {
              const percent = parseInt(category.prob * 100, 10);
              const progressStyle = { width: `${percent}%` };

              let progressBg = "bg-success";
              let selectedBoxColor = "#31a354";

              if (percent < 60) {
                progressBg = "bg-warning";
                selectedBoxColor = "#a1d99b";
              }

              if (percent < 30) {
                progressBg = "bg-danger";
                selectedBoxColor = "#e5f5e0";
              }

              if (this.props.selectedBoxIndex === index) {
                progressBg = "bg-info";
              }

              return (
                <div key={index} className="col progress-nns">
                  <Boundingbox
                    key={`category-${Math.random()}`}
                    image={category.uri}
                    boxes={[
                      {
                        coord: [
                          category.bbox.xmin,
                          category.bbox.ymax,
                          category.bbox.xmax - category.bbox.xmin,
                          category.bbox.ymin - category.bbox.ymax
                        ]
                      }
                    ]}
                    options={{
                      colors: {
                        normal: "#ffffff",
                        selected: selectedBoxColor
                      }
                    }}
                    drawBox={(canvas, box, color) => {
                      const ctx = canvas.getContext("2d");

                      const coord = box.coord ? box.coord : box;
                      let [x, y, width, height] = coord;

                      ctx.strokeStyle = color;
                      ctx.lineWidth = 5;
                      ctx.beginPath();
                      ctx.lineTo(x, y);
                      ctx.lineTo(x, y + height);
                      ctx.lineTo(x + width, y + height);
                      ctx.lineTo(x + width, y);
                      ctx.lineTo(x, y);
                      ctx.stroke();
                    }}
                  />
                  <div
                    className={`progress-bar ${progressBg}`}
                    role="progressbar"
                    style={progressStyle}
                    aria-valuenow={percent}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {percent}
                  </div>
                </div>
              );
            })
            .reduce((result, element, index, array) => {
              // Add separators
              result.push(element);
              if ((index + 1) % 2 === 0) {
                result.push(<div key={`sep-${index}`} className="w-100" />);
              }
              return result;
            }, []);
        } else {
          if (!prediction || !prediction.nns || prediction.nns.length === 0)
            break;

          cells = prediction.nns
            .map((nns, index) => {
              const percent = parseInt(nns.dist * 100, 10);
              const progressStyle = { width: `${percent}%` };

              let progressBg = "bg-danger";

              if (percent < 60) {
                progressBg = "bg-warning";
              }

              if (percent < 30) {
                progressBg = "bg-success";
              }

              return (
                <div key={index} className="col progress-nns">
                  <img src={nns.uri} className="img-fluid" alt="" />
                  <div
                    className={`progress-bar ${progressBg}`}
                    role="progressbar"
                    style={progressStyle}
                    aria-valuenow={percent}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {percent}
                  </div>
                </div>
              );
            })
            .reduce((result, element, index, array) => {
              // Add separators
              result.push(element);
              if ((index + 1) % 2 === 0) {
                result.push(<div key={`sep-${index}`} className="w-100" />);
              }
              return result;
            }, []);
        }

        // Add empty column to fill row
        if (cells.length % 2 === 0) cells.push(<div className="col" />);

        output = <div className="row">{cells}</div>;
        break;

      case "list-url":
        output = (
          <div>
            {inputClasses.map((category, index) => {
              return (
                <div className="predictDisplay">
                  <img src={category.uri} alt="category" />
                  {category.dist}
                </div>
              );
            })}
          </div>
        );
        break;

      case "category":
        output = (
          <div>
            {inputClasses.map((category, index) => {
              let styles = {
                color: ""
              };

              // okClass settings
              if (
                store.serviceSettings.display.okClass &&
                store.serviceSettings.display.okClass.length > 0
              ) {
                styles.color =
                  store.serviceSettings.display.okClass === category.cat
                    ? "#0C0"
                    : "#C00";
              }

              return (
                <div>
                  <span
                    style={styles}
                    key={index}
                    className="badge badge-success"
                    onMouseOver={this.props.onOver.bind(this, index)}
                    onMouseLeave={this.props.onLeave}
                    data-tip={`${category.prob.toFixed(2)}`}
                    ref={c => this._nodes.set(index, c)}
                  >
                    {category.cat}
                  </span>&nbsp;
                </div>
              );
            })}
            <ReactTooltip effect="solid" />
          </div>
        );
        break;

      case "icons":
        if (inputClasses) {
          output = (
            <div>
              {inputClasses.map((category, index) => {
                let styles = {
                  color: ""
                };

                // okClass settings
                if (
                  store.serviceSettings.display.okClass &&
                  store.serviceSettings.display.okClass.length > 0
                ) {
                  styles.color =
                    store.serviceSettings.display.okClass === category.cat
                      ? "#0C0"
                      : "#C00";
                }

                let bottomClass = "fa fa-stack-2x " + category.cat;
                bottomClass +=
                  this.props.selectedBoxIndex === index
                    ? " fa-square"
                    : " fa-circle";

                const opacity =
                  this.props.selectedBoxIndex === index ? 1 : category.prob;
                styles.opacity = opacity;

                let topClass = "fa fa-stack-1x fa-inverse fa-" + category.cat;

                return (
                  <div key={index} style={{ display: "inline" }}>
                    <span
                      key={`icon-${index}`}
                      className="fa-stack"
                      onMouseOver={this.props.onOver.bind(this, index)}
                      onMouseLeave={this.props.onLeave}
                      data-tip={`${category.cat} - ${category.prob.toFixed(2)}`}
                      ref={c => this._nodes.set(index, c)}
                    >
                      <i className={bottomClass} style={styles} />
                      <i className={topClass} style={{ opacity: opacity }} />
                    </span>
                  </div>
                );
              })}
              <ReactTooltip effect="solid" />
            </div>
          );
        }
        break;
    }

    return output;
  }
}
