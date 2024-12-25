export class ResearchQueueItem {
    /**
     * The root HTML element of queue item
    */
    private readonly element: HTMLElement
   
    constructor(element: HTMLElement) {
        this.element = element;
     }
 
     /**
      * Adds an event listener to the root element
      * @param eventType name of the event
      * @param callback function to be called on the event
      */
     public addEventListener(eventType: string, callback: () => void) {
         this.element.addEventListener(eventType, callback);
     }
}