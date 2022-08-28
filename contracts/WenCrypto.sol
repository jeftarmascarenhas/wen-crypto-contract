// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WenTicket is ERC721A, Ownable {
    event PickWinner(address winner);

    address public randomResult;

    uint16 public MAX_SUPPLY = 500;
    uint256 public PRICE = 5000000000000000;

    bool public saleIsActive = false;

    string private _baseTokenURI;

    address[] private buyers;

    struct Buyer {
        address winner;
        uint256 tokenId;
    }

    constructor() ERC721A("WenTicket", "WT") {}

    function mintTicket(uint16 amount) external payable {
        require(saleIsActive, "Sale is not active");
        require(
            msg.value >= PRICE * amount,
            "Not enough ETH for this transaction"
        );
        require(
            msg.sender == tx.origin,
            "Transaction from smart contract not allowed"
        );

        _safeMint(msg.sender, amount);
        _registerBuyer(amount);
    }

    function _registerBuyer(uint16 amount) internal {
        for (uint16 i = 0; i < amount; i++) {
            buyers.push(msg.sender);
        }
    }

    function getBuyers() external view returns (address[] memory) {
        return buyers;
    }

    function pickWinner() external onlyOwner {
        uint256 index = _randNumber(buyers.length);
        randomResult = buyers[index];

        emit PickWinner(randomResult);
    }

    function setPrice(uint256 newPrice) external onlyOwner {
        PRICE = newPrice;
    }

    function setSupply(uint16 newSupply) external onlyOwner {
        MAX_SUPPLY = newSupply;
    }

    function _randNumber(uint256 _mod) internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, block.difficulty, buyers)
                )
            ) % _mod;
    }

    function flipSaleState() external onlyOwner {
        saleIsActive = !saleIsActive;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory _tokenURI = super.tokenURI(tokenId);
        return
            bytes(_tokenURI).length > 0
                ? string(abi.encodePacked(_tokenURI, ".json"))
                : "";
    }

    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}
