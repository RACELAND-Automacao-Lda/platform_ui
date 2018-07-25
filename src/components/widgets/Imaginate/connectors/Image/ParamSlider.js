import React from "react";
import { inject, observer } from "mobx-react";

import Slider, { createSliderWithTooltip } from "rc-slider";
import "rc-slider/assets/index.css";
const SliderWithTooltip = createSliderWithTooltip(Slider);

@inject("imaginateStore")
@observer
export default class ParamSlider extends React.Component {
  render() {
    if (!this.props.defaultValue) return null;

    return (
      <div>
        <p>{this.props.title}</p>
        <SliderWithTooltip {...this.props} />
      </div>
    );
  }
}
