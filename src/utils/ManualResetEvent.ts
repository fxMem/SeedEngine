
// This sounds strange but it might actually be useful
export class ManualResetEvent {

    private waiter: Promise<void>;
    private resolve: any;
    private signaled: boolean;

    constructor() {
        this.reset();
    }

    set() {
        this.resolve();
        this.signaled = true;
    }

    reset() {
        if (!this.signaled) {
            throw new Error("Event is not signaled, can't reset!");
        }
        
        this.waiter = new Promise((resolve) => {
            this.resolve = resolve;
            this.signaled = false;
        });
    }

    wait(): Promise<void> {
        return this.waiter;
    }
}