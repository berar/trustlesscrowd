//SPDX-License-Identifier: GPL-3.0	
pragma solidity ^0.8.0;

import "./ERC1155Dex.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract CampaignBase is ERC1155Dex, Ownable {

    using SafeMath for uint256;

    uint256[] public ids;
    ERC20 usdc_contract;
    uint256 public refund_count = 0;
    uint256 public funding_goal;
    uint256 public funding_balance;
    uint256 public amount_count;
    Comment[] public comments;
    uint256 public comment_count = 0;
    Update[] public updates;
    uint256 public update_count = 0;
    uint256 public claimed_count = 0;
    bool public is_deposited = false;
    string public title;
    string public image_url;

    struct Comment {
        address commentor;
        string content;
    }

    struct Update {
        uint256 timestamp;
        string content;
    }

    event Withdrawn(address sender, uint256 pool_balance);
    event Donated(address sender, uint256 value, uint256 funding_balance);
    event Refunded(address sender, uint256 id, uint256 amount);
    event CommentAdded(uint256 id, address commentor, string content);
    event CollateralDeposited(address owner, uint256 amount);
    event UpdateAdded(uint256 id, string content);

    constructor(ERC20 _usdc_contract, address creator, string memory _uri, uint256 number_of_days, string memory _title, string memory _image_url) ERC1155Dex(_uri, block.timestamp + (number_of_days * 1 days)) Ownable() {
        require(number_of_days > 0 && number_of_days <= 90, 'Improper days length. ');
        transferOwnership(creator);
        usdc_contract = _usdc_contract;
        title = _title;
        image_url = _image_url;
    }

    function withdraw() onlyOwner campaignClosed campaignFunded external {
        uint256 withdrawn_amount = funding_balance.mul(2);
        funding_balance = 0;
        require(usdc_contract.transfer(msg.sender, withdrawn_amount), 'Error making a withdraw transfer. ');
        emit Withdrawn(msg.sender, withdrawn_amount);
    }

    function get_comment(uint256 comment_id) view external returns(address, string memory) {
        require(comment_id < comment_count, 'No such comment. ');
        Comment storage comment = comments[comment_id];
        return (comment.commentor, comment.content);
    }

    function add_comment(string memory content) external {
        comments.push(Comment(msg.sender, content));
        emit CommentAdded(comment_count++, msg.sender, content);
    }

    function get_update(uint256 update_id) view external returns(string memory, uint256) {
        require(update_id < update_count, 'No such update. ');
        Update storage update = updates[update_id];
        return (update.content, update.timestamp);
    }

    function add_update(string memory content) onlyOwner external {
        updates.push(Update(block.timestamp, content));
        emit UpdateAdded(update_count++, content);
    }
}