pragma solidity ^0.4.21;
import "installed_contracts/oraclize-api/contracts/usingOraclize.sol";

contract OraclizeTest is usingOraclize {

    address owner;
    string public ETHUSD;

    bytes32 ethQueryId;

    event LogInfo(string description);
    event LogPriceUpdate(string price);
    event LogUpdate(address indexed _owner, uint indexed _balance);

    // Constructor
    function OraclizeTest()
    payable
    public {
        owner = msg.sender;

        emit LogUpdate(owner, address(this).balance);

        // Replace the next line with your version:
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);

        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
        update();
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
        emit LogInfo("getBalance");
        return address(this).balance;
    }

    function __callback(bytes32 id, string result, bytes proof)
    public {
        require(msg.sender == oraclize_cbAddress());

        if(ethQueryId == id) {
            ETHUSD = result;
            emit LogPriceUpdate(ETHUSD);
            updateETH();
        }
    }

    function updateETH()
    payable
    public {
        emit LogInfo("update");
        // Check if we have enough remaining funds
        if (oraclize_getPrice("URL") > address(this).balance) {
            emit LogInfo("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            emit LogInfo("Oraclize query was sent, standing by for the answer..");

            // Using XPath to to fetch the right element in the JSON response
            ethQueryId = oraclize_query(20, "URL", "json(https://api.coinbase.com/v2/prices/ETH-USD/spot).data.amount");
        }
    }

}