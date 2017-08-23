/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

var httpBridge = require('react-native-http-bridge');
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  WebView,
} from 'react-native';

export default class ethereumwrapper extends Component {
  web3override() {
    let jsCode = `
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
    `;
    return jsCode;
  }

  onMessage( event ) {
    console.log("On Message", event.nativeEvent.data );
  }

  // componentWillMount(){
  //
  //   // initalize the server (now accessible via localhost:1234)
  //   httpBridge.start(1234, "test", function(request) {
  //     console.log(request);
  //   });
  //
  // }

  render() {
    console.log("hello");
    return (
      <WebView
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
