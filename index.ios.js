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
  AsyncStorage,
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
    welcomeVisible: false,
    transactionModalVisible: false,
    account: "",
    uri: "http://127.0.0.1:8080",
    currentGasUnit: '806458',
    currentGasPrice: '10000000000',
    privateKey: "",
    currentRawTx: "",
    currentTag: "",
    currentPayloadId: "",
  }

  createAccount() {
    let account = Account.generate('ifsdahiodfsihisdfhi;sf;hosdafhiudfsahiusdfa');
    try {
      // AsyncStorage.setItem('@securestore:walletaddress', account.address);
      // AsyncStorage.setItem('@securestore:walletprivateKey', account.privateKey);
      // AsyncStorage.setItem('@securestore:walletpublicKey', account.publicKey);

      AsyncStorage.setItem('@securestore:walletaddress', "0x62B0CEC940868DD31f5FC514DFc139155F729F0e");
      AsyncStorage.setItem('@securestore:walletprivateKey', '0x4e5f4d51720f8a7629f76483efdd548025a861c4d2d0f614c183fe69d4a77ed3');
      this.setState({account: account.address,
                     uri: "http://127.0.0.1:8080"
      });
      console.log("account created: ");
      console.log(this.state.account);
      this.setWelcomeVisible(false);
      this.setState(this.state);
    } catch (error) {
      console.log(error)
      // Error saving data
    }
  }

  resetAccount() {
    try {
      AsyncStorage.removeItem('@securestore:walletaddress');
      AsyncStorage.removeItem('@securestore:walletprivateKey');
      AsyncStorage.removeItem('@securestore:walletpublicKey');
      this.setState({account: ""});
      console.log("account cleared");
    } catch (error) {
      console.log(error)
      // Error saving data
    }
  }

  setWelcomeVisible(visible) {
    this.setState({welcomeVisible: visible});
  }


  setTransactionModalVisible(visible) {
    this.setState({transactionModalVisible: visible});
  }

  web3override(address) {
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
            res.result = ['${address}']

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
            res.result = ['${address}']

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
        web3.eth.defaultAccount = '${address}'
        alert(web3.eth.defaultAccount);
    `;
    return jsCode;
  }

  onMessage(ctx) {
    return function(event){
        console.log(event);

      ctx.setTransactionModalVisible(true);
      console.log(event);
      let payload = event.body.data;
      let method = payload ? payload.method : null;

      var nonce;
      if (method == "eth_sendTransaction") {
        var rawTx, tag;
        [rawTx, tag] = payload.params;

        ctx.setState({currentRawTx: rawTx, currentTag: tag, currentPayloadId: payload.id});
      }
    }
  }

  componentWillMount() {
    try {
      // this.resetAccount();
      // this.createAccount();

      AsyncStorage.getItem('@securestore:walletaddress').then((address) => {
        AsyncStorage.getItem('@securestore:walletprivateKey').then((key) => {
          if (address !== null && key !== null){
            console.log('got result:')
            console.log(address)
            this.setState({account: address, privateKey: key});
            console.log("set account state");
            this.setWelcomeVisible(false);
          } else {
            console.log("account value not found")
          }
        });
      });
    } catch (error) {
      console.log("error retrieving wallet")
      console.log(error)
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

          <Text style={{color: 'white', marginTop: 60}}>Welcome!</Text>
          <Text style={{color: 'white'}}>A new wallet will be generated for you...</Text>

            <Button
              onPress={() => {
                this.createAccount();
              }}
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
              <FormInput
                onChangeText={(amount) => this.setState({currentGasUnit: amount})}
                value={this.state.currentGasUnit}
              />

              <FormLabel>Gas Price</FormLabel>
              <FormInput
                onChangeText={(amount) => this.setState({currentGasPrice: amount})}
                value={this.state.currentGasPrice}
              />

              <Button
                raised
                onPress={() => {
                  this.sendTransaction()}}
                icon={{name: 'send'}}
                title='SUBMIT'
                style={{marginTop: 20}}
                backgroundColor="orange"/>
            </View>

           </View>
          </Modal>

          <WKWebView
            ref={(element) => this.refs.webview = element}
            source={{uri: this.state.uri}}
            injectedJavaScript={this.web3override(this.state.account)}
            onMessage={this.onMessage(this)}
          />
      </View>
    );
  }
  sendTransaction(){
    function sendToWebview(payload) {
      console.log(payload);
      this.refs.webview.evaluateJavaScript('masonCallbackHub(' + JSON.stringify(payload) + ')');
    }

    let infuraProvider = new Web3.providers.HttpProvider("https://ropsten.infura.io/QwECdl7hf7Pq48xrC9PI");
    let web3 = new Web3(infuraProvider);
    const eth = web3.eth;
    const sign = Signer.sign;

    let address = this.state.account;
    let privateKey = this.state.privateKey;

    let rawTx = this.state.currentRawTx;
    let tag = this.state.currentTag;
    let payloadId = this.state.currentPayloadId;

    eth.getTransactionCount(address,(err, res) => {
      nonce = res;
      completeTx = {
        to: rawTx.to,
        value: rawTx.value,
        gas: new BN(this.state.currentGasUnit),
        data: rawTx.data,
        // when sending a raw transactions it's necessary to set the gas price, currently 0.00000002 ETH
        gasPrice: new BN(this.state.currentGasPrice),
        nonce: nonce,
      };

      console.log('complete tx', completeTx);
      console.log('signedtx', sign(completeTx, privateKey));
      eth.sendRawTransaction(sign(completeTx, privateKey), (error, txHash) => {
        console.log('Transaction Hash', txHash);
        console.log('tx error', error);
        sendToWebview({id: payloadId, result: txHash});
      });
    });
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
