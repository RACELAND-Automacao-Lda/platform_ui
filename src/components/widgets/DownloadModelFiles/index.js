import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";

@observer
export default class DownloadModelFiles extends React.Component {
  render() {
    const { repository } = this.props;
    const files = repository.downloadableFiles;

    if (!files || files.length === 0) return null;

    return (
      <div className="downloadModelFiles">
        <h5>
          <i className="fas fa-download" /> Downloads
        </h5>

        <div className="list-group">
          {files.map((f, index) => {
            return (
              <a
                key={index}
                href={repository.path + f}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                download
              >
                {f}
                <i className="fas fa-download" />
              </a>
            );
          })}
        </div>
      </div>
    );
  }
}

DownloadModelFiles.propTypes = {
  repository: PropTypes.object.isRequired
};
