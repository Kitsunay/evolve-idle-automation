import { Interface } from "../../interface";
import { ToastHorizontalAlign } from "./toast-horizontal-align";
import { ToastVerticalAlign } from "./toast-vertical-align";

export class Toast {
    private element: Element;

    constructor(content: string, lifeMs: number = undefined, verticalAlign: ToastVerticalAlign = 'TOP', horizontalAlign: ToastHorizontalAlign = 'RIGHT') {
        this.element = Interface.createElementFromString(`<div class="toast"><div class="content">${content}</div><div><div class="close-button"><div class="icon icon-close icon-color-danger icon-size-24"></div></div></div></div>`, document.activeElement);

        this.element.classList.add(`vertical-${verticalAlign.toLowerCase()}`);
        this.element.classList.add(`horizontal-${horizontalAlign.toLowerCase()}`);

        
        if (lifeMs !== undefined) {
            setTimeout(() => {this.destroy();}, lifeMs);
        }

        // Close toast on close-button click
        let closeButtonElement = this.element.querySelector('.close-button');
        closeButtonElement.addEventListener('click', () => {this.destroy();});

        // Toast is ready, make it visible now
        this.toggleVisibility();
    }

    destroy(): void {
        this.toggleVisibility();
        setTimeout(() => { // Why timeout? Just in case I decide to animate a fade in/fade out effect when visibility changes
            this.element.remove();
        }, 1000);
    }

    private toggleVisibility(): void {
        this.element.classList.toggle("visible");
    }
}