export declare type SpotAccountAsset = {
    "asset": string;
    "free": string;
    "locked": string;
};
export declare type SpotAccountInfo = {
    "makerCommission": number;
    "takerCommission": number;
    "buyerCommission": number;
    "sellerCommission": number;
    "canTrade": boolean;
    "canWithdraw": boolean;
    "canDeposit": boolean;
    "brokered": boolean;
    "updateTime": number;
    "accountType": string;
    "balances": SpotAccountAsset[];
    "permissions": string[];
};
