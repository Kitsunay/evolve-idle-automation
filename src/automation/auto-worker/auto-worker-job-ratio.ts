export interface AutoWorkerJobRatio {
    jobId: string,
    value?: number,
    priority?: number,
    children?: AutoWorkerJobRatio[]
};