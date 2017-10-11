/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import WKWebView from 'react-native-wkwebview-reborn';
import './shim.js';
import Signer from 'ethjs-signer';
import Account from 'ethjs-account';
import web3 from  './lib/web3.min.js';
import BN from 'bignumber.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Image,
  View,
  Modal,
  TouchableHighlight,
} from 'react-native';
import { Header, FormLabel, FormInput, Button } from 'react-native-elements';

export default class ethereumwrapper extends Component {
  state = {
    welcomeVisible: true,
    transactiontransactionModalVisible: false,
    account: Account.generate('ifsdahiodfsihisdfhi;sf;hosdafhiudfsahiusdfa'),
  }

  setWelcomeVisible(visible) {
    this.setState({setWelcomeVisible: visible});
  }


  setTransactionModalVisible(visible) {
    this.setState({transactionModalVisible: visible});
  }

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
            res.result = ['${this.state.account.address}']

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
            res.result = ['${this.state.account.address}']

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

        window.masonCallbacks = {};
        let infuraProvider = new Web3.providers.HttpProvider("https://ropsten.infura.io/QwECdl7hf7Pq48xrC9PI");
        var web3 = new Web3(new MasonProvider);
        web3.eth.defaultAccount = '${this.state.account.address}'
    `;
    return jsCode;
  }

  onMessage(ctx) {
    return function(event){
        console.log(event);

      function sendToWebview(payload) {
        console.log(payload);
        ctx.refs.webview.evaluateJavaScript('masonCallbackHub(' + JSON.stringify(payload) + ')');
      }

      ctx.setTransactionModalVisible(true);
      console.log(event);
      let payload = event.body.data;
      let method = payload ? payload.method : null;
      let infuraProvider = new Web3.providers.HttpProvider("https://ropsten.infura.io/QwECdl7hf7Pq48xrC9PI");
      let web3 = new Web3(infuraProvider);
      const eth = web3.eth;
      const sign = Signer.sign;

      const address = '0x62B0CEC940868DD31f5FC514DFc139155F729F0e';
      const privateKey = '0x4e5f4d51720f8a7629f76483efdd548025a861c4d2d0f614c183fe69d4a77ed3';

      var nonce;
      if (method == "eth_sendTransaction") {
        eth.getTransactionCount(address,(err, res) => {
          var rawTx, tag;
          [rawTx, tag] = payload.params;

          nonce = res;
          completeTx = {
            to: rawTx.to,
            value: rawTx.value,
            gas: new BN('806458'),
            data: rawTx.data,
            // when sending a raw transactions it's necessary to set the gas price, currently 0.00000002 ETH
            gasPrice: new BN('10000000000'),
            nonce: nonce,
          };

          console.log('complete tx', completeTx);
          console.log('signedtx', sign(completeTx, privateKey));
          eth.sendRawTransaction(sign(completeTx, privateKey), (error, txHash) => {
            console.log('Transaction Hash', txHash);
            console.log('tx error', error);
            sendToWebview({id: payload.id, result: txHash});
          });
        });
      }

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
    }
  }

  render() {
    return (
      <View
      style={{flex: 1, backgroundColor: 'orange'}}

      >
        <Modal
            animationType="slide"
            transparent={false}
            style={{flex: 1, margin: 0, backgroundColor: 'orange'}}
            visible={this.state.welcomeVisible}
            onRequestClose={() => {alert("Modal has been closed.")}}
            >
           <View
           backgroundColor="orange"
           >
            <View style={{ flex: 1}}>
              <Header
                backgroundColor="orange"
                centerComponent={{ text: 'Create Account', style: { color: '#fff'
               } }}
              />
            </View>

            <View style={{
              marginTop: 160,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              source={require('./img/fid.png')}
            />
            <Text style={{color: 'white', fontWeight: 'bold'}}>Friend in Debt</Text>

              <Button
                raised
                icon={{name: 'play-arrow'}}
                title='Create Account'
                style={{marginTop: 120, marginBottom: 300}}
                backgroundColor="black"/>
            </View>

           </View>
          </Modal>
        <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.transactionModalVisible}
            onRequestClose={() => {alert("Modal has been closed.")}}
            >
           <View>
            <View>
              <Header
                backgroundColor="orange"
                centerComponent={{ text: 'SEND TRANSACTION', style: { color: '#fff' } }}
                rightComponent={{ icon: 'close', color: '#fff', onPress: () => {
                  this.setTransactionModalVisible(!this.state.transactionModalVisible)}}}
              />
            </View>

            <View style={{marginTop: 60}}>
              <FormLabel>Gas</FormLabel>
              <FormInput/>

              <FormLabel>Gas Price</FormLabel>
              <FormInput/>

              <Button
                raised
                icon={{name: 'send'}}
                title='SUBMIT'
                style={{marginTop: 20}}
                backgroundColor="orange"/>
            </View>

           </View>
          </Modal>

        <WKWebView
          ref="webview"
          source={{uri: 'http://127.0.0.1:8080'}}
          injectedJavaScript={this.web3override()}
          onMessage={this.onMessage(this)}
        />
      </View>
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
