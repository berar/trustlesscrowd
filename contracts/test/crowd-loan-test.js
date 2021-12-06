const { expect } = require("chai");

describe("CrowdLoan tests", function () {

  let Contract;
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
    Contract = await ethers.getContractFactory("CrowdLoan");
    USDCContract = await ethers.getContractFactory("USDCMock");
    usdc_contract = await USDCContract.deploy();
    [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, ...addrs] = await ethers.getSigners();
  });

  async function create_basic_contract() {
    // amounts, interest, supplies
    c_contract = await Contract.deploy(usdc_contract.address, owner.address, "", 1, [1000, 2000], [200, 300], [1, 20], "", "");
    return c_contract;
  }

  describe("Deployment", function () {

    /*
    it('Test CampaignFactory, Owner should work properly', async function() {
        FactoryContract = await ethers.getContractFactory('CrowdLoanFactory');
        f_contract = await FactoryContract.deploy();
        fm_contract = await FeeManagerContract.deploy();
        var cc01 = await f_contract.connect(owner).create_crowd_loan(fm_contract.address, "", 1000, 1, [1000, 2000, 3000], [20, 30, 40], [10, 20, 30]);
        var cc01 = await f_contract.get_crowd_loan_owner(0);
        expect(cc01).to.equal(owner.address);
    });
    */

    it("Should set the right owner", async function () {
      c_contract = await create_basic_contract()
      expect(await c_contract.owner()).to.equal(owner.address);
    });

    it("Amount and interest array of different length should fail. ", async function () {
      await expect(Contract.deploy(usdc_contract.address, owner.address, "", 1, [10, 20, 30, 40], [200, 300, 400], [10, 20, 30], "", "")).to.be.revertedWith("Amounts and interests length mismatch. ");
    });

    it("Supplies and interest array of different length should fail. ", async function () {
      await expect(Contract.deploy(usdc_contract.address, owner.address, "", 1, [1000, 2000, 3000], [200, 300, 400], [10, 20, 30, 40], "", "")).to.be.revertedWith("Supplies and interests length mismatch. ");
    });

    it("Amount less than minimal should fail. ", async function () {
      await expect(Contract.deploy(usdc_contract.address, owner.address, "", 1, [9, 2000, 3000], [200, 300, 400], [10, 20, 30], "", "")).to.be.revertedWith("Amount is less than minimal. ");
    });

    it("Interest less than minimal should fail. ", async function () {
      await expect(Contract.deploy(usdc_contract.address, owner.address, "", 1, [1000, 2000, 3000], [9, 300, 400], [10, 20, 30], "", "")).to.be.revertedWith("Interest is less than minimal. ");
    });
  });
});
