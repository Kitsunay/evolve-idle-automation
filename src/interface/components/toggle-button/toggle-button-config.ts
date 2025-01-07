export class ToggleButtonConfig {
    isToggled?: boolean;
    styleClass?: string;
    iconStyleClass?: {
        on: string,
        off: string
    };
    textContent?: {
        on: string,
        off: string
    };
    onToggle?: (newValue: boolean) => void;
    position?: number
}