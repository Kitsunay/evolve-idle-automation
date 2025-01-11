import { Game } from "../../game/game";
import { MarketResourceItem } from "../../game/market/market-resource-item";
import { Automation } from "../automation";
import { AutoMarketInterface } from "./auto-market-interface";
import { AutoMarketItem } from "./auto-market-item";
import { AutoMarketState } from "./auto-market-state";

export class AutoMarket extends Automation<AutoMarketState> {
    protected LOCAL_STORAGE_KEY: string = "auto-market";
    protected state: AutoMarketState = { unlocked: false, items: [] };

    tick(): void {
        // Only run if Market is unlocked
        if (!Game.Market.isUnlocked || !Game.Market.isTradeRouteUnlocked) {
            console.debug("Market is not unlocked");
            return;
        }

        let money = Game.Resources.getCount('resMoney');
        let maxMoney = Game.Resources.getMaxCount('resMoney');
        let capRatio = money / maxMoney;
        let income = Game.Resources.getProduction('resMoney');

        let resources: MarketResourceItem[] = Game.Market.getResources();
        let configuredResources = resources.map((resource) => { // Map tradable resources to their configuration
            return {
                config: this.state.items.find((item) => item.resourceId === resource.resourceId),
                resource: resource
            }
        });

        // Drop paused resources from affectable resources
        configuredResources = configuredResources.filter((configuredResource) => !configuredResource.config.paused);

        let soldResources = configuredResources.filter((configuredResource) => configuredResource.resource.sellTradeCount > 0);
        let boughtResources = configuredResources.filter((configuredResource) => configuredResource.resource.buyTradeCount > 0);

        // Don't consider resources that are already in a sell trade for buying
        let autoBuyableResources = configuredResources.filter((configuredResource) => configuredResource.config.buyEnabled && configuredResource.resource.sellTradeCount === 0);
        // Don't consider resources that are already in a buy trade for selling
        let autoSellableResources = configuredResources.filter((configuredResource) => configuredResource.config.sellEnabled && configuredResource.resource.buyTradeCount === 0);

        let buyTargetProductionResources = configuredResources.filter((configuredResource) => configuredResource.config.buyRate > 0);

        // An attempt to minimize spaghetti after Auto-Worker fiasco

        // ADD BUY
        if (capRatio > 0.9) { // TODO: I really, really dont like this condition, pls think of a better, very generic way to manage the market automation conditions
            if (this.tryAddBuyHighFunds(autoBuyableResources, soldResources, capRatio, income)) {
                return; // Only one trade route per tick
            }
        } else {
            if (this.tryAddBuyLowProduction(buyTargetProductionResources, soldResources, income)) {
                return; // Only one trade route per tick
            }
        }

        // REMOVE BUY
        if (this.tryRemoveBuyBoughtResourceIsFull(boughtResources)) {
            return; // Only one trade route per tick
        }

        if (this.tryRemoveBuyResourceNotAutoBuyable(boughtResources, autoBuyableResources)) {
            return; // Only one trade route per tick
        }

        if (capRatio <= 0.9) {
            if (this.tryRemoveBuyHighProduction(buyTargetProductionResources)) {
                return; // Only one trade route per tick
            }
        } else {
            if (this.tryRemoveBuyUnevenDistribution(autoBuyableResources, boughtResources, capRatio, income)) {
                return; // Only one trade route per tick
            }

            if (this.tryRemoveBuyLowFunds(boughtResources, capRatio, income)) {
                return; // Only one trade route per tick
            }
        }

        // REMOVE SELL
        if (this.tryRemoveSellTradeResourceProductionIsNegative(soldResources)) {
            return; // Only one trade route per tick
        }

        if (this.tryRemoveSellTradeResourceNotAutoSellable(configuredResources)) {
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

        AutoMarketInterface.updateUI({
            isVisible: /*this.state.unlocked*/ true, configItems: this.state.items,
            onBuy: this.decorateInterfaceListener((item: AutoMarketItem) => {
                item.buyEnabled = !item.buyEnabled;
            }),
            onSell: this.decorateInterfaceListener((item: AutoMarketItem) => {
                item.sellEnabled = !item.sellEnabled;
            }),
            onPause: this.decorateInterfaceListener((item: AutoMarketItem) => {
                item.paused = !item.paused;
            }),
            onBuyRateChange: this.decorateInterfaceListener((item: AutoMarketItem, value: number) => {
                value = value < 0 ? 0 : value; // No negative numbers
                item.buyRate = value;
            })
        });

        Game.Market.onResourceTabRefresh.addListener(() => {
            this.updateUI();
            console.debug('Auto-Market UI Refreshed, reason: Resource Tab Refresh');
        });
    }

    runAutoDiscovery() {
        let resources: MarketResourceItem[] = Game.Market.getResources();

        // Add in resources that are not present in the configuration array
        for (const resource of resources) {
            if (!this.state.items.some(x => x.resourceId === resource.resourceId)) { // If none of the resourceIds in configuration match the current resource
                // Add a new configuration item
                this.state.items.push({
                    resourceId: resource.resourceId,
                    paused: false,
                    sellEnabled: false,
                    buyEnabled: false,
                    buyRate: 0
                });
            }
        }
    }

    private tryAddBuyHighFunds(autoBuyableResources: { resource: MarketResourceItem, config: AutoMarketItem }[], soldResources: { resource: MarketResourceItem, config: AutoMarketItem }[], storedMoneyRatio: number, income: number): { resource: MarketResourceItem, config: AutoMarketItem } {
        // TODO: Ratio could be configurable?
        if (storedMoneyRatio < 0.9 || income < 0) { // There is not enough money to buy
            return undefined;
        }

        // Filter out resources that are already full
        autoBuyableResources = autoBuyableResources.filter((configuredResource) => Game.Resources.getCount(configuredResource.config.resourceId) / Game.Resources.getMaxCount(configuredResource.config.resourceId) < 0.99);

        // Find out how many trades each resource has, only resources with min trades are considered for the next auto-buy trade
        let minTrades = autoBuyableResources.map((configuredResource) => configuredResource.resource.buyTradeCount).reduce((min, next) => { return Math.min(min, next); }, Number.MAX_VALUE);
        autoBuyableResources = autoBuyableResources.filter((configuredResource) => configuredResource.resource.buyTradeCount <= minTrades);

        // Filter out resources that are too expensive for now
        autoBuyableResources = autoBuyableResources.filter((configuredResource) => configuredResource.resource.buyPricePerTrade < income && Game.Resources.getCount(configuredResource.config.resourceId) / Game.Resources.getMaxCount(configuredResource.config.resourceId) < 0.99);

        // Single out a resource that fits in current budget and is not capped
        let targetResource: { resource: MarketResourceItem, config: AutoMarketItem } = autoBuyableResources.length > 0 ? autoBuyableResources[0] : undefined;

        if (!targetResource) { // Buying stuff is outside of our budget
            return undefined;
        }

        // Now check if I need to make room for trades by removing the least valuable sell trade
        let numFreeTrades = Game.Market.freeTradeRouteCount;

        if (numFreeTrades > 0) {
            Game.Market.addBuyTrade(targetResource.resource);
            return targetResource;
        }

        if (soldResources.length === 0) { // We do not have any sell trades to free up
            return undefined;
        }

        // Get the least valuable sell trade
        let lowValueResource = this.getLeastValuableSellResource(soldResources);

        // Final check, if total cost of removing the sell trade and buying a new one is less than the income
        if (targetResource.resource.buyPricePerTrade + lowValueResource.resource.sellPricePerTrade < income) {
            Game.Market.subSellTrade(lowValueResource.resource);
            Game.Market.addBuyTrade(targetResource.resource);
            return targetResource;
        }

        return undefined;
    }

    private tryAddBuyLowProduction(buyTargetProductionResources: { resource: MarketResourceItem, config: AutoMarketItem }[], soldResources: { resource: MarketResourceItem, config: AutoMarketItem }[], income: number): { resource: MarketResourceItem, config: AutoMarketItem } {
        // Do this only if there is enough money
        if (income < 0) { // There is not enough money to buy
            return undefined;
        }

        // Check which resources have low production
        let eligibleResources = buyTargetProductionResources.filter((configuredResource) => Game.Resources.getProduction(configuredResource.config.resourceId) < configuredResource.config.buyRate);
        // Check which resources are not full
        eligibleResources = eligibleResources.filter((configuredResource) => Game.Resources.getCount(configuredResource.config.resourceId) / Game.Resources.getMaxCount(configuredResource.config.resourceId) < 0.99);

        // Collect final selection from resources with lowest amount of trades
        let minTrades = eligibleResources.map((configuredResource) => configuredResource.resource.buyTradeCount).reduce((min, next) => { return Math.min(min, next); }, Number.MAX_VALUE);
        eligibleResources = eligibleResources.filter((configuredResource) => configuredResource.resource.buyTradeCount <= minTrades);

        // Pick a resource that is affordable
        let targetResource = eligibleResources.find((configuredResource) => configuredResource.resource.buyPricePerTrade < income);

        if (!targetResource) { // Buying stuff is outside of our budget
            return undefined;
        }

        // Now check if I need to make room for trades by removing the least valuable sell trade
        let numFreeTrades = Game.Market.freeTradeRouteCount;

        if (numFreeTrades > 0) {
            Game.Market.addBuyTrade(targetResource.resource);
            return targetResource;
        }

        if (soldResources.length === 0) { // We do not have any sell trades to free up
            return undefined;
        }

        // Get the least valuable sell trade
        let lowValueResource = this.getLeastValuableSellResource(soldResources);

        // Final check, if total cost of removing the sell trade and buying a new one is less than the income
        if (targetResource.resource.buyPricePerTrade + lowValueResource.resource.sellPricePerTrade < income) {
            Game.Market.subSellTrade(lowValueResource.resource);
            Game.Market.addBuyTrade(targetResource.resource);
            return targetResource;
        }

        return targetResource;
    }

    private tryRemoveBuyHighProduction(buyTargetProductionResources: { config: AutoMarketItem; resource: MarketResourceItem; }[]): { config: AutoMarketItem; resource: MarketResourceItem; } {
        // Check which resources have high production after a trade would be removed
        let eligibleResources = buyTargetProductionResources.filter((configuredResource) => Game.Resources.getProduction(configuredResource.config.resourceId) - configuredResource.resource.amountPerTrade > configuredResource.config.buyRate);

        // Check which resources have buy trades active
        eligibleResources = eligibleResources.filter((configuredResource) => configuredResource.resource.buyTradeCount > 0);

        // Collect final selection from resources with highest amount of trades
        let maxTrades = eligibleResources.map((configuredResource) => configuredResource.resource.buyTradeCount).reduce((max, next) => { return Math.max(max, next); }, 0);
        eligibleResources = eligibleResources.filter((configuredResource) => configuredResource.resource.buyTradeCount >= maxTrades);

        // Pick a resource
        let targetResource = eligibleResources[0];

        if (!targetResource) { // No resources to remove
            return undefined;
        }

        Game.Market.subBuyTrade(targetResource.resource);
        return targetResource;
    }

    private tryRemoveBuyUnevenDistribution(
        autoBuyableResources: { resource: MarketResourceItem, config: AutoMarketItem }[],
        boughtResources: { resource: MarketResourceItem, config: AutoMarketItem }[],
        capRatio: number,
        income: number
    ): { resource: MarketResourceItem, config: AutoMarketItem } {
        // Do this only if there is enough money
        if (capRatio < 0.9 || income < 0) { // There is not enough money to buy
            return undefined;
        }

        // Filter out resources that are already full
        autoBuyableResources = autoBuyableResources.filter((configuredResource) => Game.Resources.getCount(configuredResource.config.resourceId) / Game.Resources.getMaxCount(configuredResource.config.resourceId) < 0.99);

        // Look for resources with lowest number of trades
        let minTrades = autoBuyableResources.map((configuredResource) => configuredResource.resource.buyTradeCount).reduce((min, next) => { return Math.min(min, next); }, Number.MAX_VALUE);
        autoBuyableResources = autoBuyableResources.filter((configuredresource) => configuredresource.resource.buyTradeCount <= minTrades);

        // Find resource with lowest number of trades that is a valid auto-buy candidate
        let addTarget: { resource: MarketResourceItem, config: AutoMarketItem } = autoBuyableResources.length > 0 ? autoBuyableResources[0] : undefined;

        // Now find a resource with most trades
        let maxTrades = boughtResources.map((configuredresource) => configuredresource.resource.buyTradeCount).reduce((max, next) => Math.max(max, next), 0);
        boughtResources = boughtResources.filter((configuredresource) => configuredresource.resource.buyTradeCount >= maxTrades);

        let subTarget: { resource: MarketResourceItem, config: AutoMarketItem } = boughtResources.length > 0 ? boughtResources[0] : undefined;

        // If the difference between the two is greater than 1, remove the resource with most trades
        if (maxTrades - minTrades > 1) {
            Game.Market.subBuyTrade(subTarget.resource);
        }

        // If buying the new resource would not put us into negative income, buy it
        if (addTarget && addTarget.resource.buyPricePerTrade < income + subTarget.resource.buyPricePerTrade) {
            Game.Market.addBuyTrade(addTarget.resource);
            return subTarget;
        }
    }

    private tryRemoveBuyBoughtResourceIsFull(boughtResources: { resource: MarketResourceItem, config: AutoMarketItem }[]): { resource: MarketResourceItem, config: AutoMarketItem } {
        if (boughtResources.length === 0) {
            return undefined;
        }

        for (const configurableResource of boughtResources) {
            if (Game.Resources.getCount(configurableResource.config.resourceId) / Game.Resources.getMaxCount(configurableResource.config.resourceId) > 0.99) {
                Game.Market.subBuyTrade(configurableResource.resource);
                return configurableResource;
            }
        }

        return undefined;
    }

    private tryRemoveBuyResourceNotAutoBuyable(boughtResources: { resource: MarketResourceItem, config: AutoMarketItem }[], autoBuyableResources: { resource: MarketResourceItem, config: AutoMarketItem }[]): { resource: MarketResourceItem, config: AutoMarketItem } {
        if (boughtResources.length === 0) {
            return undefined;
        }

        for (const configurableResource of boughtResources) {
            if (configurableResource.resource.buyTradeCount > 0 &&
                !autoBuyableResources.some((autoBuyableResource) => autoBuyableResource.resource.resourceId === configurableResource.resource.resourceId) &&
                Game.Resources.getProduction(configurableResource.config.resourceId) - configurableResource.resource.amountPerTrade > configurableResource.config.buyRate) {

                Game.Market.subBuyTrade(configurableResource.resource);
                return configurableResource;
            }
        }

        return undefined;
    }


    private tryRemoveBuyLowFunds(boughtResources: { resource: MarketResourceItem, config: AutoMarketItem }[], storedMoneyRatio: number, income: number): { resource: MarketResourceItem, config: AutoMarketItem } {
        if (boughtResources.length === 0) {
            return undefined;
        }

        if (storedMoneyRatio > 0.9 && income > 0) { // If we have more than 50% of our money storage and have some income, we don't need to remove trades
            return undefined;
        }

        // Pick resource with most trades
        let maxTrades = boughtResources.map((configuredResource) => configuredResource.resource.buyTradeCount).reduce((max, next) => Math.max(max, next), 0);

        if (maxTrades > 0) {
            for (const configurableResource of boughtResources) {
                if (configurableResource.resource.buyTradeCount === maxTrades) {
                    Game.Market.subBuyTrade(configurableResource.resource);
                    return configurableResource;
                }
            }
        }

        return undefined;
    }

    private tryRemoveSellTradeResourceNotAutoSellable(resources: { resource: MarketResourceItem, config: AutoMarketItem }[]): { resource: MarketResourceItem, config: AutoMarketItem } {
        // Removal case: Resource is no longer auto-sellable and we have a sell trade for it
        for (const configuredResource of resources) {
            if (configuredResource.resource.sellTradeCount > 0 && !configuredResource.config.sellEnabled) {
                Game.Market.subSellTrade(configuredResource.resource);
                return configuredResource;
            }
        }

        return undefined;
    }

    private tryRemoveSellTradeResourceNotFull(soldResources: { resource: MarketResourceItem, config: AutoMarketItem }[]): { resource: MarketResourceItem, config: AutoMarketItem } {
        if (soldResources.length === 0) {
            return undefined;
        }

        for (const configuredResource of soldResources) {
            let resourceCount = Game.Resources.getCount(configuredResource.config.resourceId);
            let resourceMax = Game.Resources.getMaxCount(configuredResource.config.resourceId);
            let ratio = resourceCount / resourceMax;

            if (ratio < 0.99) {
                Game.Market.subSellTrade(configuredResource.resource);
                return configuredResource;
            }
        }

        return undefined;
    }

    private tryRemoveSellTradeResourceProductionIsNegative(soldResources: { resource: MarketResourceItem, config: AutoMarketItem }[]): { resource: MarketResourceItem, config: AutoMarketItem } {
        if (soldResources.length === 0) {
            return undefined;
        }

        for (const configuredResource of soldResources) {
            if (Game.Resources.getProduction(configuredResource.resource.resourceId) < 0) {
                Game.Market.subSellTrade(configuredResource.resource);
                return configuredResource;
            }
        }

        return undefined;
    }

    tryAddSellResourceIsFull(autoSellableResources: { resource: MarketResourceItem, config: AutoMarketItem }[], soldResources: { resource: MarketResourceItem, config: AutoMarketItem }[]): { resource: MarketResourceItem, config: AutoMarketItem } {
        if (autoSellableResources.length === 0) {
            return undefined;
        }

        // Get resources that are full
        let fullResources = autoSellableResources.filter((configuredResource) => Game.Resources.getCount(configuredResource.resource.resourceId) / Game.Resources.getMaxCount(configuredResource.resource.resourceId) > 0.99);

        if (fullResources.length === 0) {
            return undefined;
        }

        // Get the most expensive resource that can be sold without going into negatives
        let sellTarget: { resource: MarketResourceItem, config: AutoMarketItem } = undefined;

        for (const configuredResource of fullResources) {
            if (configuredResource.resource.amountPerTrade > Game.Resources.getProduction(configuredResource.resource.resourceId)) { // Don't sell if production would go negative
                continue;
            }

            if (configuredResource.resource.sellTradeCount >= Game.Market.maxTradeRoutesPerResource) { // There is a trade route limit per resource, for reasons
                continue;
            }

            if (sellTarget === undefined || configuredResource.resource.sellPricePerTrade > sellTarget.resource.sellPricePerTrade) {
                sellTarget = configuredResource;
            }
        }

        if (sellTarget === undefined) { // Can't sell anything
            return undefined;
        }

        let freeTrades = Game.Market.freeTradeRouteCount;

        // If there are enough free trades, add the sell trade
        if (freeTrades > 0) {
            Game.Market.addSellTrade(sellTarget.resource);
            return sellTarget;
        }

        // If there are no free trades but there are sell trades, remove the least valuable sell trade
        if (soldResources.length === 0) {
            return undefined;
        }

        // Get the least valuable sell trade
        let lowValueResource = this.getLeastValuableSellResource(soldResources);

        // Make sure it makes sense to remove the least valuable sell trade
        if (lowValueResource.resource.sellPricePerTrade > sellTarget.resource.sellPricePerTrade || lowValueResource.resource.resourceId === sellTarget.resource.resourceId) {
            return undefined;
        }

        Game.Market.subSellTrade(lowValueResource.resource);
        Game.Market.addSellTrade(sellTarget.resource);
        return sellTarget;
    }

    private getLeastValuableSellResource(soldResources: { resource: MarketResourceItem, config: AutoMarketItem }[]): { resource: MarketResourceItem, config: AutoMarketItem } {
        if (soldResources.length === 0) {
            return undefined;
        }

        return soldResources.reduce((min, next) => {
            if (min === undefined) {
                return next;
            }

            return min.resource.sellPricePerTrade < next.resource.sellPricePerTrade ? min : next;
        }, undefined);
    }
}