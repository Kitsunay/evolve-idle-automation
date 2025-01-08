import { Game } from "../game";
import { GameUtils } from "../game-utils";

export class MarketResourceItem {
    public readonly resourceId: string;
    public readonly element: HTMLElement;

    constructor(resourceId: string) {
        this.resourceId = resourceId;
        this.element = document.getElementById(resourceId);
    }

    public get sellTradeCount(): number {
        let tradeCount = this.tradeCount;
        return tradeCount < 0 ? -tradeCount : 0;
    }

    public get buyTradeCount(): number {
        let tradeCount = this.tradeCount;
        return tradeCount > 0 ? tradeCount : 0;
    }

    /**
     * Returns trade count, positive numbers are buy trades, negative numbers are sell trades
    */
    public get tradeCount(): number {
        let tradeCountElement = this.element.querySelector('.trade .current');
        let tradeCountString = tradeCountElement.textContent;
        return parseInt(tradeCountString);
    }

    public get buyPricePerTrade(): number {
        return this.pricePerTrade(this.addButton);
    }

    public get sellPricePerTrade(): number {
        return this.pricePerTrade(this.subButton);
    }

    private pricePerTrade(tradeButton: Element): number {
        // Go to parent element
        let buttonRootElement = tradeButton.parentElement.parentElement;

        // Redirect to tooltip with price
        let priceElement = buttonRootElement.querySelector('.tooltip-content');

        // Parse out price
        let priceString = priceElement.textContent;
        let price = parseFloat(priceString.split('$')[1]);

        return price;
    }

    public get tradedAmount(): number {
        // Read the amount of resources that are actually being traded from tooltip
        let resourceBreakdown = Game.Resources.getConsumptionBreakdown(this.resourceId);
        let tradedAmount = resourceBreakdown.find((x) => x.name === 'Trade')?.amount ?? 0;

        return tradedAmount;
    }

    public get amountPerTrade(): number {
        if (this.tradeCount === 0) {
            return this.getAmountPerTradeFromAddButtonTooltip();
        }

        return this.getAmountPerTradeFromTradedAmount();
    }

    private getAmountPerTradeFromAddButtonTooltip(): number {
        // Get a button
        let tradeButton = this.addButton;

        // Redirect to button tooltip with amount
        let buttonRootElement = tradeButton.parentElement.parentElement;
        let priceElement = buttonRootElement.querySelector('.tooltip-content');

        // Parse out amount
        let amountString = priceElement.textContent;
        let amount = parseFloat(amountString.split(' ')[1]);

        return amount;
    }

    private getAmountPerTradeFromTradedAmount(): number {
        let tradeCount = this.tradeCount;
        let tradedAmount = this.tradedAmount;

        return tradedAmount / tradeCount;
    }

    public get addButton(): HTMLElement {
        return this.element.querySelector('.add');
    }

    public get subButton(): HTMLElement {
        return this.element.querySelector('.sub');
    }
}