//SPDX-License-Identifier: GPL-3.0	
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDCMock is ERC20 {

    constructor() ERC20("USDT", "USDT") {
        _mint(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 1000 ether);
        _mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 1000 ether);
        _mint(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 1000 ether);
        _mint(0x90F79bf6EB2c4f870365E785982E1f101E93b906, 1000 ether);
        _mint(0x9c2F65B8e34Ec9Ad56a0BB249573bf031962A653, 1000 ether);
    }
}