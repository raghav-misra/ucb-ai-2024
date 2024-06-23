import { Room, Client, ClientArray } from "@colyseus/core";
import { Character, Message, MyRoomState, Scene } from "./schema/MyRoomState";
import { World } from "../engine/db/classes/World";
import users from "../users";
import { scene } from "../engine/db/schema";

export class MyRoom extends Room<MyRoomState> {
    maxClients = 4;
    world: World;

    syncWorldState() {
        if (!this.world) return;

        

        //Sync new characters
        this.world.players.forEach(worldCharacter => {
           
            if (!this.state.characters.find(c => c.userId === worldCharacter.id)) this.state.characters.push(new Character({
                userId: worldCharacter.id,
                sceneId: worldCharacter.scene_id,
                ...worldCharacter
            }))
        })

        this.world.npcs.forEach(worldCharacter => {
            if (!this.state.characters.find(c => c.userId === worldCharacter.id)) this.state.characters.push(new Character({
                userId: worldCharacter.id,
                sceneId: worldCharacter.scene_id,
                ...worldCharacter
            }))
        })

        //Sync all existing characters
        this.state.characters.forEach(character => {
            const worldCharacter = this.world.players.get(character.userId) || this.world.npcs.get(character.userId);
            const details = this.world.helpers.fetchLocationDetails(worldCharacter.location_id)
            character.assign({
                ...worldCharacter,
                userId: worldCharacter.id,
                sceneId: worldCharacter.scene_id,
                city: details.city?.name,
                region: details.region?.name
            })
        })

        //Sync scenes
        this.world.scenes.active.forEach((worldScene) => {
            let indexOfScene = this.state.scenes.findIndex(c => c.sceneId === worldScene.scene.id)
            if (indexOfScene === -1) {
                const details = this.world.helpers.fetchLocationDetails(worldScene.scene.location_id)
                const networkedScene = new Scene({
                    sceneId: worldScene.scene.id,
                    sceneType: worldScene.scene.type,
                    regionImage: details.region?.landscape,
                    cityImage: details.city?.landscape,
                    locationImage: details.location?.landscape,
                    cityString: details.city.name,
                    locationString: details.location?.name,
                    regionString: details.region.name
                })
                worldScene.networkedScene = networkedScene
                worldScene.broadcast = this.broadcast.bind(this)
                this.world.broadcast = this.broadcast.bind(this)
                this.state.scenes.push(networkedScene)
                indexOfScene = this.state.scenes.length - 1
            }


            worldScene.characters.forEach(c => {
                const indexToModify = this.state.characters.findIndex(innerC => innerC.userId === c.id)
                this.state.characters[indexToModify].sceneId = worldScene.scene.id
            })

        });
    }
    async onCreate(option: any) {
        this.setState(new MyRoomState());
        this.onMessage("GET_DB_INFO", (client, { dbName, name }) => this.onCreateBruh(dbName, name));
    }

    async onCreateBruh(dbName: string, name: string) {
        this.world = new World({
            dbName,
            stats: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as any,
            difficulty: {
                'Very Easy': 5,
                'Easy': 10,
                'Medium': 15,
                'Hard': 20,
                'Very Hard': 25,
                'Nearly Impossible': 30,
                'FORCE FAIL': 999999
            },
            player: {
                name,
            },
            builderState: users.readBuilderState(dbName)
        })

        //Kick off the game
        console.log("KICKOFF")
        this.syncWorldState()
        await this.world.init()
        this.syncWorldState()
        this.runGame()

        this.onMessage("NEW_MESSAGE", (client, message: string) => {
            this.world.scenes.playerInput(message);
        });

        // this.onMessage("NEW_CHARACTER", (client, character) => {
        //     const characterSchema = new Character(character);
        //     this.state.characters.push(characterSchema);
        //     this.state.sessionUserIdMap.set(client.id, characterSchema.userId);
        // });

        // this.onMessage("NEW_SCENE", (client, scene) => {
        //     const sceneScheme = new Scene(scene);
        //     this.state.scenes.push(sceneScheme);
        // });
    }

    async runGame() {
        await this.world.scenes.startGameLoop(this.state, this.syncWorldState.bind(this))
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