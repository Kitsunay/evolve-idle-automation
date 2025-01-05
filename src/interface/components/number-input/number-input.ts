import { Component } from "../component";
import { NumberInputConfig } from "./number-input-config";

export class NumberInputComponent extends Component<NumberInputConfig> {
    protected rootElementString: string = '<div class="number-input-wrapper"></div>';
    protected defaultConfig: NumberInputConfig = {content: 0};

    protected getComponentIdPrefix(): string {
        return 'number_input_';
    }

    protected getInnerString(config: NumberInputConfig): string {
        return `<div class="sub">«</div><div class="content">${config.content ?? 0}</div><div class="add">»</div>`;
    }

    protected renderComponent(config: NumberInputConfig, rootElement: Element): void {
        let innerString = this.getInnerString(config);
        rootElement.innerHTML = innerString;

        rootElement.className = `number-input-wrapper ${config.styleClass ?? ''}`;

        let subElement = rootElement.querySelector<HTMLElement>('.sub');
        let addElement = rootElement.querySelector<HTMLElement>('.add');

        if (config.onSub) {
            subElement.addEventListener('click', config.onSub);
        }

        if (config.onAdd) {
            addElement.addEventListener('click', config.onAdd);
        }
    }
}