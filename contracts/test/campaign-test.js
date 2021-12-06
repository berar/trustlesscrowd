const { expect } = require("chai");

describe("Campaign contract", function () {

  let Contract;
  let fm_contract;
  let FactoryContract;
  let USDCContract;
  let usdc_contract;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let addr5;
  let addr6;
  let addr7;
  let addrs;

  beforeEach(async function () {
    Contract = await ethers.getContractFactory("Campaign");
    USDCContract = await ethers.getContractFactory("USDCMock");
    usdc_contract = await USDCContract.deploy();
    [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, ...addrs] = await ethers.getSigners();
  });

  async function create_basic_contract() {
    c_contract = await Contract.deploy(usdc_contract.address, owner.address, "", 1, [1000, 2000], [1, 2], "", "");
    await usdc_contract.connect(owner).approve(c_contract.address, 5000);
    await c_contract.connect(owner).deposit_collateral();
    return c_contract;
  }

  describe("Deployment", function () {

    it("Test getting when no campaigns added should fail. ", async function () {
      FactoryContract = await ethers.getContractFactory('CampaignFactory');
      f_contract = await FactoryContract.deploy(usdc_contract.address);
      await expect(f_contract.connect(owner).get_campaign(2)).to.be.revertedWith("No such campaign. ");
    });
    
    it("Test adding comment properly. ", async function () {
      c_contract = await create_basic_contract()
      let cc01 = await c_contract.connect(owner).add_comment("asdf");
      expect(await c_contract.comment_count()).to.equal(1);
      expect((await c_contract.connect(owner).get_comment(0))[1]).to.equal("asdf");
    });

    it("Should set the right owner", async function () {
      c_contract = await create_basic_contract()
      expect(await c_contract.owner()).to.equal(owner.address);
    });

    it("Amount and prices array of different length should fail. ", async function () {
      await expect(Contract.deploy(usdc_contract.address, owner.address, "", 1, [10000, 20000, 30000], [10, 20, 30, 40], "", "")).to.be.revertedWith("Amounts and prices length mismatch. ");
    });

    it("Price less than minimal should fail. ", async function () {
      await expect(Contract.deploy(usdc_contract.address, owner.address, "", 1, [10, 2000, 3000, 4000], [10, 20, 30, 40], "", "")).to.be.revertedWith("Price is less than minimal. ");
    });
    
    it("Test funding_goal is set properly. ", async function () {
      c_contract = await create_basic_contract()
      expect(await c_contract.funding_goal()).to.equal(5000);
    });
  });

  describe("Buying rewards", function () {

    it("Test buying when no money is sent, it should fail. ", async function () {
      c_contract = await create_basic_contract()
      await expect(c_contract.connect(addr2).buy_reward(0)).to.be.revertedWith("Not enough money sent. ");
    });

    it("Test buying when no balance left in contract, it should fail. ", async function () {
      c_contract = await create_basic_contract()
      await expect(c_contract.connect(addr2).buy_reward(2)).to.be.revertedWith('No such id. ');
    });

    it("Test buying when it should pass. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 1000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(1);
    });

    it("Test buying when buying a reward of 1 amount, 2nd buying should exceeded the balance. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 1000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      await expect(c_contract.connect(addr2).buy_reward(0)).to.be.revertedWith('Supply exceeded. ');
    });

    it("Test buying when buying a reward of 1 amount, then owner increases the supply, then buying is back again. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      await expect(c_contract.connect(addr2).buy_reward(0)).to.be.revertedWith('Supply exceeded. ');
      await usdc_contract.connect(owner).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(owner).increase_reward_supply(0, 1);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(2);
      await expect(c_contract.connect(addr2).buy_reward(0)).to.be.revertedWith('Supply exceeded. ');
    });

    it("Test when is_funded no more buying possible. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      var cc01 = await c_contract.connect(addr2).buy_reward(1);
      var cc01 = await c_contract.connect(addr2).buy_reward(1);
      await expect(c_contract.connect(addr2).buy_reward(1)).to.be.revertedWith('Campaign already funded. ');
    });

    it("Test increase reward supply with no msg.value. ", async function () {
      c_contract = await create_basic_contract();
      await expect(c_contract.connect(owner).increase_reward_supply(0, 1)).to.be.revertedWith('Not enough collateral sent. ');
    });
  });

  describe("Time-based tests. ", function () {

    it("Test buying when 25 hours passed, should fail. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 1000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);

      await network.provider.send("evm_increaseTime", [25 * 3600])
      await network.provider.send("evm_mine")

      await expect(c_contract.connect(addr2).buy_reward(0)).to.be.revertedWith('Campaign is closed. ');
    });

    it("Test withdraw when trying to do that instantly by owner. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 1000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);

      await expect(c_contract.connect(owner).withdraw()).to.be.revertedWith('Campaign is open. ');
    });

    it("Test withdraw when trying to do that instantly by non-owner. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 1000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);

      await expect(c_contract.connect(addr2).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it("Test withdraw when time has passed, should work properly. ", async function () {

      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      var cc01 = await c_contract.connect(addr2).buy_reward(1);
      var cc01 = await c_contract.connect(addr2).buy_reward(1);

      await network.provider.send("evm_increaseTime", [25 * 3600])
      await network.provider.send("evm_mine")

      var cc99 = await c_contract.connect(owner).withdraw();

      //const balance2 = await ethers.provider.getBalance(owner.address);
      //console.log(balance2);
    });
  });

  describe("Minting and burning", function () {

    it("Can't burn unowned NFTS via claim_reward", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc02 = await c_contract.connect(addr2).buy_reward(0);
      var cc02 = await c_contract.connect(addr2).buy_reward(1);
      var cc02 = await c_contract.connect(addr2).buy_reward(1);
      await network.provider.send("evm_increaseTime", [25 * 3600])
      await network.provider.send("evm_mine")
      await expect(c_contract.connect(addr2).claim_reward(0, 10)).to.be.revertedWith("ERC1155: burn amount exceeds balance");
    });

    it("Can burn owned NFTS via claim_reward", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc02 = await c_contract.connect(addr2).buy_reward(0);
      var cc02 = await c_contract.connect(addr2).buy_reward(1);
      var cc02 = await c_contract.connect(addr2).buy_reward(1);
      await network.provider.send("evm_increaseTime", [25 * 3600])
      await network.provider.send("evm_mine")
      var cc03 = await c_contract.connect(addr2).claim_reward(0, 1);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(0);
    });

    it("Can't claim when not claimable", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      var cc01 = await c_contract.connect(addr2).buy_reward(1);
      var cc01 = await c_contract.connect(addr2).buy_reward(1);
      await expect(c_contract.connect(addr2).claim_reward(0, 10)).to.be.revertedWith('ERC1155: burn amount exceeds balance');
    });
  });

  describe("funding_balance and withdraw tests. ", function () {

    it("Test simple funding_balance case. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      var cc02 = await c_contract.funding_balance();
      expect(cc02).to.equal(1000);
    });

    it("Test complex funding_balance. ", async function () {
      c_contract = await create_basic_contract();
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      var cc02 = await c_contract.connect(addr2).buy_reward(1);

      var cc04 = await c_contract.funding_balance();
      expect(cc04).to.equal(3000);
    });

    /*
    it("Test complex funding_balance and withdraw. ", async function () {
      c_contract = await create_basic_contract();
      var cc01 = await c_contract.connect(addr2).buy_reward(0, { value: 1_000_000_000_000_000 });
      var cc02 = await c_contract.connect(addr2).buy_reward(1, { value: 1_000_000_000_000_000 });
      var cc03 = await c_contract.connect(addr3).donate({ value: 2000 });

      var cc04 = await c_contract.pool_balance();
      expect(cc04).to.equal(4970);

      await network.provider.send("evm_increaseTime", [25 * 3600])
      await network.provider.send("evm_mine")

      var cc05 = await c_contract.connect(owner).withdraw();
      var cc06 = await c_contract.pool_balance();
      expect(cc06).to.equal(0);

      var cc07 = await c_contract.funding_balance();
      expect(cc04).to.equal(4970);
    });
    */
  });

  describe("DEX tests. ", function () {

    it("Test posting ask with less than MIN_PRICE should fail. ", async function () {
      c_contract = await create_basic_contract()
      await expect(c_contract.connect(addr2).post_ask(0, 9)).to.be.revertedWith("Price is less than minimal. ");
    });

    it("Test posting ask with no token balance should fail. ", async function () {
      c_contract = await create_basic_contract()
      await expect(c_contract.connect(addr2).post_ask(0, 1000)).to.be.revertedWith("ERC1155: burn amount exceeds balance");
    });

    it("Test posting ask properly. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(1);
      var cc02 = await c_contract.connect(addr2).post_ask(0, 1000);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(0);
      var val = cc02.value.toNumber();
      expect(val).to.equal(0);
    });

    it("Test canceling ask properly. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(1);
      var cc02 = await c_contract.connect(addr2).post_ask(0, 1000);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(0);
      var cc02 = await c_contract.connect(addr2).cancel_ask(0);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(1);
    });

    it("Test canceling ask 2nd time should fail. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(1);
      var cc02 = await c_contract.connect(addr2).post_ask(0, 1000);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(0);
      var cc02 = await c_contract.connect(addr2).cancel_ask(0);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(1);
      await expect(c_contract.connect(addr2).cancel_ask(0)).to.be.revertedWith("Order is completed. ");
    });

    it("Test canceling ask by different address should fail. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(1);
      var cc02 = await c_contract.connect(addr2).post_ask(0, 1000);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(0);
      await expect(c_contract.connect(addr3).cancel_ask(0)).to.be.revertedWith("You are not the maker. ");
    });

    it("Test calling ask properly. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(1);
      var cc02 = await c_contract.connect(addr2).post_ask(0, 1000);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(0);
      var cc02 = await c_contract.connect(addr3).call_ask(0, {value: 1000});
      expect(await c_contract.balanceOf(addr3.address, 0)).to.equal(1);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(0);
    });

    it("Test calling ask 2nd time should fail. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(1);
      var cc02 = await c_contract.connect(addr2).post_ask(0, 1000);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(0);
      var cc02 = await c_contract.connect(addr3).call_ask(0, {value: 1000});
      expect(await c_contract.balanceOf(addr3.address, 0)).to.equal(1);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(0);
      await expect(c_contract.connect(addr3).call_ask(0, {value: 1000})).to.be.revertedWith("Order is completed. ");
    });

    it("Test calling ask by maker should fail. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(1);
      var cc02 = await c_contract.connect(addr2).post_ask(0, 1000);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(0);
      await expect(c_contract.connect(addr2).call_ask(0)).to.be.revertedWith("You are the maker. ");
    });

    it("Test calling ask with less than value money should fail. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr2).approve(c_contract.address, 3000000000000000);
      var cc01 = await c_contract.connect(addr2).buy_reward(0);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(1);
      var cc02 = await c_contract.connect(addr2).post_ask(0, 1000);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(0);
      await expect(c_contract.connect(addr3).call_ask(0, { value: 9 })).to.be.revertedWith("Not enough money sent. ");
    });

    it("Test posting bid with less than MIN_PRICE should fail. ", async function () {
      c_contract = await create_basic_contract()
      await expect(c_contract.connect(addr2).post_bid(0)).to.be.revertedWith("Price is less than minimal. ");
    });

    it("Test posting bid properly. ", async function () {
      c_contract = await create_basic_contract()
      var cc01 = await c_contract.connect(addr2).post_bid(0, {value: 1000});
    });

    it("Test canceling bid properly. ", async function () {
      c_contract = await create_basic_contract()
      var cc02 = await c_contract.connect(addr2).post_bid(0, { value: 1000 });
      var cc03 = await c_contract.connect(addr2).cancel_bid(0);
    });

    it("Test canceling bid 2nd time should fail. ", async function () {
      c_contract = await create_basic_contract()
      var cc02 = await c_contract.connect(addr2).post_bid(0, { value: 1000 });
      var cc03 = await c_contract.connect(addr2).cancel_bid(0);
      await expect(c_contract.connect(addr2).cancel_bid(0)).to.be.revertedWith("Order is completed. ");
    });

    it("Test canceling bid by different address should fail. ", async function () {
      c_contract = await create_basic_contract()
      var cc02 = await c_contract.connect(addr2).post_bid(0, { value: 1000 });
      await expect(c_contract.connect(addr3).cancel_bid(0)).to.be.revertedWith("You are not the maker. ");
    });

    it("Test calling bid properly. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr3).approve(c_contract.address, 10000);
      var cc01 = await c_contract.connect(addr3).buy_reward(0);
      var cc02 = await c_contract.connect(addr2).post_bid(0, { value: 1000 });
      var cc03 = await c_contract.connect(addr3).call_bid(0);
      expect(await c_contract.balanceOf(addr3.address, 0)).to.equal(0);
      expect(await c_contract.balanceOf(addr2.address, 0)).to.equal(1);
    });

    it("Test calling bid 2nd time should fail. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr3).approve(c_contract.address, 1000000000000000);
      var cc01 = await c_contract.connect(addr3).buy_reward(0);
      var cc02 = await c_contract.connect(addr2).post_bid(0, { value: 1000 });
      var cc03 = await c_contract.connect(addr3).call_bid(0);
      await expect(c_contract.connect(addr3).call_bid(0)).to.be.revertedWith("Order is completed. ");
    });

    it("Test calling bid by maker should fail. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr3).approve(c_contract.address, 1000000000000000);
      var cc01 = await c_contract.connect(addr3).buy_reward(0);
      var cc02 = await c_contract.connect(addr2).post_bid(0, { value: 1000 });
      await expect(c_contract.connect(addr2).call_bid(0)).to.be.revertedWith("You are the maker. ");
    });

    it("Test calling bid with less than value money should fail. ", async function () {
      c_contract = await create_basic_contract()
      await usdc_contract.connect(addr3).approve(c_contract.address, 1000000000000000);
      var cc02 = await c_contract.connect(addr3).post_bid(0, { value: 1000 });
      await expect(c_contract.connect(addr2).call_bid(0)).to.be.revertedWith("ERC1155: burn amount exceeds balance");
    });
  });

  describe('Comments', function() {
    
    it("Test getting when no comments should fail. ", async function () {
      c_contract = await create_basic_contract()
      await expect(c_contract.connect(owner).get_comment(2)).to.be.revertedWith("No such comment. ");
    });
    
    it("Test adding comment properly. ", async function () {
      c_contract = await create_basic_contract()
      let cc01 = await c_contract.connect(owner).add_comment("asdf");
      expect(await c_contract.comment_count()).to.equal(1);
      expect((await c_contract.connect(owner).get_comment(0))[1]).to.equal("asdf");
    });
  });
});