import { observable, computed } from "mobx";

export default class Input {
  @observable isActive = false;

  @observable content = {};

  @observable postData = {};
  @observable putData = {};

  @observable path = null;
  @observable json = null;

  @observable boxes = [];

  @observable csv = {
    isReady: false,
    isFetching: false,
    columns: [],
    data: []
  };

  @computed
  get prediction() {
    let prediction = null;

    if (
      this.json &&
      this.json.body &&
      this.json.body.predictions &&
      this.json.body.predictions[0]
    ) {
      prediction = this.json.body.predictions[0];
    }

    return prediction;
  }

  @computed
  get hasPredictionValues() {
    return (
      this.json &&
      this.json.body &&
      this.json.body.predictions &&
      this.json.body.predictions[0] &&
      this.json.body.predictions[0].vals
    );
  }

  @computed
  get isCtcOuput() {
    return (
      this.postData &&
      this.postData.parameters &&
      this.postData.parameters.output &&
      this.postData.parameters.output.ctc
    );
  }

  @computed
  get isSegmentationInput() {
    return (
      this.postData &&
      this.postData.parameters &&
      this.postData.parameters.input &&
      this.postData.parameters.input.segmentation
    );
  }

  @computed
  get isChainResult() {
    return (
      this.json &&
      this.json.head &&
      this.json.head.method &&
      this.json.head.method === "/chain"
    );
  }
}
