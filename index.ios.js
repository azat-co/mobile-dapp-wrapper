/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

var httpBridge = require('react-native-http-bridge');
import React, { Component } from 'react';
import WKWebView from 'react-native-wkwebview-reborn';
import web3 from  './lib/web3.min.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default class ethereumwrapper extends Component {
  web3override() {
    let jsCode = `
        var MasonProvider = function(){};
        MasonProvider.prototype.prepareRequest = function (async) {
          return infuraProvider.prepareRequest(async);
        };

        MasonProvider.prototype.send = function (payload) {
          console.log(payload)

          var method = payload.method;
          if (method == "eth_accounts") {
            res = payload
            delete res.params
            res.result = ['0x62B0CEC940868DD31f5FC514DFc139155F729F0e']

            console.log(res);
            return res
          } else {
            return infuraProvider.send(payload);
          }
        };

        MasonProvider.prototype.sendAsync = function (payload, callback) {
          console.log(payload);
          var method = payload.method;

          if (method == "eth_accounts") {
            res = payload
            delete res.params
            res.result = ['0x62B0CEC940868DD31f5FC514DFc139155F729F0e']

            console.log(res);
            callback(null, res)

          } else if (method == "eth_call) {
            window.masonCallbacks[payload.id] = callback;
            window.webkit.messageHandlers.reactNative.postMessage({data: payload});

          } else {
            infuraProvider.sendAsync(payload, (error, response) => callback(error, response));
          }
        };

        MasonProvider.prototype.isConnected = function () {
          return true
        };

        window.masonCallbackHub = function(payload) {
          let id = payload.id
          let result = payload.result

          console.log(payload);
          window.masonCallbacks[id](null, result);
        }

        window.masonCallbacks = {}
        let infuraProvider = new Web3.providers.HttpProvider("https://ropsten.infura.io/QwECdl7hf7Pq48xrC9PI");
        var web3 = new Web3(new MasonProvider);
        web3.eth.defaultAccount = '0x62B0CEC940868DD31f5FC514DFc139155F729F0e'
    `;
    return jsCode;
  }

  onMessage( event ) {
    let payload = event.body.data;
    let method = payload.method;
    let infuraProvider = new Web3.providers.HttpProvider("https://ropsten.infura.io/QwECdl7hf7Pq48xrC9PI");

    // if (method == "eth_accounts") {
    //   res = payload
    //   delete res.params
    //   res.result = ['0x62B0CEC940868DD31f5FC514DFc139155F729F0e']
    // }

    if (method == "eth_call") {

      infuraProvider.sendAsync(payload, (e) => console.log(e));
      this.refs.webview.evaluateJavaScript('receivedMessageFromReactNative("Hello from the other side.")');
    }
  }

  render() {
    console.log("hello");
    return (
      <WKWebView
        ref="webview"
        source={{uri: 'http://127.0.0.1:8080'}}
        injectedJavaScript={this.web3override()}
        style={{marginTop: 20}}
        onMessage={this.onMessage}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('ethereumwrapper', () => ethereumwrapper);
