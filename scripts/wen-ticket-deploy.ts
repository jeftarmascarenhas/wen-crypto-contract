import { ethers } from "hardhat";

async function main() {
  const WenTicket = await ethers.getContractFactory("WenTicket");
  const wenTicket = await WenTicket.deploy();

  await wenTicket.deployed();

  console.log(`WenTicket ${wenTicket.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
