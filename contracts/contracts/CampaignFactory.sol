// SPDX-License-Identifier: GPL-3.0	
pragma solidity ^0.8.0;

import './Campaign.sol';
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CampaignFactory {

    address public dev_addres = 0xa6EA5f350463EDf16e5d40Bf0DA0f2c3cfEC03e8;
    Campaign[] public deployed_campaigns;
    mapping(string => uint256) public uri_id;
    uint256 public campaign_count = 0;
    ERC20 usdc_contract;
    mapping(address => string) public nicknames;
    mapping(address => string) public avatars;

    constructor(address usdc_address) {
        usdc_contract = ERC20(usdc_address);
    }

    event CampaignCreated(uint256 id, address sender, string _uri, uint256 number_of_days, uint256[] amounts, uint256[] prices);

    function create_campaign(string memory _uri, uint256 number_of_days, uint256[] memory amounts, uint256[] memory prices, string memory title, string memory image_url) external {
        Campaign new_campaign = new Campaign(usdc_contract, msg.sender, _uri, number_of_days, prices, amounts, title, image_url);
        deployed_campaigns.push(new_campaign);
        uri_id[_uri] = campaign_count;

        emit CampaignCreated(campaign_count++, msg.sender, _uri, number_of_days, amounts, prices);
    }

    function get_campaign(uint256 campaign_id) view external returns(address) {
        require(campaign_id < campaign_count, 'No such campaign. ');
        Campaign campaign = deployed_campaigns[campaign_id];
        return address(campaign);
    }

    function set_nickname(string memory nickname) external {
        nicknames[msg.sender] = nickname;
    }

    function set_avatar(string memory image_url) external {
        avatars[msg.sender] = image_url;
    }

    function get_deployed_campaigns() public view returns(Campaign[] memory) {
        return deployed_campaigns;
    }

    function get_campaign_owner(uint256 id) external view returns(address) {
        return deployed_campaigns[id].owner();
    }

    function donate_to_dev() payable external {
        payable(dev_addres).transfer(msg.value);
    }

    receive() payable external {
        if (msg.value > 0) payable(msg.sender).transfer(msg.value);
    }

    fallback() payable external {
        if (msg.value > 0) payable(msg.sender).transfer(msg.value);
    }
}
