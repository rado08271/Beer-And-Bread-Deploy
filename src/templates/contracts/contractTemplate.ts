export default `
// SPDX-License-Identifier: TODO
pragma solidity >=0.7.0 <0.9.0;

import "./IBAB.sol";


contract {{ contract.name }} is IBAB {

    // Token name and token symbol sets name of token, token should be real name of token
    // token name and token symbol is not optional and cannot be changed!
    string public tokenName;
    string public tokenSymbol;

    uint _ibabCount = 9;                                // 1 e = 10e(count) cents
    uint ibab = 10 ** _ibabCount;                       // This should be used for comparing input values in payable
    
    // Area of points that describes drawable polygon
    Point[] _areaPolygon;
    uint256 segments = 0;

    int _areaFloatingPoint = 10 ** 5;
    uint8 _floatingPoints = 2;               
    uint256 public _accuracy = 10 ** _floatingPoints;       // This is representation of floating point, must never be zero  

    // Microeconomics owner can set microeconomics stats
    address public microeconomicsOwner;

    // System provider, this entity can't be changed, this entity takes care of time related jobs
    address deployer;
    
    // Interal identifier of how much wei a user has
    mapping (address => uint256) public balance;
    
    Bussiness[] public bussinesses;
    uint public amountOfBusinesses = 0; 

    Tax public taxes;
    bool public taxesEstablished = false;

    TransactionRevenue public revenue;
    bool public revenueEstablished = false;

    Exchanger[] public exchangers;
    uint public amountOfExchangers = 0; 

    // TODO: Wallet stagnation data
    StagnationData[] public stagnationData;
    uint256 accountsActive = 0;
    
    modifier onlyDeployer() {
        require(msg.sender == deployer, "You are not deployer");
        _;
    }

    modifier onlyOwner {
        require(msg.sender == microeconomicsOwner, "You are not owner");
        _;
    }

    modifier walletPay (uint256 _amount) {
        require(_amount * ibab < msg.sender.balance, "You don't have enough gwei to pay");
        require(msg.value < msg.sender.balance, "Sender does not have enough funds");
        require(_amount * ibab <= msg.value, "You have to pay more or exact gwei you want to transact");
        _;
    }   

    modifier internalPay (uint256 _amount) {
        require(_amount * ibab <= balance[msg.sender], "Your account does not have enough balance");
        _;
    }
    
     constructor(string memory _tokenName, string memory _tokenSymbol, int[] memory _area) {
        deployer = msg.sender;
        // In time of creation deployer is microeconomics owner 
        microeconomicsOwner = msg.sender;
        
        tokenName = _tokenName;
        tokenSymbol = _tokenSymbol;

        defineArea(_area); 
     }

    // DONE
    function getDefinedArea() override public view returns (Point[] memory) {
        return _areaPolygon;
    }


    // DONE
    function defineArea(int[] memory _area) override public onlyOwner {
        require(_area.length % 2 == 0, "Area must have pair of lng and lat");
        require(_area.length >= 6, "Area must consist of at least three points to create surface!");

        uint point = 0;
        for (uint segment = 0; segment < segments; segment++) {
            delete _areaPolygon[segment];
            if (point < _area.length) {
                _areaPolygon[segment] = Point(_area[point], _area[point + 1]);
                point+=2;
            }
        }

        for (; point < _area.length; point += 2) {
            _areaPolygon.push(
                Point(_area[point], _area[point + 1])
            );
        }

        segments = _area.length / 2;
    }

    // It's debatable who could change owner address 
    // DONE
    function setOwner(address ownerAddress) override public {
        require(msg.sender == deployer || msg.sender == microeconomicsOwner, "You are not allowd to change owner address");
        require(ownerAddress != address(0), "You cannot set address to 0x0");
        
        microeconomicsOwner = ownerAddress;
    } 

    // DONE
    function deposit(uint256 _amount) override payable public walletPay (_amount) {
        // return change
        uint256 change = msg.value - _amount * ibab;
        payable(msg.sender).transfer(change);

        _fundsTransfer(msg.sender, _amount * ibab, true, true);
    }

    // DONE
    function depositFunds(uint256 _funds) override payable public walletPay (_funds) {
        // require(taxesEstablished, "No taxes were established yet");
        uint8 establishedOperationTaxes = 0;

        if (taxesEstablished) {
            establishedOperationTaxes = taxes.entryTax;
        }

        // We just need to establish competition winner
        // We should maintain the _accuracy - delete / 100
        uint256 entryTax = (_applyPositiveTax(_funds, establishedOperationTaxes)) - (_funds * _accuracy);
        address exchanger = _competeExchangersDeposit(entryTax);
        
        // Increase the counter of exchanger after successfull transaction
        uint256 exchangerIdx = _findExchangerIdByAddress(exchanger);
        exchangers[exchangerIdx].exchangesCounter++;

        _fundsTransfer(msg.sender, (entryTax * ibab) / _accuracy, true, true);   // apply just taxes for sender of message
        _fundsTransfer(exchanger, (entryTax * ibab) / _accuracy, false, true);   // take what exchanger must deliver for entry taxes

        deposit(_funds);                                                    // deposit funds in this step 

        emit UserEvent(block.timestamp, msg.sender, _funds * ibab, (entryTax * ibab) / _accuracy); 
    }

    // DONE
    function withdraw(uint256 _amount) override public payable internalPay(_amount) {
        uint8 establishedOperationTaxes = 0;

        if (taxesEstablished) {
            establishedOperationTaxes = taxes.withdrawelTax;
        }

        uint256 withdrawelTax = (_amount * _accuracy) - (_applyNegativeTax(_amount, establishedOperationTaxes));
        address exchanger = _competeExchangersWithdraw(); 

        _fundsTransfer(msg.sender, (_amount * ibab), false, true);
        _fundsTransfer(exchanger, (withdrawelTax * ibab) / _accuracy, true, true);

        uint256 toWithdrawFromContract = (_amount * ibab) - ((withdrawelTax * ibab) / _accuracy);
        payable(msg.sender).transfer(toWithdrawFromContract);
    }


    // DONE
    function computeTransferTaxes(uint256 _amount) override public view returns (uint256) {
        uint8 establishedOperationTaxes = 0;

        if (taxesEstablished) {
            establishedOperationTaxes = taxes.transactionTax;
        }
        uint256 transactionTax = (_amount * _accuracy) - (_applyNegativeTax(_amount, establishedOperationTaxes));

        return (transactionTax * ibab) / _accuracy;
    }

    // DONE
    function transfer(address _transferToAddress, uint256 _amount, int lat, int long) override public {
        require(_transferToAddress != address(0), "You can't send to 0x0 address");  
        require(_insideOfPolygon(Point(lat, long)), "You are outside of predefined area");

        uint8 establishedOperationTaxes = 0;

        if (taxesEstablished) {
            establishedOperationTaxes = taxes.transactionTax;
        }

        uint256 transactionTax = 0;
        // Question: 
        //      Revenue not established, who should receive all money?
        if (revenueEstablished) {
            transactionTax = (_amount * _accuracy) - (_applyNegativeTax(_amount, establishedOperationTaxes));
        }

        uint256 ownerPortion = ((transactionTax * ibab) / _accuracy) / 100 * revenue.ownerRevenue;
        uint256 providerPortion = ((transactionTax * ibab) / _accuracy) / 100 * revenue.providerRevenue;
        uint256 exchangersPortion = ((transactionTax * ibab) / _accuracy) / 100 * revenue.exchangerRevenue;

        // Question: 
        //      Revenue not established, should owner receive all money?
        // if (!revenueEstablished) {
        //    ownerPortion = ((transactionTax * ibab) / _accuracy) / 100 * 100;
        // }

        _fundsTransfer(microeconomicsOwner, ownerPortion, true, true);
        _fundsTransfer(deployer, providerPortion, true, true);

        // Question: 
        //      If no exchanger is available return their portion back to owner? otherwise send evenly to everyone
        if (amountOfExchangers != 0) {
            // Questions: 
            //      Distribute transaction tax equally between all exchangers? 
            //      Pick one exchanger?
            for (uint256 idx = 0; idx > amountOfExchangers; idx++) {
                _fundsTransfer(exchangers[idx].exchanger, exchangersPortion / amountOfExchangers, true, true); 
            }
        } else {
            _fundsTransfer(microeconomicsOwner, exchangersPortion, true, true);
        }

        // Transfer funds from sender to final address, 
        // Question: 
        //      If revenue is not established, (- 0) makes him receive all money...
        _fundsTransfer(_transferToAddress, (_amount * ibab) - ((transactionTax * ibab) / _accuracy), true, true);
        _fundsTransfer(msg.sender, _amount * ibab, false, true);

        emit TransferEvent(block.timestamp, msg.sender, _transferToAddress, _amount * ibab, (transactionTax * ibab) / _accuracy); 
    }

    // DONE
    function stakeExchange(uint256 _exchangeAmount) override public payable walletPay (_exchangeAmount) {
        uint256 exchangerIdx = _findExchangerIdByAddress(msg.sender);

        if (exchangerIdx == amountOfExchangers) {
            exchangers.push(Exchanger(_exchangeAmount * ibab, msg.sender, 0));
            amountOfExchangers++;
        } else {
            exchangers[exchangerIdx].fullAmountForExchanging += _exchangeAmount * ibab;
        }

        deposit(_exchangeAmount);

        emit ExchangerEvent(block.timestamp, msg.sender, _exchangeAmount * ibab); 
    }

    // DONE
    function openBussiness(string memory _name, int lat, int long ) override public {
        require(_insideOfPolygon(Point(lat, long)), "Bussiness cannot be established outside of predefined area");

        bussinesses.push(Bussiness(amountOfBusinesses, _name, BussinessState.Opened, msg.sender, Point(lat, long)));

        amountOfBusinesses += 1;
        emit BussinessEvent(block.timestamp, msg.sender, Point(lat, long)); 
    }

    // DONE
    function changeBussinessData(uint256 _bussinessId, string memory _name, BussinessState _state) override public {
        uint256 bussinessIndex = _findBusinessIdByID(_bussinessId);
        require(bussinessIndex != amountOfBusinesses, "Bussiness does not exist");

        require(msg.sender == bussinesses[bussinessIndex].owner || msg.sender == deployer || msg.sender == microeconomicsOwner, "You are not allowed to change bussiness data");

        bussinesses[bussinessIndex].brand = _name;
        bussinesses[bussinessIndex].state = _state;
    }

    // DONE
    function establishTaxes(uint8 _entryTax, uint8 _withdrawelTax, uint8 _transactionTax, uint8 _stagnationTax) override public onlyOwner {
        require(_entryTax * _accuracy <  100 * _accuracy, "Entry taxes exceeds 100%, value is too high");
        require(_withdrawelTax * _accuracy <  100 * _accuracy, "Withdrawel taxes exceeds 100%, value is too high");
        require(_transactionTax * _accuracy <  100 * _accuracy, "Transation taxes exceeds 100%, value is too high");
        require(_stagnationTax * _accuracy <  100 * _accuracy, "Stagnation taxes exceeds 100%, value is too high");
        
        taxesEstablished = true;
        taxes = Tax(_entryTax, _withdrawelTax, _transactionTax, _stagnationTax);
    }

    // DONE
    function establishRevenue(uint8 _ownerRevenue, uint8 _providerRevenue, uint8 _exchagerRevenue) override public onlyOwner {
        require(_ownerRevenue + _providerRevenue + _exchagerRevenue == 100, "Revenue distribution must be 100% of transaction fees");

        revenueEstablished = true;
        revenue = TransactionRevenue(_ownerRevenue, _providerRevenue, _exchagerRevenue);
    }

    // DONE
    function stagnateUsers(uint256 _currentTime) override public onlyDeployer {
        for (uint256 idx = 0; idx < accountsActive; idx++) {
            if (stagnationData[idx].accountAddress != microeconomicsOwner) {
                uint256 noTransactionFor = _currentTime - stagnationData[idx].lastTransaction;

                if (noTransactionFor > ((365 days) * 5)) {
                    // Apply dead tax
                    _applyInactiveTax(stagnationData[idx].accountAddress);
                } else if (noTransactionFor > ((365 days) * 3)) {
                    // apply stagnation tax
                    _applyStagnationTax(stagnationData[idx].accountAddress);
                }
            }
        }
    }

    // DONE
    function _applyStagnationTax(address _address) internal {
        uint8 establishedOperationTaxes = 0;
        
        if (taxesEstablished) {
            establishedOperationTaxes = taxes.stagnationTax;
        }

        uint256 stagnationTax = (balance[_address]) - (_applyNegativeTax(balance[_address]/_accuracy, establishedOperationTaxes));

        _fundsTransfer(_address, stagnationTax, false, false);
        _fundsTransfer(microeconomicsOwner, stagnationTax, true, false);
    }

    // DONE
    function _applyInactiveTax(address _address) internal {
        uint256 decreaseAmount = balance[_address];

        _fundsTransfer(microeconomicsOwner, decreaseAmount, true, false);
        _fundsTransfer(_address, decreaseAmount, false, false);
    }
    
    // DONE 
    function _applyPositiveTax(uint256 beforeTaxation, uint256 _taxes) internal view returns (uint256) {
        return (beforeTaxation * _accuracy) + ((beforeTaxation * _accuracy) / 100) * _taxes;
    }

    // DONE
    function _applyNegativeTax(uint256 beforeTaxation, uint8 _taxes) internal view returns (uint256) {
        return (beforeTaxation * _accuracy) - ((beforeTaxation * _accuracy) / 100) * _taxes;
    }

    // DONE
    function _competeExchangersDeposit(uint256 _neededAmount) internal view returns(address) {
        require(amountOfExchangers > 0, "There are no exchangers");

        Exchanger storage winner = exchangers[0];
        bool someHasEnoughWei = false;
        for (uint index = 0; index < amountOfExchangers; index++) {
            uint256 competingTempWinner = (balance[winner.exchanger] * _accuracy) / (winner.fullAmountForExchanging);
            uint256 competingTempExchanger = (balance[exchangers[index].exchanger] * _accuracy) / (exchangers[index].fullAmountForExchanging);
            
            // Currently competing exchanger must have more uninvested funds
            if (competingTempExchanger > competingTempWinner) {
                winner = exchangers[index];
            }

            if (balance[exchangers[index].exchanger] >= _neededAmount) {
                someHasEnoughWei = true;
            }
        }

        require(someHasEnoughWei, "No exchanger has enough wei to pay");

        return winner.exchanger;
    }

    // DONE
    function _competeExchangersWithdraw() internal view returns(address) {
        require(amountOfExchangers > 0, "There are no exchangers");

        Exchanger storage winner = exchangers[0];
        for (uint index = 0; index < amountOfExchangers; index++) {
            // Currently competing exchanger must have more uninvested funds
            if (winner.exchangesCounter <= exchangers[index].exchangesCounter) {
                winner = exchangers[index];
            }
        }

        return winner.exchanger;
    }

    // DONE
    function _findExchangerIdByAddress(address _exchangerAddress) internal view returns (uint256) {
        for (uint256 index = 0; index < amountOfExchangers; index++) {
            if (exchangers[index].exchanger == _exchangerAddress) {
                return index;
            }
        }

        return amountOfExchangers;
    }

    // DONE
    function _findBusinessIdByID(uint256 _bussinessId) internal view returns (uint256) {
        for (uint256 index = 0; index < amountOfBusinesses; index++) {
            if (bussinesses[index].id == _bussinessId) {
                return index;
            }
        }

        return amountOfBusinesses;
    }

    // DONE
    function _findStagnationDataIdByAccountAddress(address _transactorAddress) internal view returns (uint256) {
        for (uint256 index = 0; index < accountsActive; index++) {
            if (stagnationData[index].accountAddress == _transactorAddress) {
                return index;
            }
        }

        return accountsActive;
    }

    // DONE
    function _fundsTransfer(address _address, uint256 _transaction, bool _positive, bool _transfer) internal {
        require(_address != address(0), "You can't send to 0x0 address");  
        require(balance[_address] >= _transaction || _positive, "You don't have enough funds to pay transaction");  

        if (_positive) {
            balance[_address] += _transaction;
        } else {
            balance[_address] -= _transaction;
        }

        if (_transfer) {
            uint256 stagnatingId = _findStagnationDataIdByAccountAddress(_address);
            if (stagnatingId != accountsActive && stagnationData[stagnatingId].isActive == true) {
                // Update last transaction time
                stagnationData[stagnatingId].lastTransaction = block.timestamp;
            } else {
                // Could not find stagnation data with that address
                // Add new account and increase number of accounts
                stagnationData.push(StagnationData(block.timestamp, _address, true));
                accountsActive++;
            }
        }
    }

    function _insideOfPolygon(Point memory location) internal view returns (bool) {
        int latMaxEast = 0;
        int latMinWest = 360 * _areaFloatingPoint;
        int lngMaxNorth = 0;
        int lngMinSouth = 180 * _areaFloatingPoint;

        for (uint idx = 0; idx < segments; idx++) {
            if (latMaxEast < _areaPolygon[idx].lattitude) latMaxEast = _areaPolygon[idx].lattitude;
            if (latMinWest > _areaPolygon[idx].lattitude) latMinWest = _areaPolygon[idx].lattitude;
            if (lngMaxNorth < _areaPolygon[idx].longitude) lngMaxNorth = _areaPolygon[idx].longitude;
            if (lngMinSouth > _areaPolygon[idx].longitude) lngMinSouth = _areaPolygon[idx].longitude;
        }

        if (!(location.lattitude >= latMinWest && location.lattitude <= latMaxEast)) return false;
        if (!(location.longitude >= lngMinSouth && location.longitude <= lngMaxNorth)) return false;


        uint256 countIntersections = 0;
        for (uint side = 0; side < segments - 1; side++) {
            Point storage pointA = _areaPolygon[side];
            if (pointA.lattitude != 0 && pointA.longitude != 0 ) {
                Point storage pointB = _areaPolygon[side + 1];
                Point memory beacon = Point(latMaxEast, location.longitude);

                if (pointA.longitude > location.longitude || pointB.longitude > location.longitude) {
                    int ABL = orientation(pointA, pointB, location);
                    int ABB = orientation(pointA, pointB, beacon);
                    int LBA = orientation(location, beacon, pointA);
                    int LBB = orientation(location, beacon, pointB);

                    if (ABL != ABB && LBA != LBB) {
                        countIntersections++;
                    }
                }
            } 
        }

        return countIntersections % 2 == 1;
    }

    function orientation(Point memory a, Point memory b, Point memory c) internal pure returns (int) {
        int oriented = 
            ((b.lattitude - a.lattitude) * (c.longitude - b.longitude)) - 
            ((b.longitude - a.longitude) * (c.lattitude - b.lattitude));

        if (oriented == 0) return 0;

        if (oriented < 0) {
            return -1;
        } else {
            return 1;
        }
    }
}
`