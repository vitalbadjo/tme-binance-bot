export declare function getPredefinedDataSheet(page?: "Sheet1" | "Sheet2"): Promise<GetSheetsResponse>;
declare type BanksRus = "rosbank" | "tinkoff" | "raiffaisen" | "bks" | "uralsib" | "rshb" | "reneissance" | "deniz" | "korona" | "turLocalExch";
declare type BanksRusComiisions = "korrPercent" | "korrRub" | "swiftPercent" | "swiftUsd" | "delayDays" | "iban" | "dzh";
declare type GetSheetsResponse = Partial<Record<BanksRus, Record<BanksRusComiisions, string | number>>>;
export {};
