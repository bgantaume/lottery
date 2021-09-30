
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");

describe("Lottery", function () {
  const two_ethers = ethers.utils.parseEther("2.0");
  let owner, player1, player2;
  let lottery;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    const Lottery  = await ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy();
    await lottery.deployed();
  });

  it("Should set the deployer as organizer", async function () {
    expect(await lottery.organizer()).to.equal(owner.address)
  });

  describe("play", function() {
    it('changes the total when playing', async () => {
      await player1.sendTransaction({
          to: lottery.address,
          value: two_ethers
        });
        expect(await lottery.total()).to.equal(two_ethers);
        expect(await lottery.provider.getBalance(lottery.address)).to.equal(two_ethers);
      });
  
    it("Should check the amount sent", async function () {
      try {
        await player1.sendTransaction({
          to: lottery.address,
          value: ethers.utils.parseEther("1.0")
        });
      } catch (err) {  
        expect(err.message).to.eq("VM Exception while processing transaction: reverted with reason string 'Can only play 2 ether'");
      } 
    
      expect(await lottery.total()).to.equal(0);
      expect(await lottery.provider.getBalance(lottery.address)).to.equal(0);
    });
  
  });
  
  describe("roll", function() {
    it("should dispatch money played", async function () {
      await player1.sendTransaction({
        to: lottery.address,
        value: two_ethers
      });
      
      await player2.sendTransaction({
        to: lottery.address,
        value: two_ethers
      });
      
      let balance_player1_before = await player1.getBalance();
      let balance_player2_before = await player2.getBalance();
      let owner_balance_before = await owner.getBalance();
      
      await lottery.roll();
      
      let player1_gain = (await player1.getBalance()).sub(balance_player1_before);
      let player2_gain = (await player2.getBalance()).sub(balance_player2_before);
      let owner_gain = (await owner.getBalance()).sub(owner_balance_before);

      expect((player1_gain.eq(ethers.utils.parseEther("3.6"))) && player2_gain.eq(BigNumber.from(0)) 
              || player1_gain.eq(BigNumber.from(0)) && player2_gain.eq(ethers.utils.parseEther("3.6"))).to.be.true;
      
      // Improve me : how to get the accurate gas cost ?
      expect(owner_gain).to.be.gt(ethers.utils.parseEther("0.3")).and.lt(ethers.utils.parseEther("0.4"));
      
      expect(await(lottery.playersCount())).to.eq(0);
      expect(await(lottery.total())).to.eq(0);      
    });
  
    it("should only authorize owner to roll a lottery", async function () {
      await player1.sendTransaction({
        to: lottery.address,
        value: two_ethers
      });
      
      await player2.sendTransaction({
        to: lottery.address,
        value: two_ethers
      });
      
      try {
        await lottery.connect(player1).roll();
        throw("This should not work !");
      } catch (err) {  
        expect(err.message).to.eq("VM Exception while processing transaction: reverted with reason string 'Only the organizer can roll the lottery'");
      } 
   
      expect(await(lottery.playersCount())).to.eq(2);
      expect(await(lottery.total())).to.eq(ethers.utils.parseEther("4.0"));      
    });
  });
});
