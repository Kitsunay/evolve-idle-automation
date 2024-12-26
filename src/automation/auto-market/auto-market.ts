import { Game } from "../../game/game";
import { MarketResourceItem } from "../../game/market/market-resource-item";
import { Automation } from "../automation";
import { AutoMarketInterface } from "./auto-market-interface";
import { AutoMarketState } from "./auto-market-state";

export class AutoMarket extends Automation<AutoMarketState> {
    protected LOCAL_STORAGE_KEY: string = "auto-market";
    protected state: AutoMarketState = { unlocked: false, items: [] };

    tick(): void {
        // Only run if Market is unlocked
        if (!Game.Market.isUnlocked) {
            console.debug("Market is not unlocked");
            return;
        }

        let money = Game.Resources.getCount('resMoney');
        let maxMoney = Game.Resources.getMaxCount('resMoney');
        let capRatio = money / maxMoney;
        let income = Game.Resources.getProduction('resMoney');

        let resources: MarketResourceItem[] = Game.Market.getResources();

        let soldResources = resources.filter((resource) => resource.sellTradeCount > 0);
        let boughtResources = resources.filter((resource) => resource.buyTradeCount > 0);

        let autoBuyableResources = resources.filter((resource) => this.state.items.some((item) =>
            item.resourceId === resource.resourceId &&
            item.buyEnabled &&
            resource.sellTradeCount === 0)); // Don't consider resources that are already in a sell trade for buying
        let autoSellableResources = resources.filter((resource) => this.state.items.some((item) =>
            item.resourceId === resource.resourceId &&
            item.sellEnabled &&
            resource.buyTradeCount === 0)); // Don't consider resources that are already in a buy trade for selling

        // An attempt to minimize spaghetti after Auto-Worker fiasco
        if (this.tryAddBuyHighFunds(autoBuyableResources, soldResources, capRatio, income)) {
            return; // Only one trade route per tick
        }

        // REMOVE BUY
        if (this.tryRemoveBuyBoughtResourceIsFull(boughtResources)) {
            return; // Only one trade route per tick
        }

        if (this.tryRemoveBuyResourceNotAutoBuyable(boughtResources, autoBuyableResources)) {
            return; // Only one trade route per tick
        }

        if (this.tryRemoveBuyLowFunds(boughtResources, capRatio, income)) {
            return; // Only one trade route per tick
        }

        // REMOVE SELL
        if (this.tryRemoveSellTradeResourceProductionIsNegative(soldResources)) {
            return; // Only one trade route per tick
        }

        if (this.tryRemoveSellTradeResourceNotAutoSellable(resources, autoSellableResources)) {
            return; // Only one trade route per tick
        }

        if (this.tryRemoveSellTradeResourceNotFull(soldResources)) {
            return; // Only one trade route per tick
        };

        // ADD SELL
        if (this.tryAddSellResourceIsFull(autoSellableResources, soldResources)) {
            return; // Only one trade route per tick
        }
    }

    updateUI() {
        // Auto-Discovery: Before full UI update, check if there are any new jobs to automate
        // TODO: Trigger auto-discovery only after research/building purchase?
        this.runAutoDiscovery();

        for (const item of this.state.items) {
            AutoMarketInterface.refreshBuyButton(item.resourceId, item.buyEnabled, () => {
                item.buyEnabled = !item.buyEnabled;
                this.saveState();
                this.updateUI();
            });

            AutoMarketInterface.refreshSellButton(item.resourceId, item.sellEnabled, () => {
                item.sellEnabled = !item.sellEnabled;
                this.saveState();
                this.updateUI();
            });
        }
    }

    runAutoDiscovery() {
        let resources: MarketResourceItem[] = Game.Market.getResources();

        // Add in resources that are not present in the configuration array
        for (const resource of resources) {
            if (!this.state.items.some(x => x.resourceId === resource.resourceId)) { // If none of the resourceIds in configuration match the current resource
                // Add a new configuration item
                this.state.items.push({
                    resourceId: resource.resourceId,
                    sellEnabled: false,
                    buyEnabled: false
                });
            }
        }
    }

    private tryAddBuyHighFunds(autoBuyableResources: MarketResourceItem[], soldResources: MarketResourceItem[], storedMoneyRatio: number, income: number): MarketResourceItem {
        // TODO: Ratio could be configurable?
        if (storedMoneyRatio < 0.9 || income < 0) { // There is not enough money to buy
            return undefined;
        }

        // Filter out resources that are already full
        autoBuyableResources = autoBuyableResources.filter((resource) => Game.Resources.getCount(resource.resourceId) / Game.Resources.getMaxCount(resource.resourceId) < 0.99);

        // Find out how many trades each resource has, only resources with min trades are considered for the next auto-buy trade
        let minTrades = autoBuyableResources.map((resource) => resource.buyTradeCount).reduce((min, next) => {console.log('Math.min(min, next)', min, next, Math.min(min, next)); return Math.min(min, next);}, Number.MAX_VALUE);
        autoBuyableResources = autoBuyableResources.filter((resource) => resource.buyTradeCount <= minTrades);

        // Filter out resources that are too expensive for now
        autoBuyableResources = autoBuyableResources.filter((resource) => resource.buyPrice < income && Game.Resources.getCount(resource.resourceId) / Game.Resources.getMaxCount(resource.resourceId) < 0.99);

        // Single out a resource that fits in current budget and is not capped
        let targetResource: MarketResourceItem = autoBuyableResources.length > 0 ? autoBuyableResources[0] : undefined;

        if (!targetResource) { // Buying stuff is outside of our budget
            return undefined;
        }

        // Now check if I need to make room for trades by removing the least valuable sell trade
        let numFreeTrades = Game.Market.freeTradeRouteCount;

        if (numFreeTrades > 0) {
            Game.Market.addBuyTrade(targetResource);
            return targetResource;
        }

        if (soldResources.length === 0) { // We do not have any sell trades to free up
            return undefined;
        }

        // Get the least valuable sell trade
        let lowValueResource = this.getLeastValuableSellResource(soldResources);

        // Final check, if total cost of removing the sell trade and buying a new one is less than the income
        if (targetResource.buyPrice + lowValueResource.sellPrice < income) {
            Game.Market.subSellTrade(lowValueResource);
            Game.Market.addBuyTrade(targetResource);
            return targetResource;
        }

        return undefined;
    }

    private tryRemoveBuyBoughtResourceIsFull(boughtResources: MarketResourceItem[]): MarketResourceItem {
        if (boughtResources.length === 0) {
            return undefined;
        }

        for (const resource of boughtResources) {
            if (Game.Resources.getCount(resource.resourceId) / Game.Resources.getMaxCount(resource.resourceId) > 0.99) {
                Game.Market.subBuyTrade(resource);
                return resource;
            }
        }

        return undefined;
    }

    private tryRemoveBuyResourceNotAutoBuyable(boughtResources: MarketResourceItem[], autoBuyableResources: MarketResourceItem[]): MarketResourceItem {
        if (boughtResources.length === 0) {
            return undefined;
        }

        for (const resource of boughtResources) {
            if (resource.buyTradeCount > 0 && !autoBuyableResources.some((autoBuyableResource) => autoBuyableResource.resourceId === resource.resourceId)) {
                Game.Market.subBuyTrade(resource);
                return resource;
            }
        }

        return undefined;
    }

    private tryRemoveBuyLowFunds(boughtResources: MarketResourceItem[], storedMoneyRatio: number, income: number): MarketResourceItem {
        if (boughtResources.length === 0) {
            return undefined;
        }

        if (storedMoneyRatio > 0.9 && income > 0) { // If we have more than 50% of our money storage and have some income, we don't need to remove trades
            return undefined;
        }

        // Pick resource with most trades
        let maxTrades = boughtResources.map((resource) => resource.buyTradeCount).reduce((max, next) => Math.max(max, next), 0);

        if (maxTrades > 0) {
            for (const resource of boughtResources) {
                if (resource.buyTradeCount === maxTrades) {
                    Game.Market.subBuyTrade(resource);
                    return resource;
                }
            }
        }

        return undefined;
    }

    private tryRemoveSellTradeResourceNotAutoSellable(resources: MarketResourceItem[], autoSellableResources: MarketResourceItem[]): MarketResourceItem {
        // Removal case: Resource is no longer auto-sellable and we have a sell trade for it
        for (const resource of resources) {
            if (resource.sellTradeCount > 0 && !autoSellableResources.some((autoSellableResource) => autoSellableResource.resourceId === resource.resourceId)) {
                Game.Market.subSellTrade(resource);
                return resource;
            }
        }

        return undefined;
    }

    private tryRemoveSellTradeResourceNotFull(soldResources: MarketResourceItem[]): MarketResourceItem {
        if (soldResources.length === 0) {
            return undefined;
        }

        for (const resource of soldResources) {
            let resourceCount = Game.Resources.getCount(resource.resourceId);
            let resourceMax = Game.Resources.getMaxCount(resource.resourceId);
            let ratio = resourceCount / resourceMax;

            if (ratio < 0.99) {
                Game.Market.subSellTrade(resource);
                return resource;
            }
        }

        return undefined;
    }

    private tryRemoveSellTradeResourceProductionIsNegative(soldResources: MarketResourceItem[]): MarketResourceItem {
        if (soldResources.length === 0) {
            return undefined;
        }

        for (const resource of soldResources) {
            if (Game.Resources.getProduction(resource.resourceId) < 0) {
                Game.Market.subSellTrade(resource);
                return resource;
            }
        }

        return undefined;
    }

    tryAddSellResourceIsFull(autoSellableResources: MarketResourceItem[], soldResources: MarketResourceItem[]): MarketResourceItem {
        if (autoSellableResources.length === 0) {
            return undefined;
        }

        // Get resources that are full
        let fullResources = autoSellableResources.filter((resource) => Game.Resources.getCount(resource.resourceId) / Game.Resources.getMaxCount(resource.resourceId) > 0.99);

        if (fullResources.length === 0) {
            return undefined;
        }

        // Get the most expensive resource that can be sold without going into negatives
        let sellTarget: MarketResourceItem = undefined;

        for (const resource of fullResources) {
            if (resource.tradeAmount > Game.Resources.getProduction(resource.resourceId)/* || resource.sellTradeCount === 100*/) { // 100 trades per resource is the cap, for reasons
                continue;
            }

            if (sellTarget === undefined || resource.sellPrice > sellTarget.sellPrice) {
                sellTarget = resource;
            }
        }

        if (sellTarget === undefined) { // Can't sell anything
            return undefined;
        }

        let freeTrades = Game.Market.freeTradeRouteCount;

        // If there are enough free trades, add the sell trade
        if (freeTrades > 0) {
            Game.Market.addSellTrade(sellTarget);
            return sellTarget;
        }

        // If there are no free trades but there are sell trades, remove the least valuable sell trade
        if (soldResources.length === 0) {
            return undefined;
        }

        // Get the least valuable sell trade
        let lowValueResource = this.getLeastValuableSellResource(soldResources);

        // Make sure it makes sense to remove the least valuable sell trade
        if (lowValueResource.sellPrice > sellTarget.sellPrice || lowValueResource.resourceId === sellTarget.resourceId) {
            return undefined;
        }

        Game.Market.subSellTrade(lowValueResource);
        Game.Market.addSellTrade(sellTarget);
        return sellTarget;
    }

    private getLeastValuableSellResource(soldResources: MarketResourceItem[]): MarketResourceItem {
        if (soldResources.length === 0) {
            return undefined;
        }

        return soldResources.reduce((min, next) => {
            if (min === undefined) {
                return next;
            }

            return min.sellPrice < next.sellPrice ? min : next;
        }, undefined);
    }
}