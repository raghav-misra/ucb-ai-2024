import { Room, Client, ClientArray } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
    maxClients = 4;

    onCreate(options: any) {
        this.setState(new MyRoomState());

        this.onMessage("prompt", (client, message) => {
            console.log("PROMPT RECEIVED", message);
        });
    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");
    }

    onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
