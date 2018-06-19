import React from "react";
import { findDOMNode } from "react-dom";
import { inject, observer } from "mobx-react";
import ReactTooltip from "react-tooltip";

@inject("imaginateStore")
@inject("deepdetectStore")
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

    const ddStore = this.props.deepdetectStore;

    if (ddStore.server.currentServiceIndex === -1) return null;

    const service = ddStore.service;

    if (store.selectedInput === null || store.selectedInput.json === null) {
      return null;
    }

    const input = store.selectedInput;

    if (input === null || input.error) return null;

    const inputClasses = input.json.body.predictions[0].classes;

    if (typeof inputClasses === "undefined") return null;

    let displayFormat = store.settings.display.format;

    if (service.settings.mltype === "ctc") {
      displayFormat = "category";
    }

    switch (displayFormat) {
      default:
        return (
          <div>
            {inputClasses.map((category, index) => {
              return (
                <div className="predictDisplay">
                  {category.cat} - {category.prob}
                </div>
              );
            })}
          </div>
        );
      case "expectation":
        return (
          <span>
            {Math.ceil(
              inputClasses.reduce((acc, current) => {
                return acc + parseInt(current.cat, 10) * current.prob;
              }, 0)
            )}
          </span>
        );
      case "list":
        return (
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
      case "list-url":
        return (
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
      case "category":
        return (
          <div>
            {inputClasses.map((category, index) => {
              let styles = {
                color: ""
              };

              // okClass settings
              if (
                store.settings.display.okClass &&
                store.settings.display.okClass.length > 0
              ) {
                styles.color =
                  store.settings.display.okClass === category.cat
                    ? "#0C0"
                    : "#C00";
              }

              return (
                <span style={styles} key={index}>
                  {category.cat}
                </span>
              );
            })}
          </div>
        );
      case "icons":
        return (
          <div>
            {inputClasses.map((category, index) => {
              let styles = {
                color: ""
              };

              // okClass settings
              if (
                store.settings.display.okClass &&
                store.settings.display.okClass.length > 0
              ) {
                styles.color =
                  store.settings.display.okClass === category.cat
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
  }
}
