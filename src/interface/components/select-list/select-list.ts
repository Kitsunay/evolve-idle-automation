import { Component } from "../component";
import { ToggleButton } from "../toggle-button/toggle-button";
import { SelectListConfig } from "./select-list-config";

export class SelectList extends Component<SelectListConfig> {
    protected rootElementString: string = '<select-list></select-list>';
    protected defaultConfig: SelectListConfig = {};

    protected getComponentIdPrefix(): string {
        return 'select_list_';
    }

    protected renderComponent(config: SelectListConfig, rootElement: Element, isNew: boolean): void {
        this.rootElement.className = `select-list ${config.styleClass ?? ''}`;

        let buttons = [];

        for (let i = 0; i < config.choices.length; i++) {
            const choice = config.choices[i];
            buttons.push(this.renderChoice(choice, i, config.selectedIndex === i));
        }
    }

    private renderChoice(choice: { value: string, label: string, onToggle: () => void, styleClass?: string }, index: number, isSelected: boolean): ToggleButton {
        let choiceId = `${this.componentId}_choice_${index}`;

        let button = new ToggleButton(choiceId, this.rootElement, index);

        button.createOrUpdate({ textContent: { on: choice.label, off: choice.label }, styleClass: choice.styleClass, isToggled: isSelected, onToggle: choice.onToggle });
        return button;
    }
}