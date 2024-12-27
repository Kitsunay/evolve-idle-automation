import { Game } from "../../game/game";
import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { Interface } from "../../interface/interface";
import { AutoMarketItem } from "./auto-market-item";

export class AutoMarketInterface {
    public static updateUI(config: { isVisible: boolean; configItems: AutoMarketItem[]; onBuy: (item: AutoMarketItem) => void; onSell: (item: AutoMarketItem) => void; }) {
        // Test whether the interface should be rendered or hidden
        config.isVisible = config.isVisible && Game.Market.isTradeRouteUnlocked;

        for (const item of config.configItems) {
            this.refreshBuyButton({
                visible: config.isVisible,
                resourceId: item.resourceId,
                enabled: item.buyEnabled,
                onToggle: () => {
                    config.onBuy(item);
                }
            });

            this.refreshSellButton({
                visible: config.isVisible,
                resourceId: item.resourceId,
                enabled: item.sellEnabled,
                onToggle: () => {
                    config.onSell(item);
                }
            });
        }
    }

    private static refreshBuyButton(config: { visible: boolean, resourceId: string, enabled: boolean, onToggle: () => void }) {
        this.refreshButton('buy', config);
    }

    private static refreshSellButton(config: { visible: boolean, resourceId: string, enabled: boolean, onToggle: () => void }) {
        this.refreshButton('sell', config);
    }

    /**
     * Generalization of button creation. Creates/destroys buttons that enable/disable automation of trade routes.
     * @param buttonType 
     * @param buttonConfig 
     */
    private static refreshButton(buttonType: 'buy' | 'sell', buttonConfig: { visible: boolean, resourceId: string, enabled: boolean, onToggle: () => void }) {
        const buttonId = `auto_market_${buttonType}_${buttonConfig.resourceId}`;
        
        // Make sure the button doesn't exist
        if (!buttonConfig.visible) {
            let toggleButton = ToggleButton.get(buttonId);
            
            if (toggleButton) {
                toggleButton.destroy();
            }

            return;
        }
        
        // Make sure the button is properly configured and rendered
        let containerElement = this.refreshButtonContainer(buttonConfig.resourceId);

        let toggleButton = ToggleButton.getOrCreate(
            buttonId,
            containerElement,
            {
                styleClass: `auto-market ${buttonType}`,
                textContent: {
                    on: buttonType.toUpperCase(),
                    off: buttonType.toUpperCase()
                }
            }
        );

        toggleButton.onToggle = buttonConfig.onToggle;
        toggleButton.isToggled = buttonConfig.enabled;
    }

    private static refreshButtonContainer(resourceId: string): Element {
        let marketElement = document.querySelector<HTMLElement>(`#market`);
        let resourceElement = marketElement.querySelector<HTMLElement>(`#${resourceId}`);
        let containerElement = resourceElement.querySelector<Element>(`#auto_market_container_${resourceId}`);

        if (!containerElement) {
            let elementString = `<div id="auto_market_container_${resourceId}" class="auto-market-container"></div>`;
            containerElement = Interface.createChildElementFromString(elementString, resourceElement);
        }

        return containerElement;
    }
}