import { Component } from "../component";
import { NumberInputConfig } from "./number-input-config";

export class NumberInputComponent extends Component<NumberInputConfig> {
    protected rootElementString: string = '<div class="number-input-wrapper"></div>';
    protected defaultConfig: NumberInputConfig = { content: 0 };

    protected getComponentIdPrefix(): string {
        return 'number_input_';
    }

    protected renderComponent(config: NumberInputConfig, rootElement: Element, isNew: boolean): void {
        // Create inner HTML if it doesn't exist
        if (!rootElement.innerHTML) {
            let innerString = `<div class="sub">«</div><div class="content"></div><div class="add">»</div>`;
            rootElement.innerHTML = innerString;
        }

        // Update classes
        rootElement.className = `number-input-wrapper ${config.styleClass ?? ''}`;

        // Update listeners
        let subElement = rootElement.querySelector<HTMLElement>('.sub');
        let addElement = rootElement.querySelector<HTMLElement>('.add');

        if (isNew && config.onSub) {
            subElement.addEventListener('click', config.onSub);
        }

        if (isNew && config.onAdd) {
            addElement.addEventListener('click', config.onAdd);
        }

        // Update content
        let contentElement = rootElement.querySelector<HTMLElement>('.content');
        contentElement.innerHTML = (config.content ?? 0).toString();
    }
}