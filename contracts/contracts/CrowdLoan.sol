// SPDX-License-Identifier: GPL-3.0	
pragma solidity ^0.8.0;

import "./CampaignBase.sol";

contract CrowdLoan is CampaignBase {

    using SafeMath for uint256;

    uint256 public constant MIN_INTEREST = 100;
    mapping (uint256 => Loan) public id_loan;
    uint256 public total_debt = 0;
    uint256 public debt_deposited_balance = 0;

    struct Loan {
        uint256 interest;
        uint256 amount;
        uint256 total_supply;
        uint256 current_supply;
    }

    event LoanSupplyIncreased(uint256 id, uint256 amount);
    event LoanBought(address sender, uint256 id, uint256 amount, uint256 funding_balance);
    event DebtDeposited(uint256 value, uint256 debt_deposited_balance);
    event LoanClaimed(address sender, uint256 id, uint256 amount, uint256 claimed_amount);

    constructor(ERC20 _usdc_contract, address creator, string memory _uri, uint256 number_of_days, uint256[] memory amounts, uint256[] memory interests, uint256[] memory supplies, string memory title, string memory image_url) CampaignBase(_usdc_contract, creator, _uri, number_of_days, title, image_url) {
        require(amounts.length == interests.length, "Amounts and interests length mismatch. ");
        require(supplies.length == interests.length, "Supplies and interests length mismatch. ");
        require(amounts.length > 0, 'Must be some loan. ');

        for (uint256 i = 0; i < amounts.length; i++) {
            require(interests[i] >= MIN_INTEREST, 'Interest is less than minimal. ');
            require(amounts[i] >= MIN_PRICE, 'Amount is less than minimal. ');
            Loan storage loan = id_loan[i];
            loan.interest = interests[i];
            loan.total_supply = supplies[i];
            loan.amount = amounts[i];
            ids.push(i);

            funding_goal += loan.amount.mul(loan.total_supply);
        }

        amount_count = amounts.length;

        // TODO collateral and the checks
    }
}