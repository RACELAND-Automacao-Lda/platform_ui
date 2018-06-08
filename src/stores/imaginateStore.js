import { observable, action } from "mobx";
import agent from "../agent";

export class imaginateStore {
  @observable isLoaded = false;
  @observable isRequesting = false;
  @observable settings = {};

  @observable imgList = [];
  @observable selectedImageIndex = -1;
  @observable selectedImage = null;

  @observable curlParams = null;
  @observable confidence = null;

  @action
  setup(configStore) {
    this.settings = configStore.imaginate;
    this.settings.deepdetect = configStore.deepdetect;

    const initImages = this.settings.display.initImages;

    // Init image list if available inside config.json
    if (typeof initImages !== "undefined") {
      switch (initImages.type) {
        case "urlList":
        default:
          const list = initImages.list;

          if (typeof list !== "undefined" && list.length > 0) {
            this.imgList = this.settings.display.initImages.list.map(img => {
              return {
                url: img,
                boxes: [[10, 10, 10, 10]],
                json: null
              };
            });
          }

          break;
      }
    }

    // If existing image, init the first selected one
    if (this.imgList.length > 0) this.selectedImageIndex = 0;

    this.confidence = this.settings.threshold.confidence;

    this.isLoaded = true;
  }

  @action
  setSelectedImage(index) {
    this.selectedImageIndex = index;
    this.selectedImage = null;
  }

  $reqPostPredict(postData) {
    return agent.Deepdetect.postPredict(this.settings.deepdetect, postData);
  }

  @action
  initPredict(serviceName) {
    if (this.imgList.length === 0) return null;

    const image = this.imgList[this.selectedImageIndex];

    if (typeof image === "undefined") return null;

    this.isRequesting = true;

    image.json = null;

    image.postData = {
      service: serviceName,
      parameters: {
        output: {
          confidence_threshold: this.confidence
        }
      },
      data: [image.url]
    };

    if (this.settings.display.boundingBox) {
      image.postData.parameters.output.bbox = true;
    }

    if (this.settings.request.best) {
      image.postData.parameters.output.best = parseInt(
        this.settings.request.best,
        10
      );
    }

    if (this.settings.request.ctc) {
      image.postData.parameters.output.ctc = true;
    }

    if (this.settings.request.blank_label) {
      image.postData.parameters.output.blank_label = parseInt(
        this.settings.request.blank_label,
        10
      );
    }

    if (this.settings.display.segmentation) {
      image.postData.parameters.input = { segmentation: true };
      image.postData.parameters.mllib = { gpu: true };
      image.postData.parameters.output = {};
    }

    if (this.settings.request.objSearch || this.settings.request.imgSearch) {
      image.postData.parameters.output.search = true;
    }

    if (this.settings.request.objSearch) {
      image.postData.parameters.output.rois = "rois";
    }

    this.curlParams = image.postData;
  }

  @action
  async predict(serviceName) {
    if (this.imgList.length === 0) return null;

    const image = this.imgList[this.selectedImageIndex];

    if (typeof image === "undefined") return null;

    image.json = await this.$reqPostPredict(image.postData);

    if (typeof image.json.body === "undefined") {
      image.error = true;
    } else {
      image.boxes = image.json.body.predictions[0].classes.map(
        predict => predict.bbox
      );

      if (
        (this.settings.request.objSearch || this.settings.request.imgSearch) &&
        typeof image.json.body.predictions[0].rois !== "undefined"
      ) {
        image.boxes = image.json.body.predictions[0].rois.map(
          predict => predict.bbox
        );
      }

      image.pixelSegmentation = typeof image.json.body.predictions[0].vals
        ? []
        : image.json.body.predictions[0].vals;
    }

    this.selectedImage = image;
    this.isRequesting = false;
  }

  @action
  setThreshold(thresholdValue) {
    this.confidence = thresholdValue;
  }

  @action
  addImageFromUrl(url) {
    this.imgList.push({
      url: url,
      json: null,
      boxes: null
    });
    this.setSelectedImage(this.imgList.length - 1);
  }
}

export default new imaginateStore();
