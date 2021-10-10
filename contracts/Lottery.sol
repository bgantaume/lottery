// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Lottery {    
    uint public total = 0;
    address public organizer;
    
    struct Player {
        address player;
        uint bet;
    }
    
    constructor() {
        organizer = msg.sender;
    }
    
    Player[] public players;
    
    function play() external payable {
        require(msg.value == 2 ether, "Can only play 2 ether");

        players.push(Player(msg.sender, msg.value));
        total += msg.value;
    }
    
    function roll() external {
        require(msg.sender == organizer, "Only the organizer can roll the lottery");
        
        // TODO : use an oracle instead
        uint rank = block.timestamp % playersCount();
        address winner = players[rank].player;
        uint gain = total * 9 / 10;

        total = 0;
        delete players;
        
        (bool success, ) = payable(winner).call{value: gain}("");
        require(success, "Transfer to winner failed.");       
        
        (success, ) = payable(address(organizer)).call{value: address(this).balance}("");    
        require(success, "Transfer to organizer failed.");    
    }

    function playersCount() public view returns (uint) {
        return players.length;
    }
}