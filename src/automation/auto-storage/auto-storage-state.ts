import { AutoStorageItem } from "./auto-storage-item";

export interface AutoStorageState {
    unlocked: boolean;
    items: AutoStorageItem[];
}