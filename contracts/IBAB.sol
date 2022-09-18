// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

interface IBAB {
    enum BussinessState {Opened, Closed, Unknown}

    struct Point {
        int lattitude;
        int longitude;
    }

    struct Bussiness {
        uint256 id;
        string brand;
        BussinessState state;
        address owner;
        Point location;
    }

    struct Exchanger {
        uint256 fullAmountForExchanging;
        address exchanger;
        uint256 exchangesCounter;
    }

    struct Tax {
        uint8 entryTax;
        uint8 withdrawelTax;
        uint8 transactionTax;
        uint8 stagnationTax;
    }

    struct TransactionRevenue {
        uint8 ownerRevenue;
        uint8 providerRevenue;
        uint8 exchangerRevenue;
    }

    struct StagnationData {
        uint256 lastTransaction;
        address accountAddress;
        bool isActive;
    }

    // Currency and area
    function getDefinedArea() external view returns (Point[] memory);
    function defineArea(int[] memory _area) external;
    function setOwner(address ownerAddress) external;

    // Wallet and user
    function depositFunds(uint256 _funds) external payable;
    function deposit(uint256 _amount) external payable;
    function withdraw(uint256 _amount) external payable;
    function computeTransferTaxes(uint256 _amount) external view returns (uint256);
    function transfer(address _transferToAddress, uint256 _amount, int lat, int long) external;

    // Bussiness
    function openBussiness(string memory _name, int lat, int long) external;
    function changeBussinessData(uint256 _bussinessId, string memory _name, BussinessState _state) external;

    // Exchanger
    function stakeExchange(uint256 _exchangeAmount) external payable;

    // Taxes and revenue
    function establishTaxes(uint8 _entryTax, uint8 _withdrawelTax, uint8 _transactionTax, uint8 _stagnationTax) external;
    function establishRevenue(uint8 _ownerRevenue, uint8 _providerRevenue, uint8 _exchagerRevenue) external;

    // Stagnation "cron" job
    function stagnateUsers(uint256 currentTime) external;

    event UserEvent(uint256 date, address userAddress, uint256 funded, uint256 received);
    event ExchangerEvent(uint256 date, address exchanger, uint256 staked);
    event BussinessEvent(uint256 date, address bussiness, Point location);
    event TransferEvent(uint256 date, address to, address from, uint256 transaction, uint256 transactionTax);

}