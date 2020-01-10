import { observable, computed, action, runInAction } from "mobx";
import agent from "../../agent";

export default class Repository {
  @observable path;
  @observable files;
  @observable store;

  @observable fetchError = null;

  @observable jsonConfig = null;
  @observable jsonMetrics = null;
  @observable bestModel = null;

  @observable metricsDate = null;

  @observable files = [];

  constructor(path, files, store, fetchError = null) {
    this.isRepository = true;
    this.path = path;
    this.files = files;
    this.store = store;
    this.fetchError = fetchError;

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
    const caffemodelFile = this.files
      .filter(f => f.includes("caffemodel"))
      .sort((a, b) => {
        return parseInt(b.match(/\d+/), 10) - parseInt(a.match(/\d+/), 10);
      })
      .slice(0, 1);

    const variousFiles = this.files.filter(f => {
      return (
        ["config.json", "vocab.dat", "corresp.txt"].includes(f) ||
        f.includes("prototxt")
      );
    });

    return caffemodelFile
      .concat(variousFiles)
      .filter(f => f.indexOf("~") === -1);
  }

  @computed
  get measure_hist() {
    if (
      !this.jsonMetrics ||
      !this.jsonMetrics.body ||
      !this.jsonMetrics.body.measure_hist
    )
      return null;

    return this.jsonMetrics.body.measure_hist;
  }

  _load() {
    this._loadJsonConfig();
    this._loadJsonMetrics();
    this._loadBestModel();

    // Set metrics date if it hasn't already been done
    if (
      !this.files.some(f =>
        ["config.json", "best_model.txt", "metrics.json"].includes(f)
      )
    ) {
      this._setMetricsDate();
    }
  }

  @action.bound
  async _setMetricsDate() {
    // Do not try to fetch large files
    const filenames = this.files.filter(f => {
      return (
        (f.includes("json") || f.includes("txt")) &&
        !(
          f.includes("caffemodel") ||
          f.includes("log") ||
          f.includes("solverstate")
        )
      );
    });

    if (filenames.length > 0) {
      try {
        const meta = await agent.Webserver.getFileMeta(
          `${this.path}${filenames[0]}`
        );
        this.metricsDate = meta.header["last-modified"];
      } catch (e) {}
    }
  }

  @action.bound
  async _loadJsonConfig() {
    try {
      const meta = await this.$reqJsonConfig();

      this.metricsDate = meta.header["last-modified"];
      this.jsonConfig = meta.content;

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
      const meta = await this.$reqBestModel();
      this.metricsDate = meta.header["last-modified"];
      const bestModelTxt = meta.content;

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
    return agent.Webserver.getFileMeta(`${this.path}best_model.txt`);
  }

  $reqJsonConfig() {
    if (!this.files.includes("config.json")) return null;
    return agent.Webserver.getFileMeta(`${this.path}config.json`);
  }
}
