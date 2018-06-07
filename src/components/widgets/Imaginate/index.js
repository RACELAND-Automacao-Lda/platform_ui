import React from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

import ImageList from "./ImageList";
import BoundingBoxDisplay from "./BoundingBoxDisplay";
import CurlCommand from "./CurlCommand";
import JsonResponse from "./JsonResponse";
import Description from "./Description";
import Threshold from "./Threshold";
import InputUrl from "./InputUrl";

@inject("commonStore")
@inject("imaginateStore")
@inject("deepdetectStore")
@withRouter
@observer
export default class Imaginate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedBoxIndex: -1,
      tab: "curl"
    };

    this.selectImage = this.selectImage.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.addUrl = this.addUrl.bind(this);

    this.onOver = this.onOver.bind(this);
    this.onLeave = this.onLeave.bind(this);

    this.setTab = this.setTab.bind(this);
  }

  componentWillMount() {
    this.selectImage(0);
  }

  componentDidMount() {
    this.selectImage(0);
  }

  componentWillReceiveProps() {
    this.selectImage(0);
  }

  setTab(tabName) {
    this.setState({ tab: tabName });
  }

  addUrl(url) {
    const store = this.props.imaginateStore;
    store.addImageFromUrl(url);
    this.loadImage();
  }

  selectImage(index) {
    const store = this.props.imaginateStore;
    store.setSelectedImage(index);
    this.loadImage();
  }

  loadImage() {
    const store = this.props.imaginateStore;
    const ddStore = this.props.deepdetectStore;

    if (ddStore.currentServiceIndex === -1) return null;

    const service = ddStore.services[ddStore.currentServiceIndex];

    if (typeof service === "undefined") {
      this.props.history.push(`/predict/new`);
    }

    store.initPredict(service.name);
    store.predict(service.name);
  }

  onOver(index) {
    this.setState({ selectedBoxIndex: index });
  }

  onLeave() {
    this.setState({ selectedBoxIndex: -1 });
  }

  render() {
    const store = this.props.imaginateStore;
    const ddStore = this.props.deepdetectStore;

    if (ddStore.currentServiceIndex === -1 || !store.isLoaded) return null;

    return (
      <div className="imaginate">
        <div className="row">
          <div className="col-md-8">
            <div className="row">
              <div className="img-list col-sm-12">
                <ImageList selectImage={this.selectImage} />
              </div>
            </div>

            <div className="row">
              <BoundingBoxDisplay
                selectedBoxIndex={this.state.selectedBoxIndex}
                onOver={this.onOver}
                onLeave={this.onLeave}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="row">
              <InputUrl addUrl={this.addUrl} />
            </div>
            <div className="row">
              <Threshold loadImage={this.loadImage} />
            </div>
            <div className="row description">
              <Description
                selectedBoxIndex={this.state.selectedBoxIndex}
                onOver={this.onOver}
                onLeave={this.onLeave}
              />
            </div>
            <div className="card commands">
              <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                  <li className="nav-item">
                    <a
                      className={
                        this.state.tab === "curl"
                          ? "nav-link active"
                          : "nav-link"
                      }
                      onClick={this.setTab.bind(this, "curl")}
                    >
                      Curl&nbsp;
                      {store.isRequesting ? (
                        <i className="fas fa-spinner fa-spin" />
                      ) : (
                        ""
                      )}
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      className={
                        this.state.tab === "json"
                          ? "nav-link active"
                          : "nav-link"
                      }
                      onClick={this.setTab.bind(this, "json")}
                    >
                      JSON
                    </a>
                  </li>
                </ul>
              </div>
              <div className="card-body">
                {this.state.tab === "curl" ? <CurlCommand /> : <JsonResponse />}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
