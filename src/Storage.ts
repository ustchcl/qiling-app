import electron from "electron"
import path from "path"
import fs from "fs"

function parseDataFile(filePath: any, defaults: any) {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    const str = fs.readFileSync(filePath).toString()
    return JSON.parse(str);
  } catch (error) {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults;
  }
}

type Options = {
  configName: string;
  defaults?: any;
}

export default class Storage {
  public path: string;
  public data: any;
  constructor(opts: Options) {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
    this.path = path.join(userDataPath, opts.configName + '.json');
    this.data = parseDataFile(this.path, opts.defaults);
  }


  get(key: string) {
    return this.data[key];
  }

  set(key: string, val: any) {
    this.data[key] = val;
    return this
  }

  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

}