import React from "react";
import { inject } from "mobx-react";

@inject("configStore")
class Jupyter extends React.Component {
  render() {
    const { configStore } = this.props;

    if (
      configStore.isComponentBlacklisted("LinkJupyter") ||
      !configStore.homeComponent ||
      !configStore.homeComponent.headerLinks ||
      !configStore.homeComponent.headerLinks.linkJupyter
    )
      return null;

    const href = configStore.homeComponent.headerLinks.linkJupyter;

    return (
      <li id="jupyter-link">
        <a
          href={href}
          style={{ textDecoration: "none" }}
          target="_blank"
          rel="noreferrer noopener"
        >
          <i className="fas fa-circle-notch" />&nbsp; Jupyter
        </a>
      </li>
    );
  }
}

export default Jupyter;
