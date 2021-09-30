// SPDX-License-Identifier: UNLICENCED

pragma solidity >=0.7.0 <0.9.0;
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
    
    receive() external payable {
        require(msg.value == 2 ether, "Can only play 2 ether");

        players.push(Player(msg.sender, msg.value));
        total += msg.value;
    }
    
    function roll() external {
        require(msg.sender == organizer, "Only the organizer can roll the lottery");
        
        uint rank = block.timestamp % playersCount();
        address winner = players[rank].player;
        uint gain = total * 9 / 10;

        total = 0;
        delete players;
        
        payable(winner).transfer(gain);        
        payable(address(organizer)).transfer(address(this).balance);      
    }

    function playersCount() public view returns (uint) {
        return players.length;
    }
}