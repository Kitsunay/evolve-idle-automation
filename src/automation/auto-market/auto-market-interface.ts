import { Game } from "../../game/game";
import { NumberInputComponent } from "../../interface/components/number-input/number-input";
import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { Interface } from "../../interface/interface";
import { AutoMarketItem } from "./auto-market-item";

export class AutoMarketInterface {
    public static updateUI(config: {
        isVisible: boolean;
        configItems: AutoMarketItem[];
        onBuy: (item: AutoMarketItem) => void;
        onSell: (item: AutoMarketItem) => void;
        onPause: (item: AutoMarketItem) => void;
        onBuyRateChange: (item: AutoMarketItem, value: number) => void;
    }) {
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

            this.refreshBuyRateComponent({
                visible: config.isVisible,
                resourceId: item.resourceId,
                value: item.buyRate,
                onChange: (value: number) => {
                    config.onBuyRateChange(item, value);
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
            let toggleButton = document.querySelector<HTMLElement>(`#${buttonId}`);

            if (toggleButton) {
                toggleButton.remove();
            }

            return;
        }

        // Make sure the button is properly configured and rendered
        let containerElement = this.refreshResourceComponentsContainer(buttonConfig.resourceId);

        if (!containerElement) { // This happens for resources that are not available yet
            return;
        }

        let toggleButton = new ToggleButton(buttonId, containerElement,);
        toggleButton.createOrUpdate({
            styleClass: `auto-market ${buttonType}${buttonConfig.paused ? ' paused' : ''}`,
            textContent: {
                on: buttonType.toUpperCase(),
                off: buttonType.toUpperCase()
            },
            isToggled: buttonConfig.enabled,
            onToggle: buttonConfig.onToggle
        });
    }

    private static refreshResourceComponentsContainer(resourceId: string): Element {
        let marketElement = document.querySelector<HTMLElement>(`#market`);
        let resourceMarketElement = marketElement.querySelector<HTMLElement>(`#${resourceId}`);

        let containerId = `auto_market_container_${resourceId}`;
        let containerElement = marketElement.querySelector<Element>(`#${containerId}`);

        let visible = resourceMarketElement && resourceMarketElement.style.display !== 'none';

        if (!containerElement && visible) {
            let moveRight = resourceMarketElement.querySelector<HTMLElement>(`.buy`); // If market contains manual buy button, move the container contents right to match the offset of trade routes

            let elementString = `<div id="${containerId}" class="auto-market-container market-item${moveRight ? ' offset-right' : ''}"></div>`;
            containerElement = Interface.createSiblingElementFromString(elementString, resourceMarketElement, "afterend");
        } else if (containerElement && !visible) {
            containerElement.remove();
            containerElement = undefined;
        }

        return containerElement;
    }

    /**
     * Renders the component that allows player to change the resource's target income when buying rate.
     * @param componentConfig 
     * @returns 
     */
    private static refreshBuyRateComponent(componentConfig: { resourceId: string, value: number, visible: boolean, onChange: (value: number) => void }) {
        let elementId = `auto_market_buy_rate_target_${componentConfig.resourceId}`;

        // Make sure the component doesn't exist
        if (!componentConfig.visible) {
            let component = document.querySelector<HTMLElement>(`#${elementId}`);

            if (component) {
                component.remove();
            }

            return;
        }

        // Make sure the component is properly configured and rendered
        let containerElement = this.refreshResourceComponentsContainer(componentConfig.resourceId);

        if (!containerElement) { // This happens for resources that are not available yet
            return;
        }

        // TODO: This component could have also a toggle button with cogs icon that activates/deactivates production rate automation
        let component = new NumberInputComponent(elementId, containerElement);

        if (!component.exists) {
            component.create({
                content: componentConfig.value,
                styleClass: 'auto-market',
                onAdd: () => {
                    componentConfig.onChange((componentConfig.value ?? 0) + 1);
                },
                onSub: () => {
                    componentConfig.onChange((componentConfig.value ?? 0) - 1);
                }
            });
        }
    }
}