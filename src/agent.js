import superagentPromise from "superagent-promise";
import _superagent from "superagent";
import noCache from "superagent-no-cache";

import DD from "deepdetect-js";

const superagent = superagentPromise(_superagent, global.Promise);

const URL_JSON_PREFIX = "/json";

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
 get: (path = "/config.json") =>
    superagent
      .get(path)
      .use(noCache)
      .withCredentials()
      .end(handleErrors)
      .then(responseBody)
};

/* ====
 * build info
 * ====
 */

const BuildInfo = {
  getVersion: (path = "/version") =>
    superagent
      .get(path)
      .withCredentials()
      .end(handleErrors)
      .then(res => {
        let version = null;
        const versionRegex = /^DD_PLATFORM_UI_TAG=(.*)$/m;
        if (
          res &&
            res.text &&
            versionRegex.test(res.text)
        ) {
          const regResult = versionRegex.exec(res.text);
          if(
            regResult.index > 0 &&
              regResult[1].length > 0
          ) {
            version = regResult[1]
          }
        }
        return version;
      }),
  getDockerTags: (path = "/docker-tags") =>
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
    const dd = new DD(settings);
    try {
      response = await dd.info();
    } catch (err) {
      throw err;
    }
    return response;
  },
  infoStatus: async settings => {
    const dd = new DD(settings);
    try {
      return await dd.info({ status: true });
    } catch (err) {
      return err;
    }
  },
  getService: async (settings, name) => {
    const dd = new DD(settings);
    try {
      return await dd.getService(name);
    } catch (err) {
      return err;
    }
  },
  putService: async (settings, name, data) => {
    let response = null;
    const dd = new DD(settings);
    try {
      response = await dd.putService(name, data);
    } catch (err) {
      throw err;
    }
    return response;
  },
  deleteService: async (settings, name) => {
    const dd = new DD(settings);
    try {
      return await dd.deleteService(name);
    } catch (err) {
      return err;
    }
  },
  postPredict: async (settings, postData) => {
    const dd = new DD(settings);
    try {
      return await dd.postPredict(postData);
    } catch (err) {
      return err;
    }
  },
  putChain: async (settings, endpoint, data) => {
    const dd = new DD(settings);
    try {
      return await dd.putChain(endpoint, data);
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
    const dd = new DD(settings);
    try {
      return await dd.deleteTrain(serviceName);
    } catch (err) {
      return err;
    }
  }
};

const autoIndex = res => {
  let files = res.body
    .filter(f => f.type === "file")
    .map(f => {
      return decodeURIComponent(f.name);
    });

  let folders = res.body
    .filter(f => f.type === "directory")
    .map(f => {
      return {
        href: f.name,
        name: decodeURIComponent(f.name),
        modified: new Date(f.mtime)
      };
    });

  return {
    folders: folders,
    files: files
  };
};

const Webserver = {
  listFolders: path =>
    superagent
      .get(URL_JSON_PREFIX + path)
      .withCredentials()
      .end(handleErrors)
      .then(autoIndex),
  listFiles: path =>
    superagent
      .get(URL_JSON_PREFIX + path)
      .withCredentials()
      .end(handleErrors)
      .then(res => {
        if (!res.body) return [];

        return res.body
          .filter(f => f.type === "file")
          .map(f => decodeURIComponent(f.name));
      }),
  deletePath: async (path, loginAccess = {
    url: "/filebrowser/api/login",
    username: "",
    password: ""
  }) => {

    let token = null;

    if (
      loginAccess &&
        typeof loginAccess.url      !== "undefined" &&
        typeof loginAccess.username !== "undefined" &&
        typeof loginAccess.password !== "undefined"
    )  {

      const res = await superagent
            .post(loginAccess.url)
            .send({username: loginAccess.username})
            .send({password: loginAccess.password})

      if (res.status === 200) {
        token = res.text;
      }

    }

    superagent
      .del(path)
      .set('X-Auth', token)
      .withCredentials()
      .catch(handleErrors)
      .then(res => {
        console.log(res);
      })
  },
  getFile: path =>
    superagent
      .get(URL_JSON_PREFIX + path)
      .buffer(true)
      .parse(({ text }) => {

        // JSON might be malformed and might contain NaN values
        // in measure_hist result arrays.
        //
        // This method overrides superagent json parser to avoid
        // critical parsing error.

        if (
          new RegExp(".*json$", "gi").test(path)
        ) {
          return JSON.parse(text.replace(/NaN/g, "0"))
        } else {
          return text;
        }

      })
      .use(noCache)
      .withCredentials()
      .end(handleErrors)
      .then(res => {
        let result = null;
        if (res && res.text) {
          try {
            result = JSON.parse(res.text);
          } catch (e) {
            try {
              // Fix: try to replace NaN in json
              result = JSON.parse(res.text.replace(/NaN/g, "0"));
            } catch (e) {
              result = res.text;
            }
          }
        }
        return result;
      }),
  getFileMeta: path =>
    superagent
      .get(URL_JSON_PREFIX + path)
      .buffer(true)
      .parse(({ text }) => {

        // JSON might be malformed and might contain NaN values
        // in measure_hist result arrays.
        //
        // This method overrides superagent json parser to avoid
        // critical parsing error.

        if(
          new RegExp(".*json$", "gi").test(path)
        ) {
          return JSON.parse(text.replace(/NaN/g, "0"))
        } else {
          return text;
        }

      })
      .use(noCache)
      .withCredentials()
      .end(handleErrors)
      .then(res => {
        let content = null;
        if (res && res.text) {
          try {
            content = JSON.parse(res.text);
          } catch (e) {
            try {
              // Fix: try to replace NaN in json
              content = JSON.parse(res.text.replace(/NaN/g, "0"));
            } catch (e) {
              content = res.text;
            }
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
