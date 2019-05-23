import { Client, ClientConnectionHandler } from "../client";
import { MinerGameStateUpdateHeader, MinerGameState, MinerPlayerAction } from "./MinerGame";
import { Coordinates, TileActionResult } from "./Field";
import { OperationResult } from "../core";
import { SessionMessage, SessionCommand } from "../session/SessionMessage";

export class MinerClient implements Client {
    handler: ClientConnectionHandler;

    flag(sessionId: string, pos: Coordinates): Promise<TileActionResult> {
        return this.invokeMinerMessage(sessionId, pos, MinerPlayerAction.flag);
    }

    probe(sessionId: string, pos: Coordinates): Promise<TileActionResult> {
        return this.invokeMinerMessage(sessionId, pos, MinerPlayerAction.probe);
    }

    open(sessionId: string, pos: Coordinates): Promise<TileActionResult> {
        return this.invokeMinerMessage(sessionId, pos, MinerPlayerAction.open);
    }

    private invokeMinerMessage(sessionId: string, pos: Coordinates, action: MinerPlayerAction): Promise<TileActionResult> {
        return this.handler.invokeWithMessage<SessionMessage>({
            sessionCommand: SessionCommand.message,
            sessionId,
            payload: {
                pos,
                action
            }
        });
    }

    onGameStateUpdate(callback: (data: MinerGameState) => void): void {
        this.handler.subscribeToTitledMessage(MinerGameStateUpdateHeader, callback);
    }


}