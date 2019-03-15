import { GroupIdGenerator } from "./GroupIdGenerator";

export class InMemoryGroupIdGenerator implements GroupIdGenerator {
    private id = 0;

    getNext(): string {
        this.id++;
        return this.id.toString();
    }

}