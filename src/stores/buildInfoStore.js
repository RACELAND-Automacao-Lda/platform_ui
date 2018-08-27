import { observable, action } from "mobx";
import agent from "../agent";

export class buildInfoStore {
  @observable isReady = false;

  @observable buildCommitHash = null;
  @observable buildDate = null;

  $req() {
    return agent.BuildInfo.get();
  }

  @action
  loadBuildInfo(callback = () => {}) {
    this.$req().then(
      action(buildInfo => {
        if (buildInfo) {
          this.buildCommitHash = buildInfo.buildCommitHash;
          this.buildDate = buildInfo.buildDate;
          this.isReady = true;
        }
        callback(this);
      })
    );
  }
}

export default new buildInfoStore();
