import { observable, computed, action, runInAction } from "mobx";
import agent from "../../agent";

export default class Repository {
  @observable path;
  @observable files;
  @observable store;

  @observable jsonConfig = null;
  @observable jsonMetrics = null;
  @observable bestModel = null;

  @observable metricsDate = null;

  @observable files = [];

  constructor(path, files, store) {
    this.path = path;
    this.files = files;
    this.store = store;

    this._load();
  }

  @computed
  get tags() {
    return this.path.split("/").filter(p => p.length > 0);
  }

  @computed
  get trainingTags() {
    return this.path.split("/").filter(p => {
      return (
        p.length > 0 && p !== "models" && p !== "training" && p !== this.name
      );
    });
  }

  @computed
  get name() {
    return this.path
      .split("/")
      .filter(p => p.length > 0)
      .pop();
  }

  @computed
  get location() {
    return this.store.systemPath + this.path;
  }

  @computed
  get downloadableFiles() {
    const configJson = this.files.filter(f => f === "config.json");
    const protoTxtFiles = this.files.filter(f => f.includes("prototxt"));
    const vocabDatFile = this.files.filter(f => f === "vocab.dat");
    const caffemodelFile = this.files
      .filter(f => f.includes("caffemodel"))
      .sort((a, b) => {
        return parseInt(b.match(/\d+/), 10) - parseInt(a.match(/\d+/), 10);
      })
      .slice(0, 1);

    return configJson
      .concat(protoTxtFiles)
      .concat(vocabDatFile)
      .concat(caffemodelFile)
      .filter(f => f.indexOf("~") === -1);
  }

  _load() {
    this._loadJsonConfig();
    this._loadJsonMetrics();
    this._loadBestModel();
  }

  @action.bound
  async _loadJsonConfig() {
    try {
      this.jsonConfig = await this.$reqJsonConfig();
      // TODO : remove this line when config.json editable
      this.jsonConfig.parameters.mllib.gpuid = 0;

      // delete this parameter from server config
      // it'd create an issue when creating a new service
      // from PredictHome 'Add Service' button
      //
      // it's generated when creating a new Service with
      // the Publish button from Archived Training Jobs
      this.jsonConfig.parameters.mllib.from_repository = null;
    } catch (e) {}
  }

  @action.bound
  async _loadJsonMetrics() {
    try {
      const meta = await this.$reqJsonMetrics();
      this.jsonMetrics = meta.content;
      this.metricsDate = meta.header["last-modified"];
    } catch (e) {}
  }

  @action
  async _loadBestModel() {
    try {
      let bestModel = {};
      const bestModelTxt = await this.$reqBestModel();

      // Transform current best_model.txt to json format
      if (bestModelTxt.length > 0) {
        bestModelTxt
          .split("\n")
          .filter(a => a.length > 0)
          .map(a => a.split(":"))
          .forEach(content => {
            bestModel[content[0]] = content[1];
          });
      }

      runInAction(() => {
        this.bestModel = bestModel;
      });
    } catch (e) {
      //console.log(e);
    }
  }

  $reqJsonMetrics() {
    if (!this.files.includes("metrics.json")) return null;
    return agent.Webserver.getFileMeta(`${this.path}metrics.json`);
  }

  $reqBestModel() {
    if (!this.files.includes("best_model.txt")) return null;
    return agent.Webserver.getFile(`${this.path}best_model.txt`);
  }

  $reqJsonConfig() {
    if (!this.files.includes("config.json")) return null;
    return agent.Webserver.getFile(`${this.path}config.json`);
  }
}
