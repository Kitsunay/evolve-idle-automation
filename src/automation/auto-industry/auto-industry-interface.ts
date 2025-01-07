import { Game } from "../../game/game";
import { FactoryItem } from "../../game/industry/factory-item";
import { SmelterItem } from "../../game/industry/smelter-item";
import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { Interface } from "../../interface/interface";
import { AutoIndustryState } from "./auto-industry-state";

export class AutoIndustryInterface {
    /**
     * Renders UI elements that allow the player to enable/disable/configure auto-industry automation.
     * The visual state of the UI elements represents the state of the automation.
     * @param state 
     */
    public static update(
        state: AutoIndustryState,
        callbacks: {
            smelter: {
                onTogglePrefferedFuel: (resourceId: string) => void;
                onRatioSub: (resourceId: string) => void;
                onRatioAdd: (resourceId: string) => void;
            },
            factory: {
                onRatioSub: (resourceId: string) => void;
                onRatioAdd: (resourceId: string) => void;
            }
        }): void {
        this.updateSmelter(state.smelterConfig, callbacks.smelter);
        this.updateFactory(state.factoryConfig, callbacks.factory);
    }

    private static updateSmelter(
        smelterConfig: {
            unlocked: boolean;
            enabled: boolean;
            preferredFuel: string;
            productRatios: { product: string; ratio: number; }[];
        },
        callbacks: {
            onTogglePrefferedFuel: (resourceId: string) => void;
            onRatioSub: (resourceId: string) => void;
            onRatioAdd: (resourceId: string) => void;
        }
    ) {
        let fuelItems = Game.Industry.Smelter.fuelItems;

        // Put small toggle for each button, to indicate which fuel is preferred
        for (let i = 0; i < fuelItems.length; i++) {
            const fuelItem = fuelItems[i];

            let leftElement = fuelItem.subButton;
            let parentElement = leftElement.parentElement;

            let leftElementIndex = Array.from(parentElement.children).indexOf(leftElement);

            // Put the toggle before the left element
            let buttonId = `auto-industry-smelter-fuel-${fuelItem.resourceId}`;
            let buttonElement = new ToggleButton(buttonId, parentElement, leftElementIndex);
            buttonElement.createOrUpdate({
                styleClass: "auto-industry-toggle-addon",
                iconStyleClass: {
                    on: 'icon-cogs icon-size-16 icon-color-orange',
                    off: 'icon-cogs icon-size-16 icon-color-white'
                },
                textContent: { on: '', off: '' },
                isToggled: smelterConfig?.preferredFuel === fuelItem.resourceId,
                onToggle: () => { callbacks.onTogglePrefferedFuel(fuelItem.resourceId); }
            });
        }

        let outputRootElement = Game.Industry.Smelter.outputRootElement;
        let outputItems = Game.Industry.Smelter.outputItems;

        // Put ratio configuration underneath each product
        let wrapperElement = this.getOrCreateSmelterOutputWrapper();

        // For each output item, create a wrapper element that contains the ratio configuration
        for (let i = 0; i < outputItems.length; i++) {
            const outputItem = outputItems[i];
            let config = smelterConfig?.productRatios?.find(x => x.product === outputItem.resourceId);

            let itemWrapper = this.getOrCreateSmelterOutputItemWrapper(outputItem, wrapperElement);

            let contentElement = itemWrapper.querySelector('.content');
            if (!contentElement.textContent) {
                // Initialize new elements
                let subButton = itemWrapper.querySelector('.sub');
                subButton.addEventListener('click', () => { callbacks.onRatioSub(outputItem.resourceId); });

                let addButton = itemWrapper.querySelector('.add');
                addButton.addEventListener('click', () => { callbacks.onRatioAdd(outputItem.resourceId); });
            }

            contentElement.textContent = `Ratio ${config?.ratio ?? 0}`;
        }
    }

    private static updateFactory(
        factoryConfig: {
            unlocked: boolean;
            enabled: boolean;
            productRatios:
            { product: string; ratio: number; }[]
        },
        callbacks: {
            onRatioSub: (resourceId: string) => void;
            onRatioAdd: (resourceId: string) => void;
        }
    ) {
        // For each output item, create a wrapper element that contains the ratio configuration
        let outputItems = Game.Industry.Factory.outputItems;

        for (let i = 0; i < outputItems.length; i++) {
            const outputItem = outputItems[i];
            let config = factoryConfig?.productRatios?.find(x => x.product === outputItem.resourceId);

            let itemWrapper = this.getOrCreateFactoryOutputItemWrapper(outputItem, outputItem.textContentElement.parentElement);

            let contentElement = itemWrapper.querySelector('.content');
            if (!contentElement.textContent) {
                // Initialize new elements
                let subButton = itemWrapper.querySelector('.sub');
                subButton.addEventListener('click', () => { callbacks.onRatioSub(outputItem.resourceId); });

                let addButton = itemWrapper.querySelector('.add');
                addButton.addEventListener('click', () => { callbacks.onRatioAdd(outputItem.resourceId); });
            }

            contentElement.textContent = `Ratio ${config?.ratio ?? 0}`;
        }
    }

    private static getOrCreateSmelterOutputWrapper(): Element {
        if (!Game.Industry.Smelter.outputRootElement) {
            return undefined;
        }

        let wrapperId = 'auto-industry-smelter-output-wrapper';
        let wrapperElement: Element = document.getElementById(wrapperId);

        if (!wrapperElement) {
            let wrapperString = `<div id="${wrapperId}" class="auto-industry wrapper"></div>`;
            wrapperElement = Interface.createChildElementFromString(wrapperString, Game.Industry.Smelter.outputRootElement);
        }

        return wrapperElement;
    }

    static getOrCreateSmelterOutputItemWrapper(outputItem: SmelterItem, parentElement: Element) {
        let elementId = `auto-industry-smelter-output-${outputItem.resourceId}`;

        return Interface.getOrCreate({
            elementId: elementId,
            parentElement: parentElement,
            elementString: `<div id="${elementId}" class="item-ratio-wrapper"><div class="sub">«</div><div class="content"></div><div class="add">»</div></div>`
        });
    }

    static getOrCreateFactoryOutputItemWrapper(outputItem: FactoryItem, parentElement: Element) {
        let elementId = `auto-industry-factory-output-${outputItem.resourceId}`;

        return Interface.getOrCreate({
            elementId: elementId,
            parentElement: parentElement,
            elementString: `<div id="${elementId}" class="item-ratio-wrapper"><div class="icon-wrapper"><div class="icon icon-cogs icon-size-16 icon-color-white"></div></div><div class="sub">«</div><div class="content"></div><div class="add">»</div></div>`
        });
    }
}