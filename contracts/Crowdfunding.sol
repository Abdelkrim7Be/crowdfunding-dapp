// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

contract Crowdfunding {

    address public owner;
    string public campaignTitle;
    string public campaignDescription;
    uint256 public goalAmount;
    uint256 public deadline;
    uint256 public totalRaised;
    bool public goalReached;
    bool public fundsWithdrawn;

    mapping(address => uint256) public donations;
    address[] public donors;

    event DonationReceived(address donor, uint256 amount);
    event GoalReached(uint256 totalRaised);
    event FundsWithdrawn(address owner, uint256 amount);
    event RefundIssued(address donor, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor(
        string memory _title,
        string memory _description,
        uint256 _goalAmount,
        uint256 _durationDays
    ) {
        owner = msg.sender;
        campaignTitle = _title;
        campaignDescription = _description;
        goalAmount = _goalAmount * 1 ether;
        deadline = block.timestamp + (_durationDays * 1 days);
        goalReached = false;
        fundsWithdrawn = false;
        totalRaised = 0;
    }

    function donate() public payable {
        require(block.timestamp < deadline, "Campaign has ended");
        require(msg.value > 0, "Donation must be greater than 0");
        if (donations[msg.sender] == 0) {
            donors.push(msg.sender);
        }
        donations[msg.sender] += msg.value;
        totalRaised += msg.value;
        emit DonationReceived(msg.sender, msg.value);
        if (totalRaised >= goalAmount) {
            goalReached = true;
            emit GoalReached(totalRaised);
        }
    }

    function withdraw() public onlyOwner {
        require(goalReached, "Goal not reached yet");
        require(!fundsWithdrawn, "Funds already withdrawn");
        require(block.timestamp >= deadline, "Campaign still active");
        fundsWithdrawn = true;
        uint256 amount = address(this).balance;
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Withdrawal failed");
        emit FundsWithdrawn(owner, amount);
    }

    function refund() public {
        require(block.timestamp >= deadline, "Campaign still active");
        require(!goalReached, "Goal was reached, no refund");
        require(donations[msg.sender] > 0, "No donation found");
        uint256 amount = donations[msg.sender];
        donations[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Refund failed");
        emit RefundIssued(msg.sender, amount);
    }

    function getCampaignInfo() public view returns (
        string memory title,
        string memory description,
        uint256 goal,
        uint256 raised,
        uint256 timeLeft,
        bool reached
    ) {
        uint256 remaining = block.timestamp < deadline
            ? deadline - block.timestamp
            : 0;
        return (
            campaignTitle,
            campaignDescription,
            goalAmount,
            totalRaised,
            remaining,
            goalReached
        );
    }

    function getDonorsCount() public view returns (uint256) {
        return donors.length;
    }
}
