import { Room, Client, ClientArray } from "@colyseus/core";
import { Character, Message, MyRoomState, Scene } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
    maxClients = 4;

    onCreate(options: any) {
        this.setState(new MyRoomState());

        this.onMessage("NEW_MESSAGE", (client, message) => {
            console.log("MESSAGE RECEIVED:", message);
            const sessionId = client.id;
            const userId = this.state.sessionUserIdMap.get(sessionId);
            
            const character = this.state.characters.find(c => c.userId === userId);
            const scene = this.state.scenes.find(s => s.sceneId === character.sceneId);

            scene.messages.push(new Message({
                userId,
                message
            }));
        });

        this.onMessage("NEW_CHARACTER", (client, character) => {
            const characterSchema = new Character(character);
            this.state.characters.push(characterSchema);
            this.state.sessionUserIdMap.set(client.id, characterSchema.userId);
        });

        this.onMessage("NEW_SCENE", (client, scene) => {
            const sceneScheme = new Scene(scene);
            this.state.scenes.push(sceneScheme);
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
