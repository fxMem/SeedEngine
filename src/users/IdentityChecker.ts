export interface IdentityChecker {
    check(providedData: any, knownData: any): Promise<boolean>;
}

