require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    binance_testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [`a4b2bfb96a41d5c5f568d3749827244a0150c8771be107f88f188e087875eaed`]
    },
    binance_mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: [`a4b2bfb96a41d5c5f568d3749827244a0150c8771be107f88f188e087875eaed`]
    }, 
    matic_mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [`a4b2bfb96a41d5c5f568d3749827244a0150c8771be107f88f188e087875eaed`]
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
   sources: "./contracts",
   tests: "./test",
   cache: "./cache",
   artifacts: "./artifacts"
   },
   mocha: {
     timeout: 20000
   },
};
