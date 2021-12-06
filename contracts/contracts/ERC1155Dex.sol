// SPDX-License-Identifier: GPL-3.0	
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ERC1155Dex is ERC1155 {

    uint256 public constant MIN_PRICE = 1000;
    Order[] public orders;
    uint256 public order_count = 0;
    uint256 public deadline;
    bool public is_funded = false;

    enum OrderType { BID, ASK }

    struct Order {
        uint256 order_id;
        OrderType order_type;
        uint256 nft_id;
        uint256 price;
        bool completed;
        address maker;
    }

    event OrderPosted(uint256 order_id, OrderType order_type, uint256 nft_id, uint256 price, address maker);
    event OrderCanceled(uint256 order_id);
    event OrderCalled(uint256 order_id, address taker);

    constructor(string memory _uri, uint256 _d) ERC1155(_uri) { 
        deadline = _d;
     }

    function post_ask(uint256 nft_id, uint256 price) campaignOpen campaignNotFunded  external returns(uint256 order_id) {
        require(price >= MIN_PRICE, 'Price is less than minimal. ');

        _burn(_msgSender(), nft_id, 1);

        order_id = order_count;
        orders.push(Order(order_id, OrderType.ASK, nft_id, price, false, _msgSender()));
        order_count++;

        emit OrderPosted(order_id, OrderType.ASK, nft_id, price, _msgSender());
    }

    function cancel_ask(uint256 order_id) external {
        Order storage order = orders[order_id];
        require(!order.completed, 'Order is completed. ');
        require(order.maker == _msgSender(), 'You are not the maker. ');

        _mint(msg.sender, order.nft_id, 1, "");

        order.completed = true;

        emit OrderCanceled(order_id);
    }

    function call_ask(uint256 order_id) campaignOpen campaignNotFunded payable external {
        Order storage order = orders[order_id];
        require(!order.completed, 'Order is completed. ');
        require(order.maker != _msgSender(), 'You are the maker. ');
        require(msg.value >= order.price, 'Not enough money sent. ');

        _mint(msg.sender, order.nft_id, 1, "");
        payable(order.maker).transfer(order.price);
        order.completed = true;

        emit OrderCalled(order_id, _msgSender());
    }

    function post_bid(uint256 nft_id) campaignOpen campaignNotFunded  payable external returns(uint256 order_id) {
        require(msg.value >= MIN_PRICE, 'Price is less than minimal. ');

        order_id = order_count;
        orders.push(Order(order_id, OrderType.BID, nft_id, msg.value, false, _msgSender()));
        order_count++;

        emit OrderPosted(order_id, OrderType.BID, nft_id, msg.value, _msgSender());
    }

    function cancel_bid(uint256 order_id) external {
        Order storage order = orders[order_id];
        require(!order.completed, 'Order is completed. ');
        require(order.maker == _msgSender(), 'You are not the maker. ');

        payable(_msgSender()).transfer(order.price);

        order.completed = true;

        emit OrderCanceled(order_id);
    }

    function call_bid(uint256 order_id) campaignOpen campaignNotFunded payable external {
        Order storage order = orders[order_id];
        require(!order.completed, 'Order is completed. ');
        require(order.maker != _msgSender(), 'You are the maker. ');

        _burn(_msgSender(), order.nft_id, 1);
        _mint(order.maker, order.nft_id, 1, "");
        payable(_msgSender()).transfer(order.price);

        order.completed = true;

        emit OrderCalled(order_id, _msgSender());
    }

    modifier campaignOpen() {
        require(block.timestamp < deadline, 'Campaign is closed. ');
        _;
    }

    modifier campaignClosed() {
        require(block.timestamp >= deadline, 'Campaign is open. ');
        _;
    }

    modifier campaignFunded() {
        require(is_funded, 'Campaign not funded. ');
        _;
    }

    modifier campaignNotFunded() {
        require(!is_funded, 'Campaign is funded. ');
        _;
    }

    receive() payable external {
        if (msg.value > 0) payable(msg.sender).transfer(msg.value);
    }

    fallback() payable external {
        if (msg.value > 0) payable(msg.sender).transfer(msg.value);
    }
}
