import { EvolutionNode } from "./evolution-node";

export interface AutoEvolutionState {
    unlocked: boolean;
    enabled: boolean;
    evolutionRoot: EvolutionNode;

    targetOrganelles: number;
    targetMembrane: number;
    targetNucleus: number;
    targetMitochondria: number;
    targetEukaryoticCell: number;
}