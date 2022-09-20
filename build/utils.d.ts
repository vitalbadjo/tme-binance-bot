export declare function getEnv(name: string): string;
export declare function retry<T>(tryNum: number, delay: number, thunk: () => Promise<T>): Promise<T>;
export declare function delaySec(num: number): Promise<void>;
