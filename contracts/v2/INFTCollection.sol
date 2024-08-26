// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INFTCollection {
    function createNFT(address recipient, string memory tokenURI) external returns (uint256);
    // Función para obtener el contador de tokens (número de NFTs minteados)
    function tokenCounter() external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}