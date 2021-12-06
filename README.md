# TrustlessCrowd
Trustless and Serverless Crowdsourcing dApp with NFT Dex.

# Submission link

https://gateway.pinata.cloud/ipfs/QmPJ6MHfuJ17wbkXbSGFPH1e6bQfqF8CKmAfBePMkhBc3W

# Short pitch
## Pain
Traditional centralized crowdsourcing platforms are only available to people of certain countries and do not accept cryptocurrencies. They also require users to comply with the KYC process. That makes them permissible. The trust also must be placed to these centralized platforms. Their business model requires fees of up to 10% per transaction. The early bird contributors to the project can't trade with the potential rewards that they had purchased. 

## Target Audience
Dominated by males (61%), more than 50% of the audience is 24 to 35 years old. 11% of males are 50 years or older while the ratio of females from the same age group is almost half of it. When we compare males and females of the audience, both genders’ dominant age range is 24 to 35.

Crowdfunding audience is composed of individuals who are creative, curious, sensitive, and enthusiastic about life. They are natural entrepreneurs who love innovation, practicality, as well as giving back to the community. When they are spending time on social media, they follow the Business and Science world, like to have a good laugh and learn about the latest games.

## Solution
Meet TrustlessCrowd - Trustless and Serverless Crowdsourcing dApp with NFT Dex.

No KYC is required. Permissionless and Censorship-Resistant.

No Central Server. The Pages are Hosted on IPFS Through Pinata.Cloud. No Cookies or Tracking Also.

No Platform Fees. You Can Donate to Devs if You Wish.

Collateralized and Non-Custodian Swaps Play. Game Theory and the Code guarantee Trust.

Be an Early Bird to a Campaign. Earn in Native Cryptocurrencies By Trading on DEX.

# Recorded video demo of the project and small pitch
TODO

# Date when team began working on the project 
November 16th, 2021.

# Wallet(s) to send payment if the project wins
Ethereum Account: 0x76e637D494729aA89f1e977065b5c7f86862616F

# Person of contact for the judges in case there are any questions
Aleksandar Berar

aleksandar.berar@gmail.com

# Any additional docs the team wants to have reviewed

You can review the source code and the documentation found in this repository. 

If you wish to test the dApp, please request testnet USDT tokens via email. 

# Documentation on how to run the project

## Contracts

1. Make sure you have node and npm installed.
2. Clone this repository. 
3. Navigate into the contracts folder.
4. Run ```npm install```
5. To run tests, run ```npx hardhat test```
6. To deploy the contracts, first open hardhat.config.js and change the accounts variables to your own private keys. Then change the defaultNetwork accordingly. Then run ```npx hardhat run scripts/deploy.js```

## "Server"

To deploy the html files and host them serverless, open server/backend/templates/campaign_template.html, change tokenAddress value to be according ERC20 USDC token address. Change sampleCFAddress to point to CampaignFactory that you previously generated. Use pinata.cloud to upload this html. 

Then open server/backend/templates/index.html, change tokenAddress and cfAddress, just like in the previous steps. Change campaignTemplateUrl to point to the link that you got from pinata for campaign_template.html. Upload index.html to pinata.cloud and you just made a serverless dApp. 

You can also run this on your local machine with python and flask. First make sure that you follow the steps off of the first paragraph. Then make changes to the index.html file that were stated in the second paragraph. Install python3.6 and pip3. Then install flask, flask-limiter, flask-cors and setproctitle with pip3. To run the server, navigate into server folder and run ```python3.6 -m backend.app 5000```. 
