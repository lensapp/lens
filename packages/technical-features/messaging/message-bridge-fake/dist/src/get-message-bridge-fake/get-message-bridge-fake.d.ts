import type { DiContainer } from "@ogre-tools/injectable";
export type MessageBridgeFake = {
    involve: (...dis: DiContainer[]) => void;
    messagePropagation: () => Promise<void>;
    messagePropagationRecursive: (callback: any) => any;
    setAsync: (value: boolean) => void;
};
export declare const getMessageBridgeFake: () => MessageBridgeFake;
