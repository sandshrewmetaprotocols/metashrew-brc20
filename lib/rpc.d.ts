export declare function decodeBrc20ByAddressResponse(hex: string): {
    outpoints: Array<{
        hash: string;
        vout: number;
    }>;
    brc20s: Array<{
        tick: string;
        balance: bigint;
    }>;
};
export declare class MetashrewOrd {
    baseUrl: string;
    blockTag: string;
    constructor({ baseUrl, blockTag }: any);
    _call({ method, input }: {
        method: any;
        input: any;
    }): Promise<string>;
    satranges({ outpoint }: any): Promise<any>;
    sat({ sat }: any): Promise<any>;
}
