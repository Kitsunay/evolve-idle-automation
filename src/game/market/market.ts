import { Clicker } from "../clicker";
import { Game } from "../game";
import { GameUtils } from "../game-utils";
import { MarketResourceItem } from "./market-resource-item";
import { ResourceTabRefreshObserver } from "./observers/resource-tab-refresh-observer";

export class Market {
    public static readonly onResourceTabRefresh = new ResourceTabRefreshObserver();

    /**
     * Checks if market tab is unlocked
     */
    public static get isUnlocked(): boolean {
        // Check if market tab is rendered
        return document.querySelector('#mTabResource .tabs ul > :nth-child(1):not([style="display: none;"])') ? true : false;
    }

    /**
     * A list of all currently tradeable resources
     * @returns 
     */
    public static getResources(): MarketResourceItem[] {
        // Get all resource ids
        let resourceElements = document.querySelectorAll<HTMLElement>('#market [id^="market-"]:not(:first-child):not([style="display: none;"])');
        let resourceIds = Array.from(resourceElements).map((element) => element.id);

        // Build resource item list
        return resourceIds.map((id) => new MarketResourceItem(id));
    }

    /**
     * Checks if trading through trade routes is unlocked
     */
    public static get isTradeRouteUnlocked(): boolean {
        return document.querySelector('#market #tradeTotal:not([style="display: none;"])') ? true : false;
    }

    /**
     * Amount of trade routes that are unused
     */
    public static get freeTradeRouteCount(): number {
        return this.totalTradeRouteCount - this.usedTradeRouteCount;
    }

    /**
     * Amount of trade routes that are used
     */
    public static get usedTradeRouteCount(): number {
        // Collect all trade route elements and calculate the sum value (while more resource intensive, this is more reliable than reading the game (v1.4.1a)'s provided sum as the game has a bug that breaks market UI when a resource storage (crate or container) is unlocked)
        let resources = this.getResources();
        let sum = 0;
        for (let resource of resources) {
            sum = sum + Math.abs(resource.tradeCount);
        }

        return sum;
    }

    /**
     * Total amount of trade routes available
     */
    public static get totalTradeRouteCount(): number {
        // Read total value from game's tooltip (while more resource intensive, this is more reliable than reading the game's provided sum as the game (v1.4.1a) has a bug that breaks market UI when a resource storage (crate or container) is unlocked)
        let tradeRouteCountSummaryElement = document.querySelector<HTMLElement>('#market #tradeTotal .tradeTotal');

        let total: number;
        GameUtils.processTooltip(tradeRouteCountSummaryElement, (tooltipElement) => {
            let totalTradeRouteCountElement = tooltipElement.querySelector<HTMLElement>('.resBreakdown .sum :nth-child(2)');
            total = parseInt(totalTradeRouteCountElement.textContent);
        });

        return total;
    }

    /**
     * Maximum amount of trade routes that can be assigned to a resource
     */
    public static get maxTradeRoutesPerResource(): number {
        // The trade limit is not detectable, so we have to employ a more brute force approach - fuck around and find out what affects the limit

        // If research "Large Volume Trading" is unlocked, the limit is 100
        if (Game.Research.completedResearches.find(research => research.id === 'tech-large_trades')) {
            return 100;
        }

        // Default trade limit is 25
        return 25;
    }


    /**
     * Assigns a new trade route to buy a resource
     * @param targetResource 
     */
    public static addBuyTrade(targetResource: MarketResourceItem) {
        this.addTrade(targetResource);
    }

    /**
     * Assigns a new trade route to sell a resource
     * @param targetResource 
     */
    public static addSellTrade(targetResource: MarketResourceItem) {
        this.subTrade(targetResource);
    }

    /**
     * Removes a trade route that was used to buy a resource
     * @param targetResource 
     */
    public static subBuyTrade(targetResource: MarketResourceItem) {
        this.subTrade(targetResource);
    }

    /**
     * Removes a trade route that was used to sell a resource
     * @param targetResource 
     */
    public static subSellTrade(targetResource: MarketResourceItem) {
        this.addTrade(targetResource);
    }

    private static addTrade(targetResource: MarketResourceItem) {
        Clicker.click(targetResource.addButton);
    }

    private static subTrade(targetResource: MarketResourceItem) {
        Clicker.click(targetResource.subButton);
    }
}