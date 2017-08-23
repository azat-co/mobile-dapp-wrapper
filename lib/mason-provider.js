var MasonProvider = function(){};
MasonProvider.prototype.prepareRequest = function (async) {
  window.postMessage("prepareRequest:" + async.to_json);
  return null;
};

MasonProvider.prototype.send = function (payload) {
  window.postMessage("send:" + payload.to_json);
  return "";
};

MasonProvider.prototype.sendAsync = function (payload, callback) {
  console.log(typeof payload);
  window.postMessage(JSON.stringify(payload));
  // window.postMessage("sendAsync:" + payload.to_json);
};

MasonProvider.prototype.isConnected = function () {
  return true
};

var web3 = new Web3(new MasonProvider);
