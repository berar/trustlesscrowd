//SPDX-License-Identifier: GPL-3.0	
pragma solidity ^0.8.0;

import "./CampaignBase.sol";

contract Campaign is CampaignBase {

    using SafeMath for uint256;

    mapping (uint256 => Reward) public id_reward;
    mapping (address => string) infos;

    struct Reward {
        uint256 price;
        uint256 collateral;
        uint256 total_supply;
        uint256 current_supply;
    }

    event RewardSupplyIncreased(uint256 id, uint256 amount);
    event RewardBought(address sender, uint256 id, uint256 amount, uint256 funding_balance);
    event RewardClaimed(address sender, uint256 id, uint256 amount);

    constructor(ERC20 _usdc_contract, address creator, string memory _uri, uint256 number_of_days, uint256[] memory amounts, uint256[] memory supplies, string memory _title, string memory _image_url) CampaignBase(_usdc_contract, creator, _uri, number_of_days, _title, _image_url) {
        require(amounts.length == supplies.length, "Amounts and prices length mismatch. ");
        require(amounts.length > 0, 'Must be some reward. ');

        for (uint256 i = 0; i < amounts.length; ++i) {
            require(amounts[i] >= MIN_PRICE, 'Price is less than minimal. ');
            Reward storage reward = id_reward[i];
            reward.price = amounts[i];
            reward.total_supply = supplies[i];
            reward.collateral = amounts[i].mul(2);
            ids.push(i);

            funding_goal += reward.price.mul(reward.total_supply);
        }
        amount_count = amounts.length;
    }

    function deposit_collateral() external campaignOpen onlyOwner {
        require(!is_deposited, 'Collateral already deposited. ');
        require(funding_goal <= usdc_contract.allowance(msg.sender, address(this)), 'Collateral amount does not equal to msg.value. ');

        is_deposited = true;
        require(usdc_contract.transferFrom(msg.sender, address(this), funding_goal), 'Could not transfer collateral. ');

        emit CollateralDeposited(msg.sender, funding_goal);
    }

    function buy_reward(uint256 id) campaignOpen external {
        require(id < amount_count, 'No such id. ');
        require(is_deposited, 'Owner did not deposit collateral. ');
        require(!is_funded, 'Campaign already funded. ');
        Reward storage reward = id_reward[id];
        require(reward.collateral <= usdc_contract.allowance(msg.sender, address(this)), 'Not enough money sent. ');
        require(reward.total_supply > reward.current_supply, 'Supply exceeded. ');

        _mint(msg.sender, id, 1, "");
        reward.current_supply += 1;
        funding_balance += reward.price;
        if (funding_balance == funding_goal) 
            is_funded = true;

        require(usdc_contract.transferFrom(msg.sender, address(this), reward.collateral), 'Could not transfer collateral. ');
        emit RewardBought(msg.sender, id, reward.collateral, funding_balance);
    }

    function increase_reward_supply(uint256 id, uint256 amount) onlyOwner campaignOpen external {
        require(id < amount_count, 'No such id. ');

        Reward storage reward = id_reward[id];
        uint256 total_amount = amount.mul(reward.price);
        require(total_amount <= usdc_contract.allowance(msg.sender, address(this)), 'Not enough collateral sent. ');
        reward.total_supply += amount;
        funding_goal += total_amount;

        require(usdc_contract.transferFrom(msg.sender, address(this), total_amount), 'Could not transfer collateral. ');
        emit RewardSupplyIncreased(id, amount);
    }

    function claim_reward(uint256 id, uint256 amount) external campaignFunded { // TODO campaignClosed ? 
        require(id < amount_count, 'No such id. ');

        _burn(_msgSender(), id, amount);
        claimed_count += amount;

        Reward storage reward = id_reward[id];
        require(usdc_contract.transfer(owner(), amount.mul(reward.collateral)), 'Error transfering to owner. ');
        require(usdc_contract.transfer(msg.sender, amount.mul(reward.price)), 'Error transfering to burner. ');

        emit RewardClaimed(msg.sender, id, amount);
    }

    function send_encrypted_info(string memory info, uint256 id) external campaignFunded { // TODO campaignClosed ? 
        require(balanceOf(msg.sender, id) > 0, "You do not have the reward. ");
        infos[msg.sender] = info;
    }
}