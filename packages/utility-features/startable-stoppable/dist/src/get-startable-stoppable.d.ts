export type Stopper = () => void;
export type Starter = () => Stopper;
export interface StartableStoppable {
    readonly started: boolean;
    start: () => void;
    stop: () => void;
}
export declare function getStartableStoppable(id: string, startAndGetStopper: Starter): StartableStoppable;
