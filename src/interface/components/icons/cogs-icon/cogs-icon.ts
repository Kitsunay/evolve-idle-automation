import { Component } from "../../component";
import { CogsIconConfig } from "./cogs-icon-config";

export class CogsIcon extends Component<CogsIconConfig> {
    protected rootElementString: string = '<cogs-icon class="icon-wrapper"></cogs-icon>';
    protected defaultConfig: CogsIconConfig = {};
    
    protected getComponentIdPrefix(): string {
        return 'cogs_icon_';
    }

    protected renderComponent(config: CogsIconConfig, rootElement: Element): void {
        // Update content
        let innerHTML = `<div class="icon icon-cogs${config.color ? ' icon-color-' + config.color : ''}"${config.size ? ' style="width: ' + config.size + 'px; height: ' + config.size + 'px"' : ''}></div>`;
        rootElement.innerHTML = innerHTML;

        // Update size
        rootElement.firstElementChild.setAttribute('style', config.size ? 'width: ' + config.size + 'px; height: ' + config.size + 'px' : '');
    }
}