import React from "react";
import { observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

@withRouter
@observer
class Chain extends React.Component {
  render() {
    const { chain } = this.props;

    return (
      <li>
        <Link
          id={`serviceList-chain-${chain.name}`}
          to={`/chains/${chain.name}`}
        >
          <span className="nav-item-name">
            <i className="fas fa-link" />
            &nbsp;{decodeURIComponent(chain.name)}
          </span>
        </Link>
      </li>
    );
  }
}
export default Chain;
