import React from "react";
import { withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";

@inject("deepdetectStore")
@inject("modalStore")
@observer
@withRouter
export default class StopTrainingModal extends React.Component {
  constructor(props) {
    super(props);
    this.handleStopTraining = this.handleStopTraining.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleCancel() {
    this.props.modalStore.setVisible("stopTraining", false);
  }

  handleStopTraining() {
    this.props.modalStore.setVisible("stopTraining", false);
    const ddStore = this.props.deepdetectStore;

    ddStore.deleteService(() => {
      this.props.history.push("/#/training");
    });
  }

  render() {
    const { server } = this.props.deepdetectStore;

    if (!server || !server.service) return null;

    return (
      <div id="modal-stopTraining">
        <div className="modal-header">
          <h5 className="modal-title">Are you sure ?</h5>
        </div>

        <div className="modal-body">
          Do you really want to stop training <pre>{server.service.name}</pre>{" "}
          on DeepDetect server <pre>{server.name}</pre> ?
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary mb-2"
            onClick={this.handleCancel}
          >
            No
          </button>
          <button
            type="submit"
            className="btn btn-primary mb-2"
            onClick={this.handleStopTraining}
          >
            Yes
          </button>
        </div>
      </div>
    );
  }
}
