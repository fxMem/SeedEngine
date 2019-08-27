import { Coordinates, TileActionResult } from "./Field";
import { SessionMessage, SessionCommand } from "../session/SessionMessage";
import { Client, ClientConnectionHandler } from "../client/ClientConnectionHandler";
import { MinerPlayerAction } from "./MinerPlayerAction";
import { MinerGameState, MinerGameStateUpdateHeader } from "./MinerGameState";

export class MinerClient implements Client {
    handler: ClientConnectionHandler;

    flag(sessionId: string, pos: Coordinates): Promise<TileActionResult> {
        return this.invokeMinerMessage(sessionId,  MinerPlayerAction.flag, pos);
    }

    probe(sessionId: string, pos: Coordinates): Promise<TileActionResult> {
        return this.invokeMinerMessage(sessionId, MinerPlayerAction.probe, pos );
    }

    open(sessionId: string, pos: Coordinates): Promise<TileActionResult> {
        return this.invokeMinerMessage(sessionId, MinerPlayerAction.open, pos );
    }

    getState(sessionId: string): Promise<MinerGameState> {
        return this.invokeMinerMessage(sessionId, MinerPlayerAction.checkState);
    }

    private invokeMinerMessage(sessionId: string,  action: MinerPlayerAction, pos?: Coordinates,): Promise<any> {
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