import { Game } from "../../game/game";
import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { Interface } from "../../interface/interface";
import { AutoMarketItem } from "./auto-market-item";

export class AutoMarketInterface {
    public static updateUI(config: { isVisible: boolean; configItems: AutoMarketItem[]; onBuy: (item: AutoMarketItem) => void; onSell: (item: AutoMarketItem) => void; onPause: (item: AutoMarketItem) => void; }) {
        // Test whether the interface should be rendered or hidden
        config.isVisible = config.isVisible && Game.Market.isTradeRouteUnlocked;

        for (const item of config.configItems) {
            this.refreshBuyButton({
                visible: config.isVisible,
                resourceId: item.resourceId,
                enabled: item.buyEnabled,
                paused: item.paused,
                onToggle: () => {
                    config.onBuy(item);
                }
            });

            this.refreshSellButton({
                visible: config.isVisible,
                resourceId: item.resourceId,
                enabled: item.sellEnabled,
                paused: item.paused,
                onToggle: () => {
                    config.onSell(item);
                }
            });

            this.refreshPauseButton({
                visible: config.isVisible,
                resourceId: item.resourceId,
                enabled: item.paused === true, // To prevent problems with undefined
                paused: undefined,
                onToggle: () => {
                    config.onPause(item);
                }
            });
        }
    }

    private static refreshBuyButton(config: { visible: boolean, resourceId: string, enabled: boolean, paused: boolean, onToggle: () => void }) {
        this.refreshButton('buy', config);
    }

    private static refreshSellButton(config: { visible: boolean, resourceId: string, enabled: boolean, paused: boolean, onToggle: () => void }) {
        this.refreshButton('sell', config);
    }

    private static refreshPauseButton(config: { visible: boolean, resourceId: string, enabled: boolean, paused: boolean, onToggle: () => void }) {
        this.refreshButton('pause', config);
    }

    /**
     * Generalization of button creation. Creates/destroys buttons that enable/disable automation of trade routes.
     * @param buttonType 
     * @param buttonConfig 
     */
    private static refreshButton(buttonType: 'buy' | 'sell' | 'pause', buttonConfig: { visible: boolean, resourceId: string, enabled: boolean, paused: boolean, onToggle: () => void }) {
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

        if (!containerElement) {
            return;
        }

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

        if (buttonConfig.paused !== undefined && toggleButton.buttonElement.classList.contains('paused') !== buttonConfig.paused) {
            toggleButton.buttonElement.classList.toggle('paused');
        }
    }

    private static refreshButtonContainer(resourceId: string): Element {
        let marketElement = document.querySelector<HTMLElement>(`#market`);
        let resourceMarketElement = marketElement.querySelector<HTMLElement>(`#${resourceId}`);
        let containerElement = marketElement.querySelector<Element>(`#auto_market_container_${resourceId}`);

        let visible = resourceMarketElement && resourceMarketElement.style.display !== 'none';

        if (!containerElement && visible) {
            let moveRight = resourceMarketElement.querySelector<HTMLElement>(`.buy`); // If market contains manual buy button, move the container contents right to match the offset of trade routes

            let elementString = `<div id="auto_market_container_${resourceId}" class="auto-market-container market-item${moveRight ? ' offset-right' : ''}"></div>`;
            containerElement = Interface.createSiblingElementFromString(elementString, resourceMarketElement, "afterend");
        } else if (containerElement && !visible) {
            containerElement.remove();
            containerElement = undefined;
        }

        return containerElement;
    }
}