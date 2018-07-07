Steps to run project:
1. npm install

Need 4 terminals:
1. Run testrpc
   truffle develop
2. Run Ethereum-Bridge
   node bridge -a 9 -H 127.0.0.1 -p 9545 --dev
   (OAR = from the above goes into the contract - should not be different ideally !!!)

3. Compile and install the contract
   truffle compile;truffle migrate --develop --reset

4. Run webpack and connect to http://localhost:3000  (if running in chrome, disable metamask)
   npm run start

