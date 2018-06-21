import React from "react";
import { inject, observer } from "mobx-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/styles/hljs";
import ReactTooltip from "react-tooltip";

import copy from "copy-to-clipboard";

@inject("imaginateStore")
@observer
export default class JsonResponse extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      copied: false
    };

    this.handleCopyClipboard = this.handleCopyClipboard.bind(this);
  }

  handleCopyClipboard() {
    const { service } = this.props.imaginateStore;

    copy(JSON.stringify(service.selectedInput.json, null, 2));

    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, 2000);
  }

  render() {
    const { service } = this.props.imaginateStore;
    const selectedInput = service.selectedInput;

    if (!selectedInput || !selectedInput.json) {
      return null;
    }

    const copiedText = this.state.copied ? "Copied!" : "Copy to clipboard";

    return (
      <div>
        <div className="bd-clipboard">
          <button
            className="btn-clipboard"
            title=""
            data-tip
            data-for="copy-tooltip"
            data-iscapture={true}
            onClick={this.handleCopyClipboard}
          >
            Copy
          </button>
          <ReactTooltip
            id="copy-tooltip"
            effect="solid"
            getContent={() => copiedText}
          />
        </div>
        <SyntaxHighlighter language="json" style={docco} className="card-text">
          {JSON.stringify(selectedInput.json, null, 1)}
        </SyntaxHighlighter>
      </div>
    );
  }
}
