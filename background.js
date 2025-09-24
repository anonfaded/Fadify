const api = typeof browser !== "undefined" ? browser : chrome;

api.runtime.onInstalled.addListener(() => {
  console.log("Fadify (MV2) installed and running");
});
