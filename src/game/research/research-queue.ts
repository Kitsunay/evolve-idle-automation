import { Interface } from "../../interface/interface";
import { ResearchQueueItem } from "./research-queue-item";

export class ResearchQueue {
    public static exists(): boolean {
        return Interface.ResearchInterface.ResearchQueueInterface.exists;
    }

    public static queueItems(): ResearchQueueItem[] {
        return Interface.ResearchInterface.ResearchQueueInterface.queueItems.map(item => new ResearchQueueItem(item));
    }
}