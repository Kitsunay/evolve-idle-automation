export interface EvolutionNode {
    id: string;
    name: string;
    isLeaf: boolean;
    selectedChildIndex: number;
    children: EvolutionNode[];
}