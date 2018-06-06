import React from "react";
import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import Boundingbox from "react-bounding-box";

@inject("imaginateStore")
@observer
export default class BoundingBoxDisplay extends React.Component {
  render() {
    const store = this.props.imaginateStore;
    const image = store.selectedImage;

    if (image === null) {
      return (
        <div className="alert alert-primary" role="alert">
          <i className="fas fa-spinner fa-spin" />&nbsp; Loading...
        </div>
      );
    }

    return (
      <Boundingbox
        className="boundingboxdisplay"
        image={image.url}
        boxes={toJS(image.boxes)}
        selectedIndex={this.props.selectedBoxIndex}
        onSelected={this.props.onOver}
        pixelSegmentation={image.pixelSegmentation}
        separateSegmentation={store.settings.display.separateSegmentation}
        segmentationColors={toJS(store.settings.display.segmentationColors)}
      />
    );
  }
}
