import superagentPromise from "superagent-promise";
import _superagent from "superagent";
import noCache from "superagent-no-cache";

import DD from "deepdetect-js";

const DD_TIMEOUT = 15000;
const superagent = superagentPromise(_superagent, global.Promise);

const handleErrors = err => {
  if (err && err.response && err.response.status === 401) {
    // console.log(err);
  }
  return err;
};

const responseBody = res => res.body;

/* ====
 * json config
 * ====
 */

const Config = {
  get: (path = "config.json") =>
    superagent
      .get(path)
      .use(noCache)
      .withCredentials()
      .end(handleErrors)
      .then(responseBody)
};

/* ====
 * json build info
 * ====
 */

const BuildInfo = {
  get: (path = "buildInfo.json") =>
    superagent
      .get(path)
      .withCredentials()
      .end(handleErrors)
      .then(responseBody)
};

/* ====
 * gpustats
 * ====
 */

const GpuInfo = {
  get: gpuStatServerUrl =>
    superagent
      .get(gpuStatServerUrl)
      .withCredentials()
      .end(handleErrors)
      .then(responseBody)
      .catch(() => {})
};

/* ====
 * deepdetect
 * ====
 */

const Deepdetect = {
  info: async settings => {
    let response = null;
    settings.fetchTimeout = 5000;
    const dd = new DD(settings);
    try {
      response = await dd.info();
    } catch (err) {
      throw err;
    }
    return response;
  },
  infoStatus: async settings => {
    settings.fetchTimeout = 5000;
    const dd = new DD(settings);
    try {
      return await dd.info({ status: true });
    } catch (err) {
      return err;
    }
  },
  getService: async (settings, name) => {
    settings.fetchTimeout = DD_TIMEOUT;
    const dd = new DD(settings);
    try {
      return await dd.getService(name);
    } catch (err) {
      return err;
    }
  },
  putService: async (settings, name, data) => {
    let response = null;
    settings.fetchTimeout = DD_TIMEOUT;
    const dd = new DD(settings);
    try {
      response = await dd.putService(name, data);
    } catch (err) {
      throw err;
    }
    return response;
  },
  deleteService: async (settings, name) => {
    settings.fetchTimeout = DD_TIMEOUT;
    const dd = new DD(settings);
    try {
      return await dd.deleteService(name);
    } catch (err) {
      return err;
    }
  },
  postPredict: async (settings, postData) => {
    settings.fetchTimeout = DD_TIMEOUT;
    const dd = new DD(settings);
    try {
      return await dd.postPredict(postData);
    } catch (err) {
      return err;
    }
  },
  getTrain: async (
    settings,
    serviceName,
    job = 1,
    timeout = 0,
    history = false,
    maxHistPoints = null
  ) => {
    settings.fetchTimeout = DD_TIMEOUT;
    const dd = new DD(settings);
    try {
      return await dd.getTrain(
        serviceName,
        job,
        timeout,
        history,
        maxHistPoints
      );
    } catch (err) {
      return err;
    }
  },
  stopTraining: async (settings, serviceName) => {
    settings.fetchTimeout = DD_TIMEOUT;
    const dd = new DD(settings);
    try {
      return await dd.deleteTrain(serviceName);
    } catch (err) {
      return err;
    }
  }
};

const autoIndex = res => {
  const rowsReg = /<a href="(.+)">(.+)<\/a>.+(\d{2}-[a-zA-Z]{3}-\d{4} \d{2}:\d{2})\s+(\d{0,5})/g;
  const dirReg = /href="(.*)\/"/;
  const parentReg = /href="..\/">..\//;

  let files = [],
    folders = [];

  res.text.replace(rowsReg, function(row, href, name, date, size) {
    var obj = { href: href, name: name, date: date, size: size };

    obj.name = obj.name.replace(/\/$/, "");

    if (obj.date) {
      obj.modified = new Date(obj.date);
      delete obj.date;
    }
    if (!dirReg.test(row)) {
      obj.name = obj.href;
      files.push(obj);
      return;
    }

    delete obj.size;
    if (
      !parentReg.test(row) &&
      obj.name !== "train.lmdb" &&
      obj.name !== "test.lmdb" &&
      obj.name !== "names.bin"
    ) {
      folders.push(obj);
      return;
    }
  });

  return {
    folders: folders,
    files: files.map(f => f.name)
  };
};

const Webserver = {
  listFolders: path =>
    superagent
      .get(path)
      .withCredentials()
      .end(handleErrors)
      .then(autoIndex),
  listFiles: path =>
    superagent
      .get(path)
      .withCredentials()
      .end(handleErrors)
      .then(res => {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(res.text, "text/html");
        const aElements = htmlDoc.getElementsByTagName("a");

        let files = [];

        for (var i = 0; i < aElements.length; i++) {
          const repo = aElements[i].attributes["href"].value;

          // Check if files and if not parent folder
          if (repo !== "../") files.push(repo);
        }

        return files;
      }),
  getFile: path =>
    superagent
      .get(path)
      .use(noCache)
      .withCredentials()
      .end(handleErrors)
      .then(res => {
        let result = null;
        if (res && res.text) {
          try {
            result = JSON.parse(res.text);
          } catch (e) {
            result = res.text;
          }
        }
        return result;
      }),
  getFileMeta: path =>
    superagent
      .get(path)
      .use(noCache)
      .withCredentials()
      .end(handleErrors)
      .then(res => {
        let content = null;
        if (res && res.text) {
          try {
            content = JSON.parse(res.text);
          } catch (e) {
            content = res.text;
          }
        }
        return {
          content: content,
          header: res.header
        };
      })
};

export default {
  Config,
  BuildInfo,
  GpuInfo,
  Deepdetect,
  Webserver
};
