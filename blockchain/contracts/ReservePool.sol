// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title ReservePool
 * @notice Manages reserve funds from all lending circles
 * @dev Only verified LendingCircle contracts can withdraw funds
 */
contract ReservePool {
    address public factory;
    mapping(address => bool) public verifiedCircles;
    
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;
    uint256 public currentBalance;

    // Events
    event Deposit(address indexed circle, address indexed depositor, uint256 amount);
    event Withdrawal(address indexed circle, address indexed recipient, uint256 amount);
    event CircleVerified(address indexed circle);
    event CircleRevoked(address indexed circle);

    modifier onlyFactory() {
        require(msg.sender == factory, "ReservePool: Only factory can call");
        _;
    }

    modifier onlyVerifiedCircle() {
        require(verifiedCircles[msg.sender], "ReservePool: Only verified circles can withdraw");
        _;
    }

    constructor() {
        factory = msg.sender;
    }

    /**
     * @notice Verify a lending circle contract
     * @param circle Address of the LendingCircle contract
     */
    function verifyCircle(address circle) external onlyFactory {
        require(circle != address(0), "ReservePool: Invalid circle address");
        verifiedCircles[circle] = true;
        emit CircleVerified(circle);
    }

    /**
     * @notice Revoke verification of a lending circle contract
     * @param circle Address of the LendingCircle contract
     */
    function revokeCircle(address circle) external onlyFactory {
        verifiedCircles[circle] = false;
        emit CircleRevoked(circle);
    }

    /**
     * @notice Deposit reserve funds from a lending circle
     * @dev Called by verified LendingCircle contracts
     */
    function deposit() external payable onlyVerifiedCircle {
        require(msg.value > 0, "ReservePool: Deposit amount must be greater than 0");
        
        totalDeposited += msg.value;
        currentBalance += msg.value;
        
        emit Deposit(msg.sender, tx.origin, msg.value);
    }

    /**
     * @notice Withdraw funds from reserve pool
     * @param amount Amount to withdraw
     * @param recipient Address to receive the funds
     * @dev Only verified circles can withdraw, and only to their participants
     */
    function withdraw(uint256 amount, address recipient) external onlyVerifiedCircle {
        require(amount > 0, "ReservePool: Withdrawal amount must be greater than 0");
        require(recipient != address(0), "ReservePool: Invalid recipient address");
        require(currentBalance >= amount, "ReservePool: Insufficient balance");
        
        currentBalance -= amount;
        totalWithdrawn += amount;
        
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "ReservePool: Transfer failed");
        
        emit Withdrawal(msg.sender, recipient, amount);
    }

    /**
     * @notice Get utilization rate (withdrawn / deposited)
     * @return utilizationRate Percentage (0-10000, where 10000 = 100%)
     */
    function getUtilizationRate() external view returns (uint256) {
        if (totalDeposited == 0) {
            return 0;
        }
        return (totalWithdrawn * 10000) / totalDeposited;
    }

    /**
     * @notice Receive function to accept ETH deposits
     */
    receive() external payable {
        require(verifiedCircles[msg.sender], "ReservePool: Only verified circles can deposit");
        totalDeposited += msg.value;
        currentBalance += msg.value;
        emit Deposit(msg.sender, tx.origin, msg.value);
    }
}
