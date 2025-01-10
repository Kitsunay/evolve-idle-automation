import { ToggleButton } from "../toggle-button/toggle-button";

export class ToggleIconButton extends ToggleButton {
    constructor(buttonId: string, parentElement?: Element, config?: { styleClass?: string, toggledStyleClass?: string, textContent?: { on: string, off: string }, position?: number }) {
        super(buttonId, parentElement, config.position);
    }
}