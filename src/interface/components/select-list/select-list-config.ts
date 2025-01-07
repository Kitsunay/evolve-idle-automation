export interface SelectListConfig {
    choices?: { value: string, label: string, onToggle: () => void, styleClass?: string }[],
    selectedIndex?: number,
    styleClass?: string
}