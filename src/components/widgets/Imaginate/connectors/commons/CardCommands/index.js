import React from "react";
import { inject, observer } from "mobx-react";

import Header from "./Header";

import CurlCommand from "./CurlCommand";
import JsonResponse from "./JsonResponse";
import Code from "./Code";

@inject("imaginateStore")
@observer
export default class CardCommands extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tab: "curl"
    };

    this.setTab = this.setTab.bind(this);
  }

  setTab(tabName) {
    this.setState({ tab: tabName });
  }

  render() {
    const { service } = this.props.imaginateStore;
    const input = service.selectedInput;

    if (typeof input === "undefined" || !input) return null;
    const json = input.json;

    let cardBody = null;

    switch (this.state.tab) {
      default:
      case "curl":
        cardBody = <CurlCommand />;
        break;
      case "json":
        cardBody = (
          <JsonResponse
            isError={
              !json ||
              !json.state ||
              !json.status.code ||
              json.status.code === 500
            }
          />
        );
        break;
      case "code":
        cardBody = <Code />;
        break;
    }

    let requestTime = -1;
    if (json && json.head && json.head.time) {
      requestTime = json.head.time;
    }

    const isError =
      !service.isRequesting &&
      (!json || !json.status || json.status.code === 500);

    return (
      <div className="card commands">
        <Header
          requestTime={requestTime}
          tab={this.state.tab}
          onTabClick={this.setTab}
          isError={isError}
          isRequesting={service.isRequesting}
        />
        <div className="card-body">{cardBody}</div>
      </div>
    );
  }
}
