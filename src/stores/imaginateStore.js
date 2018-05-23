import { observable, action, computed } from 'mobx';
import agent from '../agent';

export class imaginateStore {

  @observable isLoaded = false;
  @observable settings = {};

  @observable imgList = [];
  @observable selectedImageIndex = -1;

  @computed get selectedImage() {
    return this.imgList[this.selectedImageIndex];
  }

  @action setup(configStore) {
    this.settings = configStore.imaginate;
    this.settings.deepdetect = configStore.deepdetect;

    // Init image list if available inside config.json
    if (this.settings.initImages &&
        this.settings.initImages.length > 0) {

      this.imgList = this.settings.initImages.map( img => {
        return {
          url: img,
          boxes: [[10, 10, 10, 10]],
          json: null
        }
      })

    }

    // If existing image, init the first selected one
    if(this.imgList.length > 0)
      this.selectedImageIndex = 0;
  }

  @action setSelectedImage(index) {
    this.selectedImageIndex = index;
  }

  $reqPostPredict(postData) {
    return agent.Deepdetect.postPredict(this.settings.deepdetect, postData);
  }

  @action async predictSelectedImage(serviceName) {
    const image = this.imgList[this.selectedImageIndex];
    this.selectedImage.postData = {
      service: serviceName,
      parameters: {
        output: {
          bbox: true,
          confidence_threshold: 0.1,
        }
      },
      data: [ image.url ]
    };
    image.json = await this.$reqPostPredict(image.postData);
    image.boxes = image.json.body.predictions[0].classes.map( predict => predict.bbox );
  }

}

export default new imaginateStore();
