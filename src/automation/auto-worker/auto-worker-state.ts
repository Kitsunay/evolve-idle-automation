import { AutoWorkerJobCategory } from "./auto-worker-job-category";

export interface AutoWorkerState {
    unlocked: boolean,
    enabled: boolean,
    jobCategories: AutoWorkerJobCategory[]
}