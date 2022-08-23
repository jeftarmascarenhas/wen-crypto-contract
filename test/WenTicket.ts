import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("WenCrypto", () => {
  async function deployWentCrypto() {
    const WenTicket = await ethers.getContractFactory("WenTicket");
    const wenTicket = await WenTicket.deploy();
    const accounts = await ethers.getSigners();
    const minValue = ethers.utils.parseEther("0.005");

    const [owner, ...othersAccounts] = accounts;

    return { wenTicket, owner, othersAccounts, minValue };
  }

  it("shouldn't mint ticket when saleIsActive is false", async function() {
    const { wenTicket, minValue, othersAccounts } = await loadFixture(
      deployWentCrypto
    );
    const [buyer1] = othersAccounts;
    const amount = 1;
    await expect(
      wenTicket.connect(buyer1).mintTicket(amount, { value: minValue })
    ).to.rejectedWith("Sale is not active");
  });

  it("should mint multiple ticket and pickWinner", async function() {
    const { wenTicket, minValue, othersAccounts } = await loadFixture(
      deployWentCrypto
    );
    const [buyer1, buyer2, buyer3, buyer4] = othersAccounts;
    const amount = 1;

    await wenTicket.flipSaleState();

    await wenTicket.connect(buyer1).mintTicket(amount, { value: minValue });
    await wenTicket
      .connect(buyer2)
      .mintTicket(amount + 1, { value: minValue.mul(2) });
    await wenTicket
      .connect(buyer3)
      .mintTicket(amount + 2, { value: minValue.mul(3) });
    await wenTicket
      .connect(buyer4)
      .mintTicket(amount + 4, { value: minValue.mul(5) });

    const buyers = await wenTicket.getBuyers();

    await wenTicket.pickWinner();

    const randomResult = await wenTicket.randomResult();

    expect(buyers).to.include(randomResult);
  });

  it("should to do withdraw to owner", async () => {
    const { wenTicket, owner, minValue, othersAccounts } = await loadFixture(
      deployWentCrypto
    );
    const [buyer1] = othersAccounts;

    await wenTicket.flipSaleState();

    await wenTicket.connect(buyer1).mintTicket(3, { value: minValue.mul(3) });

    const ownerBalance = await ethers.provider.getBalance(owner.address);
    const contractBalance = await ethers.provider.getBalance(wenTicket.address);

    await wenTicket.withdraw();

    const ownerBalanceUpdated = await ethers.provider.getBalance(owner.address);

    expect(ownerBalance.add(contractBalance)).to.greaterThanOrEqual(
      ownerBalanceUpdated
    );
  });
});
