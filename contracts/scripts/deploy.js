
const hre = require("hardhat");

let owner;
let addr1;
let addr2;
let addr3;
let addr4;
let addr5;
let addr6;
let addr7;
let addrs;

async function main() {

  [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, ...addrs] = await ethers.getSigners(); 

  const Token = await hre.ethers.getContractFactory("USDCMock");
  const t = await Token.deploy();
  await t.deployed();
  console.log("Token deployed to:", t.address);
  
  const CFactory = await hre.ethers.getContractFactory("CampaignFactory");
  const cf = await CFactory.deploy(t.address);
  console.log("CFactory deployed to:", cf.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
