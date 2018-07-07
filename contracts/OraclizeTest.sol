pragma solidity ^0.4.21;
import "installed_contracts/oraclize-api/contracts/usingOraclize.sol";

contract OraclizeTest is usingOraclize {

    bytes32 private ethQueryId;
    bytes32 private weatherQueryId;
    bytes32 private exchRateQueryId;

    address owner;

    event LogInfo(string description);
    event LogPriceUpdate(string price);
    event LogWeatherUpdate(string price);
    event LogExchRateUpdate(string price);
    event LogUpdate(address indexed _owner, uint indexed _balance);

    // Constructor
    function OraclizeTest()
    payable
    public {
        owner = msg.sender;

        emit LogUpdate(owner, address(this).balance);

        // OAR coming from ethereum-bridge
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);

        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
    }

    // Fallback function
    function()
    public{
        emit LogInfo("FallBack function invoked");
        revert();
    }

    function getBalance()
    public
    returns (uint _balance) {
        return address(this).balance;
    }

    function __callback(bytes32 id, string result, bytes proof)
    public {
        require(msg.sender == oraclize_cbAddress());

        if(ethQueryId == id) {
            emit LogPriceUpdate(result);
        }

        if(weatherQueryId == id) {
            emit LogWeatherUpdate(result);
        }

        if(exchRateQueryId == id) {
            emit LogExchRateUpdate(result);
        }
    }

    function updateETH()
    payable
    public {
        // Check if we have enough remaining funds
        if (oraclize_getPrice("URL") > address(this).balance) {
            emit LogInfo("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            emit LogInfo("Oraclize query was sent, standing by for the answer..");

            // Using XPath to to fetch the right element in the JSON response
            ethQueryId = oraclize_query(20, "URL", "json(https://api.coinbase.com/v2/prices/ETH-USD/spot).data.amount");
        }
    }


    function updateWeather()
    payable
    public {
        // Check if we have enough remaining funds
        if (oraclize_getPrice("URL") > address(this).balance) {
            emit LogInfo("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            emit LogInfo("Oraclize query was sent, standing by for the answer..");

            // Using XPath to to fetch the right element in the JSON response
            weatherQueryId = oraclize_query(20, "URL", "json(http://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=858ac6bf091c34a606c2f3e881951295).main");
        }
    }

    function updateExchRate()
    payable
    public {
        // Check if we have enough remaining funds
        if (oraclize_getPrice("URL") > address(this).balance) {
            emit LogInfo("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            emit LogInfo("Oraclize query was sent, standing by for the answer..");

            // Using XPath to to fetch the right element in the JSON response
            exchRateQueryId = oraclize_query(20, "URL", "json(http://data.fixer.io/api/latest?access_key=d767581739b8def11666ac8528b927db&symbols=GBP,EUR).rates.GBP");
        }
    }

}