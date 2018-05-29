import React from "react";
import { withRouter } from "react-router-dom";
import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import copy from "copy-to-clipboard";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";

import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";

import { Typeahead } from "react-bootstrap-typeahead";

import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead-bs4.css";

@inject("commonStore")
@inject("deepdetectStore")
@inject("modelRepositoriesStore")
@observer
@withRouter
export default class ServiceNew extends React.Component {
  constructor(props) {
    super(props);
    this.serviceNameRef = React.createRef();
    this.serviceDescriptionRef = React.createRef();

    this.validateBeforeSubmit = this.validateBeforeSubmit.bind(this);
    this.submitService = this.submitService.bind(this);
    this.handleConfigChange = this.handleConfigChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    let config = this.props.deepdetectStore.settings.services.defaultConfig;
    const defaultModelLocation = this.props.modelRepositoriesStore
      .repositories[0];

    if (config.model && config.model.repository) {
      config.model.repository = defaultModelLocation;
    }

    this.state = {
      creatingService: false,
      serviceName: "PLEASE_DEFINE",
      config: JSON.stringify(config, null, 1),
      modelLocation: defaultModelLocation,
      copied: false,
      errors: []
    };

    this.handleCopyClipboard = this.handleCopyClipboard.bind(this);
  }

  handleConfigChange(newValue) {
    this.setState({ config: JSON.stringify(newValue, null, 1) });
  }

  handleInputChange() {
    const serviceName = this.serviceNameRef.current.value;
    const serviceDescription = this.serviceDescriptionRef.current.value;
    const serviceModelLocation = this.typeahead.getInstance().getInput().value;

    let config = JSON.parse(this.state.config);

    if (serviceName.length > 0) this.setState({ serviceName: serviceName });

    if (serviceDescription.length > 0) config.description = serviceDescription;

    if (serviceModelLocation.length > 0)
      config.model.repository = serviceModelLocation;

    this.setState({ config: JSON.stringify(config, null, 1) });
  }

  validateBeforeSubmit() {
    let errors = [];

    const serviceName = this.serviceNameRef.current.value;

    if (serviceName.length === 0) {
      errors.push("Service name can't be empty");
    }

    if (serviceName === "new") {
      errors.push("Service name can't be named 'new'");
    }

    const ddstore = this.props.deepdetectStore;
    const { services } = ddstore;
    const serviceNames = services.map(s => s.name);

    if (serviceNames.includes(serviceName)) {
      errors.push("Service name already exists");
    }

    const serviceModelLocation = this.typeahead.getInstance().getInput().value;

    if (serviceModelLocation.length === 0) {
      errors.push("Model Repository Location can't be empty");
    }

    const { autocompleteRepositories } = this.props.modelRepositoriesStore;
    const repositories = autocompleteRepositories.map(r => r.label);

    if (!repositories.includes(serviceModelLocation)) {
      errors.push("Model Repository Location must exists in predefined list");
    }

    this.setState({ errors: errors });

    return errors.length === 0;
  }

  submitService() {
    if (!this.validateBeforeSubmit()) {
      return null;
    }

    const serviceName = this.serviceNameRef.current.value;
    const serviceData = JSON.parse(this.state.config);
    this.setState({ creatingService: true });
    this.props.deepdetectStore.newService(serviceName, serviceData, resp => {
      if (resp instanceof Error) {
        this.setState({
          creatingService: false,
          error: resp.message
        });
      } else {
        this.setState({ creatingService: false, errors: [] });
        this.props.history.push(`/predict/${serviceName}`);
      }
    });
  }

  handleCopyClipboard() {
    const { settings } = this.props.deepdetectStore;
    const curlCommand = `curl -X PUT '${window.location.origin}${
      settings.server.path
    }/services/${this.state.serviceName}' -d '${this.state.config}'`;

    copy(curlCommand);

    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, 2000);
  }

  render() {
    const { settings } = this.props.deepdetectStore;

    if (settings == null) return null;

    const curlCommand = `curl -X PUT '${window.location.origin}${
      settings.server.path
    }/services/${this.state.serviceName}' -d '${this.state.config}'`;

    const copiedText = this.state.copied ? "Copied!" : "Copy to clipboard";

    return (
      <div className="widget-service-new">
        <div className="row">
          <h5>New service</h5>
        </div>

        <div className="row">
          <div className="col-md-5">
            <div className="form-row">
              <label className="sr-only" htmlFor="inlineFormInputName">
                Name
              </label>
              <input
                type="text"
                className="form-control mb-2"
                id="inlineFormInputName"
                placeholder="Service Name"
                ref={this.serviceNameRef}
                onChange={this.handleInputChange}
              />
            </div>

            <div className="form-row">
              <label className="sr-only" htmlFor="inlineFormInputDescription">
                Description
              </label>
              <input
                type="text"
                className="form-control mb-2"
                id="inlineFormInputDescription"
                placeholder="Service Description"
                ref={this.serviceDescriptionRef}
                onChange={this.handleInputChange}
              />
            </div>

            <div className="form-row">
              <label className="sr-only" htmlFor="inlineFormInputModelLocation">
                Model Location
              </label>
              <Typeahead
                id="inlineFormInputModelLocation"
                ref={typeahead => (this.typeahead = typeahead)}
                options={toJS(
                  this.props.modelRepositoriesStore.autocompleteRepositories
                )}
                placeholder="Model Repository location"
                onChange={this.handleInputChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              onClick={this.submitService}
            >
              <FontAwesomeIcon
                icon="spinner"
                spin
                style={this.state.creatingService ? {} : { display: "none" }}
              />&nbsp; Add Service
            </button>

            <div
              className="alert alert-danger"
              role="alert"
              style={{
                marginTop: "10px",
                display: this.state.errors.length > 0 ? "" : "none"
              }}
            >
              <b>Error while creating service</b>
              <ul>
                {this.state.errors.map((error, i) => <li key={i}>{error}</li>)}
              </ul>
            </div>
          </div>

          <div className="col-md-7">
            <pre className="curl-command">
              <div className="heading">
                CURL{" "}
                <span className="clipboard" onClick={this.handleCopyClipboard}>
                  {copiedText}
                </span>
              </div>
              <div className="code-wrap">
                <CodeMirror value={curlCommand} />
              </div>
            </pre>
          </div>
        </div>
      </div>
    );
  }
}
