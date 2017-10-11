/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

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

          } else if (method == "eth_sendTransaction") {
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
          let id = payload.id;
          let result = payload.result;

          console.log(payload);
          window.masonCallbacks[id](null, {
            "id":id,
            "jsonrpc": "2.0",
            "result": result
          });
        }

        document.addEventListener("message", function(event) {
            console.log("Received post message", event);

            eval(event.data);
        }, false);

        window.masonCallbacks = {};
        let infuraProvider = new Web3.providers.HttpProvider("https://ropsten.infura.io/QwECdl7hf7Pq48xrC9PI");
        var web3 = new Web3(new MasonProvider);
        web3.eth.defaultAccount = '0x62B0CEC940868DD31f5FC514DFc139155F729F0e'
    `;

    return jsCode;
  }

  // onMessage(ctx) {
  //   return function(event){
  //       console.log(event);
  //
  //     function sendToWebview(payload) {
  //       console.log(payload);
  //       ctx.refs.webview.postMessage('masonCallbackHub(' + JSON.stringify(payload) + ')');
  //     }
  //
  //     console.log(event);
  //     let payload = event.body.data;
  //     let method = payload ? payload.method : null;
  //     let infuraProvider = new Web3.providers.HttpProvider("https://ropsten.infura.io/QwECdl7hf7Pq48xrC9PI");
  //     let web3 = new Web3(infuraProvider);
  //     const eth = web3.eth;
  //     const sign = Signer.sign;
  //
  //     const address = '0x62B0CEC940868DD31f5FC514DFc139155F729F0e';
  //     const privateKey = '0x4e5f4d51720f8a7629f76483efdd548025a861c4d2d0f614c183fe69d4a77ed3';
  //
  //     var nonce;
  //     if (method == "eth_sendTransaction") {
  //       eth.getTransactionCount(address,(err, res) => {
  //         var rawTx, tag;
  //         [rawTx, tag] = payload.params;
  //
  //         nonce = res;
  //         completeTx = {
  //           to: rawTx.to,
  //           value: rawTx.value,
  //           gas: new BN('806458'),
  //           data: rawTx.data,
  //           // when sending a raw transactions it's necessary to set the gas price, currently 0.00000002 ETH
  //           gasPrice: new BN('10000000000'),
  //           nonce: nonce,
  //         };
  //
  //         console.log('complete tx', completeTx);
  //         console.log('signedtx', sign(completeTx, privateKey));
  //         eth.sendRawTransaction(sign(completeTx, privateKey), (error, txHash) => {
  //           console.log('Transaction Hash', txHash);
  //           console.log('tx error', error);
  //           sendToWebview({id: payload.id, result: txHash});
  //         });
  //       });
  //     }

        // var rawTx, tag, signedTx;
        // [rawTx, tag] = payload.params;
        // rawTx.gas = 4476768;
        // rawTx.gasPrice = 1;
        // rawTx.value = 0;
        //
        // signedTx = Signer.sign(rawTx, '');
        // payload.params = [signedTx, tag];
        //
        // console.log(payload);
        // infuraProvider.sendAsync(payload, (err, res) => {
        //   console.log(err);
        //   sendToWebview(res);
        // });
      // }
    // }
  // }

  render() {
    return (
      <WebView
        ref="webview"
        source={{uri: 'https://fiddy.io'}}
        injectedJavaScript={this.web3override()}
        style={{marginTop: 20}}
        // onMessage={this.onMessage(this)}
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
