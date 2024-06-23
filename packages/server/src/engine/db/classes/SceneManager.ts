import { eq, inArray } from "drizzle-orm";
import { Character, character, scene } from "../schema";
import { HydratedScene } from "./HydratedScene";
import { World } from "./World";
import { Thread, genText } from "../../ai";
import dedent from "dedent";
import { MyRoomState } from "../../../rooms/schema/MyRoomState";
import readline from 'node:readline/promises';
import { generateImage } from "../../../routes/sdxl.ts"

async function prompt(message: string, validator: (input: string) => string | undefined): Promise<string | undefined> {
    process.stdout.write(`\x1b[36m❯ ${message}: \x1b[0m\n`);
    const rl = readline.createInterface({
        input: process.stdin,
    })[Symbol.asyncIterator]();

    for await (const line of rl) {
        const error = validator(line.trim())
        if (error) {
            process.stdout.write(`\x1b[31m${error}\x1b[0m\n`);
            continue;
        }
        process.stdout.write(`\x1b[36m✔ ${line.trim()}\x1b[0m\n\n`);
        return line.trim()
    }
}


export class SceneManager {
    world: World

    constructor(world: World) {
        this.world = world
    }

    active = new Map<number, HydratedScene>();

    async createScene(options: {
        type: 'DEFAULT' | 'CONVERSATION' | 'BATTLE',
        location_id: number,
        summary?: string,
        character_ids?: number[],
    }) {
        if (!options.character_ids && options.type !== 'DEFAULT') throw new Error('Character IDs are required for non-default scenes.')
        if (options.type !== 'DEFAULT' && !options.summary) throw new Error('A summary is required for non-default scenes.')

        const newScene = await this.world.db.insert(scene).values({
            type: options.type,
            location_id: options.location_id,
            summary: options.summary || null
        })
            .returning()

        if (options.character_ids) {
            await this.world.db.update(character).set({
                scene_id: newScene[0].id
            })
                .where(inArray(character.id, options.character_ids))
        }

        //Remove these characters from their active scenes
        if (options.character_ids && options.summary) {
            for (const scene of this.active.values()) {
                scene.characters = scene.characters.filter(character => !options.character_ids!.includes(character.id))
                scene.thread.add('system', `*${options.character_ids!.length} people step aside. ${options.summary}*`)
            }
        }

        //Add new scene to active scenes
        const charactersToAdd = (options.character_ids) ? options.character_ids.map(id => this.world.players.get(id)!) :
            //DEFAULT SCENE, add all characters NOT in a scene but in the same location
            [...this.world.players.values(), ...this.world.npcs.values()].filter(c => c.location_id === options.location_id && c.scene_id === null)


        //Generate NPCs on-demand!
        if (options.type === 'DEFAULT' && charactersToAdd.filter(c => c.role === 'NPC').length === 0) {
            console.log(`Loading Location....`)
            const details = await this.world.helpers.fetchLocationDetails(options.location_id)

            //Add images to region/city/location if it doesn't exist
            if(details.region && !details.region?.landscape){
                const imageUrl = await generateImage(details.region.geographic_traits,'bg')
                this.world.regions.get(details.region.id)!.landscape = imageUrl
            }

            if(details.city && !details.city?.landscape){
                const imageUrl = await generateImage(details.city.geographic_traits, 'normal')
                this.world.cities.get(details.city.id)!.landscape = imageUrl
            }

            if(details.location && !details.location?.physical_traits){
                const imageUrl = await generateImage(details.location.physical_traits,'normal')
                this.world.locations.get(details.location.id)!.landscape = imageUrl
            }

            const generationThread = new Thread()
                .add('system', dedent`
                # MISSION 
                Given a location description, create 0-5 NPCs in the location using the tools provided.
                
                # GUIDELINES
                - Give NPCs unique names and traits and not too similar to each other.
                - Provide appropriate looks/traits for each NPC based on the location and region.
                
        
                `)
                .add('user', dedent`
                    Create NPCs for location ID **${options.location_id}**
                    ${(details.location) ? details.location.name : ''}: ${(details.location) ? details.location.physical_traits : ''}. ${(details.location) ? details.location.development_traits : ''}.
                    ${(details.city) ? `It lies in the city: ${details.city.name}` : ''}: ${(details.city) ? details.city.geographic_traits : ''}. ${(details.city) ? details.city.development_traits : ''}.
                    ${(details.region) ? `It is in the region: ${details.region.name}` : ''}.
                `)

            await genText({
                thread: generationThread,
                provider: 'openai',
                tools: {
                    createNPC: this.world.tools.create.createNewCharacter
                }
            })

            this.world.npcs.forEach(npc => {
                if (npc.location_id === options.location_id) {
                    charactersToAdd.push(npc)
                }
            })
        }


        this.active.set(newScene[0].id, new HydratedScene({
            scene: newScene[0],
            messages: [],
            world: this.world,
            characters: charactersToAdd
        }))

        return this.active.get(newScene[0].id)!
    }

    async getDefaultScene(locationID: number) {
        const defaultScene = Array.from(this.active.values()).find(scene => scene.scene.type === 'DEFAULT' && scene.scene.location_id === locationID)

        return defaultScene ?? (await this.createScene({
            type: 'DEFAULT',
            location_id: locationID
        }))
    }

    async restoreActiveScenes() {
        const latestSceneFetch = await this.world.db.query.scene
            .findMany({
                with: {
                    messages: {
                        with: {
                            character: true
                        }
                    }
                },
                where: eq(scene.active, true)
            })


        if (latestSceneFetch.length === 0) {
            await this.createScene({
                type: 'DEFAULT',
                location_id: this.world.players.get(1)!.location_id
            })

            return;
        }

        const allCharacters = [...this.world.players.values(), ...this.world.npcs.values()]


        for (const scene of latestSceneFetch) {
            this.active.set(scene.id, new HydratedScene({
                scene,
                messages: scene.messages,
                world: this.world,
                characters: allCharacters.filter(c => (scene.type === 'DEFAULT') ? c.scene_id === null && c.location_id === scene.location_id : c.scene_id === scene.id)
            }))
        }
    }

    async disposeScene(sceneID: number) {
        const sceneToDelete = this.active.get(sceneID)
        if (!sceneToDelete) return

        const charactersToMove = sceneToDelete?.characters
        const destinationScene = this.getDefaultScene(sceneToDelete.scene.location_id)
        await this.world.db.update(scene)
            .set({ active: false })
            .where(eq(scene.id, sceneID))

        if (charactersToMove) {
            for (const character of charactersToMove) {
                (await destinationScene).characters.push(character)
            }
        }

        sceneToDelete.dispose()
        this.active.delete(sceneID)
        return;
    }

    async movePlayerToLocation(charID: number, locationID: number) {
        const characterToMove = this.world.players.get(charID) || this.world.npcs.get(charID)
        if (!characterToMove) throw new Error(`[INTERNAL GAME ENGINE ERROR]: Character with ID ${charID} not found in the character map.`)

        characterToMove.location_id = locationID
        characterToMove.scene_id = null

        await this.world.db.update(character)
            .set({ scene_id: null, location_id: locationID })
            .where(eq(character.id, charID))

        //Remove character from current scene
        this.active.forEach(scene => {
            scene.characters = scene.characters.filter(c => c.id !== charID)
        })

        const sceneToAdd = await this.getDefaultScene(locationID)
        sceneToAdd.characters.push(characterToMove)
    }

    currentScene: HydratedScene | null = null
    sceneQueue: Array<HydratedScene> = []
    networkedState
    sync: () => void = () => { }

    async playerInput(input: string) {
        if (!this.currentScene) return;
        await this.currentScene.playerInput(input)
        this.sync()
        while (!this.currentScene.queueEmpty()) {
            const currentCharID = this.currentScene.activeCharacter.id
            this.networkedState.currentUserId = currentCharID
            const turnOver = await this.networkedState.nextTurn()
            if (!turnOver) {
                return;
            }
        }
        for (const scene of this.sceneQueue) {
            this.sceneQueue.shift();
            scene.refreshQueue()
            while (!scene.queueEmpty()) {
                this.currentScene = scene
                const currentCharID = scene.activeCharacter.id
                this.networkedState.currentUserId = currentCharID
                const turnOver = await scene.nextTurn()
                if (!turnOver) {
                    return;
                }
            }
        }

        this.startGameLoop(this.networkedState, this.sync)

    }

    async startGameLoop(networkedState:MyRoomState,sync:()=>void) {
        const scenes = Array.from(this.active.values())
        this.sync = sync
        this.networkedState = networkedState
        this.sceneQueue = scenes
        for (const scene of scenes) {
            console.log("OMG SCENE is0 ", scene)
            this.sceneQueue.shift();
            scene.refreshQueue()
            while (!scene.queueEmpty()) {
                sync()
                this.currentScene = scene
                const currentCharID = scene.activeCharacter.id
                networkedState.currentUserId = currentCharID
                const turnOver = await scene.nextTurn()
                if (!turnOver) {
                    return;
                }
            }
        }

    }
}