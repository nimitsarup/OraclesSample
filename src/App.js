import React, { Component } from 'react'
import OracleContract from '../build/contracts/OraclizeTest.json'
import getWeb3 from './utils/getWeb3'
import { Button, Segment, Card, Label, Icon } from "semantic-ui-react";

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

var theContractInstance;
var allAccounts;

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {  
      web3: null, 
      ETHUSD: 0,
      Weather: '', 
      ExchRate: '',
      loadingETH: false, 
      loadingWeather: false,
      loadingExchRate: false  
    };
  }

  componentWillMount() {
    getWeb3
    .then(results => {
      this.setState({ web3: results.web3 });

      // Instantiate contract once web3 provided.
      this.instantiateContract();
    })
    .catch(() => {
      console.log('Error finding web3.')
    });
  }

  instantiateContract() {

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

  addEventListeners = (instance) => {
    var LogCreated = instance.LogUpdate({},{fromBlock: 0, toBlock: 'latest'});
    var LogInfo = instance.LogInfo({},{fromBlock: 0, toBlock: 'latest'});
    
    var LogPriceUpdate = instance.LogPriceUpdate({},{fromBlock: 0, toBlock: 'latest'});
    var LogWeatherUpdate = instance.LogWeatherUpdate({},{fromBlock: 0, toBlock: 'latest'});
    var LogExchRateUpdate = instance.LogExchRateUpdate({},{fromBlock: 0, toBlock: 'latest'});

    let currComp = this;

    LogPriceUpdate.watch(function(err, result){
      if(!err){
        console.log("ETHUSD ---> " + result.args.price);        
      }else{
        console.log("ETHUSD (Error)---> " + err);
      }

      currComp.setState({ ETHUSD: result.args.price, loadingETH: false });
    });

    LogExchRateUpdate.watch(function(err, result){
      if(!err){
        console.log("EXCHRATE ---> " + result.args.price);        
      }else{
        console.log("EXCHRATE (Error)---> " + err);
      }

      currComp.setState({ ExchRate: result.args.price, loadingExchRate: false });
    });

    LogWeatherUpdate.watch(function(err, result){
      if(!err){
        console.log("Weather ---> " + JSON.stringify(result.args.price));        
      }else{
        console.log("Weather (Error)---> " + err);
      }

      currComp.setState({ Weather: JSON.parse(result.args.price), loadingWeather: false });
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
    this.setState({loadingETH: true});
    theContractInstance.updateETH({ from: allAccounts[0], gas:6721975, value: 1000 });
  }

  getWeather = () => {
    this.setState({loadingWeather: true});
    theContractInstance.updateWeather({ from: allAccounts[0], gas:6721975, value: 1000 });
  }

  getExchRate = () => {
    this.setState({loadingExchRate: true});
    theContractInstance.updateExchRate({ from: allAccounts[0], gas:6721975, value: 1000 });
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Ducatur Oracles TestCode</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">

            <Segment>
              <Button content="Get Price" 
                      icon="ethereum" 
                      primary='true'
                      floated='right' 
                      attached='bottom' 
                      loading={this.state.loadingETH}
                      onClick={this.getETHUSD}/>
              <Card>
                <Card.Content>
                  <Card.Header>ETH-USD Spot Price</Card.Header>
                    <Card.Description>
                      <Label as='a' size='big' color='red'>
                        <Icon name='ethereum' />$ {this.state.ETHUSD}
                      </Label>
                  </Card.Description>
                </Card.Content>
            </Card>
            </Segment>

            <Segment>
              <Button content="Get London Weather" 
                      icon="rain" 
                      primary='true'
                      floated='right' 
                      attached='bottom' 
                      loading={this.state.loadingWeather}
                      onClick={this.getWeather}/>
              <Card>
                <Card.Content>
                  <Card.Header>London Weather Today</Card.Header>
                    <Card.Description>
                      <Label as='a' size='big' color='red'>
                        <Icon name='umbrella' />{this.state.Weather.temp} K, {this.state.Weather.pressure} mb
                      </Label>
                  </Card.Description>
                </Card.Content>
            </Card>
            </Segment>

            <Segment>
              <Button content="Get Rate" 
                      icon="exchange" 
                      primary='true'
                      floated='right' 
                      attached='bottom' 
                      loading={this.state.loadingExchRate}
                      onClick={this.getExchRate}/>
              <Card>
                <Card.Content>
                  <Card.Header>GBP-EUR exchange rate</Card.Header>
                    <Card.Description>
                      <Label as='a' size='big' color='red'>
                        <Icon name='exchange' />{this.state.ExchRate}
                      </Label>
                  </Card.Description>
                </Card.Content>
            </Card>
            </Segment>
            
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
