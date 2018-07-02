import React, { Component } from 'react'
import OracleContract from '../build/contracts/OraclizeTest.json'
import getWeb3 from './utils/getWeb3'
import { Button, Segment } from "semantic-ui-react";

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

var theContractInstance;
var allAccounts;

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ETHUSD: 0,
      web3: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract');
    const simpleStorage = contract(OracleContract);
    simpleStorage.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {

        simpleStorageInstance = instance;
        theContractInstance = simpleStorageInstance;
        allAccounts = accounts;

        this.addEventListeners(simpleStorageInstance);
      })
    });

  }

  addEventListeners(instance) {
    var LogCreated = instance.LogUpdate({},{fromBlock: 0, toBlock: 'latest'});
    var LogPriceUpdate = instance.LogPriceUpdate({},{fromBlock: 0, toBlock: 'latest'});
    var LogInfo = instance.LogInfo({},{fromBlock: 0, toBlock: 'latest'});

    //
    LogPriceUpdate.watch(function(err, result){
      if(!err){
        console.log("Nimit ---> " + result.args.price);
      }else{
        console.log("Nimit --ERR--> " + err);
      }
    });

    // Emitted when the Contract's constructor is run
    LogCreated.watch(function(err, result){
      if(!err){
        console.log('Contract created!');
        console.log('Owner: ' , result.args._owner);
        console.log('-----------------------------------');
      }else{
        console.log(err);
      }
    });

    // Emitted when a text message needs to be logged to the front-end from the Contract
    LogInfo.watch(function(err, result){
      if(!err){
        console.info(result.args);
      }else{
        console.error(err);
      }
    });
  }

  getETHUSD = () => {
    //theContractInstance.getBalance.call({from: allAccounts[0]}).then((retVal) => console.log(retVal.toNumber()));
    theContractInstance.update.call({ from: allAccounts[0], gas:6721975, value: 500000000000000000 })
    .then(data => console.log(data));
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Ducatur Oracles TestCode</a>
        </nav>

        <main className="container">
        <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.1/semantic.min.css"/>
          <div className="pure-g">
            <div className="pure-u-1-1">
            <Segment>
              <Button content="ETH USD" icon="cloud download" primary="true" floated='right' onClick={this.getETHUSD}/>
              <h2>Get Crypto Price</h2> 
            </Segment>
            
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
