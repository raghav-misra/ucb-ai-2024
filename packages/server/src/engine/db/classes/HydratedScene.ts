import dedent from "dedent";
import { type Character, type Scene, type MessageWithCharacter, character, message } from "../schema.ts";
import type { World } from "./World.ts";
import { Thread, genJSON, genText } from "../../ai/index.ts";
import { z } from "zod";
import { Scene as networkedScene, Message as networkedMessage } from "../../../rooms/schema/MyRoomState.ts";

export class HydratedScene {
    scene: Scene;
    networkedScene: networkedScene;
    broadcast:any;
    world: World
    thread = new Thread()

    turnQueue: Array<Character> = []
    characters: Array<Character> = []
    turnIndex: number = 0
    turnCountByPlayer = new Map<number, number>()

    get activeCharacter() {
        return this.turnQueue[this.turnIndex]
    }

    constructor({
        scene,
        messages,
        characters,
        world
    }: {
        scene: Scene,
        messages: MessageWithCharacter[],
        characters: Array<Character>,
        world: World
    }) {
        this.scene = scene
        this.world = world
        this.characters = characters

        for (const message of messages) {
            let lastCharID = null as number | null
            if (message.character) {
                if (lastCharID !== message.character.id) this.thread.add('user', `### ${message.character.name}'S TURN ###`)

                this.thread.add('user', `[${message.character.name} (ID: ${message.character.id})] ${message.message}`)
                lastCharID = message.character.id
            } else {
                this.thread.add('system', message.message)
            }
        }
    }

    contextify = {
        world: () => {
            const current = this.world.helpers.fetchLocationDetails(this.scene.location_id)

            const context = dedent`
            The current scene is taking place in the **${current.location.name}**.

            ${(current.region) ? dedent`## CURRENT REGION
            Name: ${current.region.name}
            Geographic Traits: ${current.region.geographic_traits}
            Development Traits: ${current.region.development_traits}
            Fun Fact: ${current.region.random}` : ''}
                        
            ${(current.city) ? dedent`## CURRENT CITY
            Name: ${current.city.name}
            Geographic Traits: ${current.city.geographic_traits}
            Development Traits: ${current.city.development_traits}
            Fun Fact: ${current.city.random}` : ''}
    
            ${(current.location) ? dedent`## CURRENT LOCATION
            Name: ${current.location.name}
            Physical Traits: ${current.location.physical_traits}
            Development Traits: ${current.location.development_traits}` : ''}
            `

            return context

        },
        characters: () => {
            const activeCharID = this.activeCharacter.id
            const relationshipIDs = this.world.characterRelationshipEdgeList.get(activeCharID) || new Map()

            const characterSummary = this.characters.map((character) => {
                //Skip active character
                if (character.id === activeCharID) return

                const relationshipID = relationshipIDs.get(character.id)
                const relationship = this.world.characterRelationships.get(relationshipID)
                return (dedent`
                ## ${character.name} (ID=${character.id})
                ${character.physical_traits}
                ### Relation
                ${(relationship) ? `${relationship.type}\n${relationship.journal}` : 'Never met'}`)
            }).join("\n")

            return dedent`
            ## CHARACTERS IN THE SCENE
            ${(characterSummary.trim() === '') ? 'No other characters in the scene.' : characterSummary}
            `
        },
        me: () => {
            return dedent`
            ## CURRENT PLAYER
            I am ${this.activeCharacter.name} (ID=${this.activeCharacter.id}).
            I am ${this.activeCharacter.personality_traits}.
            My usual appearance is ${this.activeCharacter.physical_traits}.
            `
        },
        all: () => `## SCENE\n\n${this.contextify.world()}\n\n${this.contextify.characters()}`,


        system: () => {
            const characterSummary = this.characters.map((character) => {
                let summary = `- ${character.name}`
                if (this.activeCharacter.id === character.id) summary += ' (this character is performing the action)'
                return summary
            }).join("\n")


            return dedent`
            # CHARACTERS
            ${characterSummary}

            # SKILLS USED
            ${this.world.turnState.skillsUsed.map(skill => `- ${skill}`).join("\n")}

            # ITEMS USED
            ${this.world.turnState.itemsUsed.map(item => `- ${item}`).join("\n")}`
        }
    }

    refreshQueue() {
        this.turnQueue.length = 0
        this.turnIndex = 0
        for (const character of this.characters) {
            this.turnQueue.push(character)
            this.turnCountByPlayer.set(character.id,
                (this.turnCountByPlayer.get(character.id) || 0) + 1
            )
        }
    }

    //Message Management
    async saveMessage(characterID: number | null, content: string) {
        if(this.networkedScene && characterID && !content.startsWith('###')){
            this.networkedScene.messages.push(new networkedMessage({
                userId: characterID,
                message: content
            }))
            const charInfo = this.characters.find(c => c.id === characterID)
            const splitSentences = content.split('.')
            for (const sentence of splitSentences) {
                this.broadcast('NEW_MESSAGE', {
                    characterID,
                    characterName:charInfo.name,
                    message: sentence.trim() + '.'
                })
                await new Promise(resolve => setTimeout(resolve, 100))
            }
        }
        await this.world.db.insert(message).values({
            character_id: characterID,
            scene_id: this.scene.id,
            message: content,
            timestamp: new Date().getTime(),
            timestamp_in_game: 0
        })
    }

    queueEmpty() {
        return this.turnQueue.length === 0
    }

    dispose() {
        this.characters = []
        this.turnQueue = []
    }

    //Returns if the turn is over
    async nextTurn() {
        const numPlayers = this.characters.filter(c => c.role === 'PLAYER').length
        if (numPlayers === 0) {
            //Clean up if non default scene
            this.world.scenes.disposeScene(this.scene.id)
            return;
        }

        if (this.queueEmpty()) {
            return;
        }

        this.world.turnState.itemsUsed = []
        this.world.turnState.skillsUsed = []
        this.world.turnState.notes = []
        this.world.turnState.location_id = this.scene.location_id
        this.world.turnState.scene_id = this.scene.id
        this.world.turnState.new_location_id = null

        this.thread.add('user', `### ${this.activeCharacter.name}'S TURN ###`)
        console.log(`### ${this.activeCharacter.name}'S TURN ###`)


        if (this.activeCharacter.role === 'NPC') {
            await this.npcInput()
            return true;
        } else if (this.activeCharacter.role === 'PLAYER') {
            if (this.turnCountByPlayer.get(this.activeCharacter.id) === 1) {
                await this.narrate()
            }
            return false;
        }
    }

    async narrate() {
        this.thread.setSystemPrompt(
            dedent`
            # MISSION
            You are a dungeon master.
            Narrate the current scene in first-person perspective of the player.

            # INPUT
            Details on the current scene including previous dialogue

            # OUTPUT
            Use rich storytelling techniques to create a compelling narrative that engages the player in what is happening.
            Focus on what the player can see and hear and include vivid descriptions of the environment and other characters.

            # LIMITATIONS
            Limit the narrative to a maximum of 300 words.

            # Perspective
            Use first person narration and write in the user character's perspective.

            ${this.contextify.world()}
            `
        )
        const location = this.world.locations.get(this.scene.location_id)
        this.thread.add('user', formatCharacterMessage(this.activeCharacter, `I step into the ${location?.name}. What do I see?`))

        const result = await genText({
            thread: this.thread,
            provider: 'openai'
        })

        this.thread.add('user', formatCharacterMessage(this.activeCharacter, `*${result}*`))
        await this.saveMessage(this.activeCharacter.id, `*${result}*`)
        //console.log(result)
        return result
    }

    async playerInput(message: string) {
        if(!this.activeCharacter) return;
        const startingPlayerLocationID = this.activeCharacter.location_id
        
        /*
        //PARSE INTENT
        const intentThread = new Thread()
        .add('system',dedent`
        # MISSION
        Given a user message for an in-game action, extract key information to fill the provided json schema.

        Try to fill everyting in the schema.

        # CONTEXT
        ${this.contextify.characters()}
        `)
        
        intentThread.add('user',formatCharacterMessage(this.activeCharacter,`${message}`))

        const intent = await genJSON({
            thread:intentThread,
            schema:z.object({
                intent:z.enum(['CHANGE_LOCATION','OBSERVE','USE_ITEM','USE_SKILL','DO','TALK'])
                .describe('The category of action the user is trying to perform.'),
                targetCharacterIDs:z.array(z.number()).describe('The IDs of the characters to targeted by the action, if any.'),
                targetObjects:z.array(z.string()).describe('The objects to targeted by the action, if any.'),
                itemName:z.string().describe('The name of the item being used, if any.'),
                skillName:z.string().describe('The name of the skill being used, if any.'),
            }),
            provider: 'openai'
        })
              
        console.log(intent) */


        //VALIDATE ACTION =======================
        const validationThread = new Thread()
        validationThread.add('user', formatCharacterMessage(this.activeCharacter, `LATEST INPUT: "${message}"`))

        validationThread.setSystemPrompt(
            dedent`
            # MISSION
            You are a dungeon master and you must validate a player's action to ensure it is within the bounds of the game.
            
            # INPUT
            - Details on the current scene including previous dialogue
            - Latest player input

            # OUTPUT
            Reply with "done" when you are done

            # STEPS
            1. Parse the user's input and determine what needs to be validated.
            2. Run as many validation functions as needed.
            3. Reply "done" when you are done.

            ${this.contextify.characters()}
            `
        )

        await genText({
            thread: validationThread,
            provider: 'openai',
            tools: {
                ...this.world.tools.validate,
            },
        })



        //EXECUTE ACTION ======================
        this.thread.add('user', formatCharacterMessage(this.activeCharacter, `${message}`))
        this.thread.setSystemPrompt(
            dedent`
            # MISSION
            You are a dungeon master and you must implement player input into game actions and compose a detailed narration based on the results of the actions.
            
            # INPUT
            - Details on the current scene including previous dialogue
            - Latest player input

            # OUTPUT
            First person narration of the player's input and the results of the actions.

            # STEPS
            1. Parse the player's input and determine the action to take.
            2. Implement the action using tools provided
            3. Read the results of the tools and compose a detailed narration based on the results.

            # GUIDELINES
            - Use consice storytelling techniques to create a compelling narrative that engages the player in what is happening as quickly as possible.
            - Stay focused on the action cause and effect.
            - Do not write reactions from other characters, only focus on action cause and effect.

            #LIMITATIONS
            Limit the narrative to a maximum of 100 words.
            
            # NOTES
            ${this.world.turnState.notes.join("\n")}

            ${this.contextify.all()}
            `
        )

        const result = await genText({
            thread: this.thread,
            provider: 'openai',
            tools: {
                ...this.world.tools.actions,
            }
        })

        this.thread.add('user', formatCharacterMessage(this.activeCharacter, `*${message}*`))
        await this.saveMessage(this.activeCharacter.id, message)
        await this.saveMessage(this.activeCharacter.id, `*${result}*`)
       // console.log(result)

        //APPLY EFFECTS =======================
        const effectThread = new Thread()
        effectThread.add('system', dedent`
            # MISSION
            You are a dungeon master in charge of interpreting the effects and severity of actions and applying them to the game world using the tools provided.

            # INPUT
            - An action that has been performed and the results of the action.
            - Helpful context about the scene and turn info

            # GUIDELINES
            1. Continue to use tools to fully add the effects of an action to the game world.
            2. After applying the effects, check to see if a major event is starting/ending with another character, and if so, start a new scene.
            2. Reply with "done" when you are done.` + `\n\n${this.contextify.system()}`)
        effectThread.add('user', dedent`
            CAUSE:
            ${formatCharacterMessage(this.activeCharacter, `"""${message}"""`)}
            RESULT:
            """${result}"""
            `)

        const tools = {
            ...this.world.tools.effects,
        }

        if (this.scene.type === 'DEFAULT' && startingPlayerLocationID === this.activeCharacter.location_id) {
            tools.startNewScene = this.world.tools.scene.startNewScene
        } else if (startingPlayerLocationID === this.activeCharacter.location_id) {
            tools.endScene = this.world.tools.scene.endScene
        }

        await genText({
            thread: effectThread,
            provider: 'openai',
            tools
        })
        this.turnQueue.shift()
        console.log(`TURN DONE: next up:${this.turnQueue[0]?.name}`)

        return {
            success: true,
            result
        }
    }

    async npcInput() {
        const npcResponseThread = Thread.CopyThread(this.thread)
        npcResponseThread.setSystemPrompt(
            dedent`
            # MISSION
            Write ${this.thread}'s next reply / action in a fictional game. Write 1 action only, italicize actions, and avoid quotation marks.

            # GUIDELINES
            Write in first person as if you are the character. ONLY write for this character do NOT write or add behavior for other characters.

            # OTHER CHARACTERS
            ${this.contextify.all()}

            # YOUR CHARACTER 
            ${this.contextify.me()}

            # FIRST PERSON
            Use words like "I" and "me" to refer to yourself.
            `
        )

        const result = await genText({
            thread: npcResponseThread,
            provider: 'openai',
            max_tokens: 500
        })

        await this.playerInput(result)
        return result
    }
}

const formatCharacterMessage = (character: Character, message: string) => {
    return `[${character.name} (ID: ${character.id})] ${message}`
}