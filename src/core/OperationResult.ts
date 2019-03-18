export interface OperationResult {
    success: boolean;

    message?: string;
}

export const Success = { success: true };
export const SuccessPromise = Promise.resolve(Success);