export class Clicker {
    public static click(element: Element, options?: {multi10x?: boolean, multi25x?: boolean, multi100x?: boolean}): void {
        element.dispatchEvent(new MouseEvent('click', {ctrlKey: options?.multi10x, shiftKey: options?.multi25x, altKey: options?.multi100x}));
    }
}