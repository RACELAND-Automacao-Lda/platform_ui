import React from "react";
import { inject, observer } from "mobx-react";

@inject("imaginateStore")
@observer
export default class Header extends React.Component {
  render() {
    return (
      <div className="card-header">
        {this.props.requestTime !== -1 ? (
          <span className="badge badge-secondary float-right">
            {this.props.requestTime}ms
          </span>
        ) : (
          ""
        )}

        {this.props.isRequesting ? (
          <span className="badge badge-secondary float-right">
            <i className="fas fa-spinner fa-spin fa-sm" />
          </span>
        ) : (
          ""
        )}

        <ul className="nav nav-tabs card-header-tabs">
          <li className="nav-item">
            <a
              className={
                this.props.tab === "curl" ? "nav-link active" : "nav-link"
              }
              onClick={this.props.onTabClick.bind(this, "curl")}
            >
              Curl&nbsp;
            </a>
          </li>

          <li className="nav-item">
            <a
              className={
                this.props.tab === "json" ? "nav-link active" : "nav-link"
              }
              onClick={this.props.onTabClick.bind(this, "json")}
            >
              JSON&nbsp;
              {this.props.isError ? (
                <i className="fas fa-exclamation-triangle" />
              ) : (
                ""
              )}
            </a>
          </li>

          <li className="nav-item">
            <a
              className={
                this.props.tab === "code" ? "nav-link active" : "nav-link"
              }
              onClick={this.props.onTabClick.bind(this, "code")}
            >
              Code
            </a>
          </li>
        </ul>
      </div>
    );
  }
}
