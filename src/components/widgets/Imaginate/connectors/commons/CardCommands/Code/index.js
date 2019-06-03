import React from "react";
import { inject, observer } from "mobx-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/styles/hljs";
import ReactTooltip from "react-tooltip";

import copy from "copy-to-clipboard";

@inject("imaginateStore")
@observer
export default class Code extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      copied: false,
      selectedLang: "python"
    };

    this.handleCopyClipboard = this.handleCopyClipboard.bind(this);
    this.code = this.code.bind(this);
    this.pythonCode = this.pythonCode.bind(this);
    this.javascriptCode = this.javascriptCode.bind(this);
  }

  code() {
    let code = "";

    switch (this.state.selectedLang) {
      case "javascript":
        code = this.javascriptCode();
        break;
      case "python":
        code = this.pythonCode();
        break;
      default:
        break;
    }

    return code;
  }

  javascriptCode() {
    const { service, settings } = this.props.imaginateStore;

    let codeSettings = settings.default.code;

    const serviceSettings = settings.services.find(
      s => s.name === service.name
    );
    if (serviceSettings && serviceSettings.code) {
      codeSettings = serviceSettings.code;
    }

    const postData = service.selectedInput.postData;

    let javascriptCode = "// https://www.npmjs.com/package/deepdetect-js\n";

    if (codeSettings.display.importLib) {
      javascriptCode += `var DD = require('deepdetect-js');\n\n`;
    }

    if (codeSettings.display.ddConfig) {
      const host = codeSettings.hostname
        ? codeSettings.hostname
        : window.location.hostname;

      const port = codeSettings.port
        ? codeSettings.port
        : window.location.port || (window.protocol === "https" ? 443 : 80);

      javascriptCode += `const dd = new DD({
  host: '${host}',
  port: ${port},
  path: '${service.serverSettings.path}'
})\n\n`;
    }

    if (codeSettings.display.postPredict) {
      javascriptCode += `const postData = ${JSON.stringify(
        postData,
        null,
        2
      )}\n\n`;
      javascriptCode += `async function run() {
  const predict = await dd.postPredict(postData);
  console.log(predict);
}

run()`;
    }

    return javascriptCode;
  }

  pythonCode() {
    const { service, settings } = this.props.imaginateStore;

    let codeSettings = settings.default.code;

    const serviceSettings = settings.services.find(
      s => s.name === service.name
    );
    if (serviceSettings && serviceSettings.code) {
      codeSettings = serviceSettings.code;
    }

    console.log(codeSettings);

    const postData = service.selectedInput.postData;

    let pythonCode = "# Download dd_client.py from:\n";
    pythonCode +=
      "# https://github.com/jolibrain/deepdetect/blob/master/clients/python/dd_client.py\n";

    if (codeSettings.display.importLib) {
      pythonCode += `from dd_client import DD\n\n`;
    }

    if (codeSettings.display.ddConfig) {
      pythonCode += `host = '${window.location.hostname}'
port = ${window.location.port || (window.protocol === "https" ? 443 : 80)}
path = '${service.serverSettings.path}'
dd = DD(host, port, ${window.protocol === "https" ? 1 : 0}, path=path)
dd.set_return_format(dd.RETURN_PYTHON)\n\n`;
    }

    if (postData.parameters.input) {
      pythonCode += `parameters_input = ${JSON.stringify(
        postData.parameters.input
      )
        .replace("true", "True")
        .replace("false", "False")}\n`;
    } else {
      pythonCode += `parameters_input = {}\n`;
    }

    if (postData.parameters.mlllib) {
      pythonCode += `parameters_mllib = ${JSON.stringify(
        postData.parameters.mllib
      )
        .replace("true", "True")
        .replace("false", "False")}\n`;
    } else {
      pythonCode += `parameters_mllib = {}\n`;
    }

    if (postData.parameters.output) {
      pythonCode += `parameters_output = ${JSON.stringify(
        postData.parameters.output
      )
        .replace("true", "True")
        .replace("false", "False")}\n`;
    } else {
      pythonCode += `parameters_output = {}\n`;
    }

    pythonCode += `data = ${JSON.stringify(postData.data)}\n`;
    pythonCode += `sname = '${service.name}'\n`;
    pythonCode += `classif = dd.post_predict(sname,data,parameters_input,parameters_mllib,parameters_output)`;

    return pythonCode;
  }

  componentWillReceiveProps() {
    ReactTooltip.rebuild();
  }

  handleCopyClipboard() {
    copy(this.code());

    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, 500);
  }

  render() {
    const copiedText = this.state.copied ? "Copied!" : "Copy to clipboard";

    return (
      <div>
        <div className="btn-group" role="group" aria-label="Lang selection">
          <button
            type="button"
            className={
              this.state.selectedLang === "python"
                ? "btn btn-primary"
                : "btn btn-secondary"
            }
            onClick={() => this.setState({ selectedLang: "python" })}
          >
            Python
          </button>
          <button
            type="button"
            className={
              this.state.selectedLang === "javascript"
                ? "btn btn-primary"
                : "btn btn-secondary"
            }
            onClick={() => this.setState({ selectedLang: "javascript" })}
          >
            Javascript
          </button>
        </div>
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
        <SyntaxHighlighter
          language={this.state.selectedLang}
          style={docco}
          className="card-text"
        >
          {this.code()}
        </SyntaxHighlighter>
      </div>
    );
  }
}
