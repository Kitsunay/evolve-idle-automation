import { Component } from "../component";
import { NumberInputConfig } from "./number-input-config";

export class NumberInputComponent extends Component<NumberInputConfig> {
    protected rootElementString: string = '<div class="number-input-wrapper"></div>';
    protected defaultConfig: NumberInputConfig = { content: 0 };

    protected getComponentIdPrefix(): string {
        return 'number_input_';
    }

    protected renderComponent(config: NumberInputConfig, rootElement: Element, isNew: boolean): void {
        // Replace inner HTML
        let innerString = `<div class="sub">«</div><div class="content"></div><div class="add">»</div>`;
        rootElement.innerHTML = innerString;

        // Add classes
        rootElement.className = `number-input-wrapper ${config.styleClass ?? ''}`;

        // Add listeners
        let subElement = rootElement.querySelector<HTMLElement>('.sub');
        let addElement = rootElement.querySelector<HTMLElement>('.add');

        subElement.addEventListener('click', config.onSub);

        addElement.addEventListener('click', config.onAdd);

        // Add content
        let contentElement = rootElement.querySelector<HTMLElement>('.content');
        contentElement.innerHTML = (config.content ?? 0).toString();
    }
}