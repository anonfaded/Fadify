export default class Logger {
  static log(message, ...args) {
    console.log("[Fadify]", message, ...args);
  }
}
