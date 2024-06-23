import { loadDB, Schema } from "../manager.ts";
import { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { RegionInsertZod, CityEdgeInsertZod, CityInsertZod, LocationInsertZod, CharacterInsertZod, ItemInsertZod, QuestInsertZod, region, item, city, location, character, scene, cityEdge, Region, City, Character, Location, Scene, CharacterRelationship, character_relationship, message, Message, Item, Skill, skill, inventory, skill_character, SkillInsertZod } from "../schema.ts";
import { Thread, genJSON } from "../../ai/index.ts";
import { z } from "zod";
import dedent from "dedent";
import { and, desc, eq, or } from "drizzle-orm";
import { HydratedScene } from "./HydratedScene.ts";
import type { CoreTool } from "ai";
import { injectSeed, nameToID, randInt } from "../../utils.ts";
import { SceneManager } from "./SceneManager.ts";
import { match } from "fuzzyjs";
import { IBuilderState } from "../../../routes/init.ts";
import { generateImage } from "../../../routes/sdxl.ts" 

interface WorldConfig {
    dbName: string,
    builderState: IBuilderState,
    stats: keyof Character[],
    player: {
        name: string;
    },
    difficulty: {
        'Very Easy': number,
        'Easy': number,
        'Medium': number,
        'Hard': number,
        'Very Hard': number
        'Nearly Impossible': number,
        'FORCE FAIL': number
    },
}
type Difficuty = keyof WorldConfig['difficulty']

export class World {
    db: BunSQLiteDatabase<Schema>
    config: WorldConfig

    //Object storage
    regions: Map<number, Region> = new Map()
    cities: Map<number, City> = new Map()
    locations: Map<number, Location> = new Map()
    items: Map<string, Item> = new Map()
    skills: Map<string, Skill> = new Map()
    npcs: Map<number, Character> = new Map()
    players: Map<number, Character> = new Map()
    characterRelationships: Map<number, CharacterRelationship> = new Map()
    characterInventories: Map<number, Map<number, number>> = new Map()
    characterSkills: Map<number, Map<number, boolean>> = new Map()
    cityEdgeList: Map<number, Set<number>> = new Map()
    characterRelationshipEdgeList: Map<number, Map<number, number>> = new Map()

    //State
    turnState = {
        itemsUsed: [] as string[],
        skillsUsed: [] as string[],
        notes: [] as string[],
        location_id: null as number | null,
        new_location_id: null as number | null,
        scene_id: null as number | null
    }

    broadcast:any


    helpers = {
        fetchLocationDetails: (locationID: number) => {
            const location = this.locations.get(locationID)
            if (!location) throw new Error(`Location with ID ${locationID} not found in the locations map.`)

            const city = (location.city_id) ? this.cities.get(location.city_id) : null
            const region = (city) ? this.regions.get(city.region_id) : null

            return {
                location,
                city,
                region
            }
        },
        fetchOrCreateItem: async (item_name: string) => (
            this.items.get(nameToID(item_name)) ?? await this.tools.create.createNewItem.execute(item_name)
        ),
        fetchOrCreateSkill: async (skill_name: string) => (
            this.skills.get(nameToID(skill_name)) ?? await this.tools.create.createNewSkill.execute(skill_name)
        )
    }

    constructor(config: WorldConfig) {
        this.config = config
    }

    //Init API
    async init() {
        this.db = await loadDB(this.config.dbName, this.config.builderState, this.config.player);
        await this.reload()
        if (this.players.size === 0) throw new Error('No players found in the database. Please add a player character before starting the game.')
        await this.scenes.restoreActiveScenes()
        this.buildTools()
    }

    async reload() {
        const regionsFetch = await this.db.select().from(region)
        this.regions.clear()
        for (const region of regionsFetch) {
            this.regions.set(region.id, region)
        }

        const citiesFetch = await this.db.select().from(city)
        this.cities.clear()
        for (const city of citiesFetch) {
            this.cities.set(city.id, city)
        }

        const cityEdgesFetch = await this.db.select().from(cityEdge)
        this.cityEdgeList.clear()
        for (const cityEdge of cityEdgesFetch) {
            if (!this.cityEdgeList.has(cityEdge.city_id_1)) this.cityEdgeList.set(cityEdge.city_id_1, new Set())
            if (!this.cityEdgeList.has(cityEdge.city_id_2)) this.cityEdgeList.set(cityEdge.city_id_2, new Set())

            this.cityEdgeList.get(cityEdge.city_id_1)!.add(cityEdge.city_id_2)
            this.cityEdgeList.get(cityEdge.city_id_2)!.add(cityEdge.city_id_1)
        }

        const locationsFetch = await this.db.select().from(location)
        this.locations.clear()
        for (const location of locationsFetch) {
            this.locations.set(location.id, location)
        }

        const itemsFetch = await this.db.select().from(item)
        this.items.clear()
        for (const item of itemsFetch) {
            this.items.set(nameToID(item.name), item)
        }

        const skillsFetch = await this.db.select().from(skill)
        this.skills.clear()
        for (const skill of skillsFetch) {
            this.skills.set(nameToID(skill.name), skill)
        }

        const charactersFetch = await this.db.select().from(character)
        this.npcs.clear()
        for (const character of charactersFetch) {
            if (character.role === 'PLAYER') this.players.set(character.id, character)
            else this.npcs.set(character.id, character)

            this.characterInventories.set(character.id, new Map())
            this.characterSkills.set(character.id, new Map())
            this.characterRelationshipEdgeList.set(character.id, new Map())
        }

        const characterRelationshipsFetch = await this.db.select().from(character_relationship)
        this.characterRelationships.clear()
        for (const characterRelationship of characterRelationshipsFetch) {
            this.characterRelationships.set(characterRelationship.id, characterRelationship)
            this.characterRelationshipEdgeList.get(characterRelationship.character_id_1)!.set(characterRelationship.character_id_2, characterRelationship.id)
            this.characterRelationshipEdgeList.get(characterRelationship.character_id_2)!.set(characterRelationship.character_id_1, characterRelationship.id)
        }

        const characterInventoriesFetch = await this.db.select().from(inventory)
        this.characterInventories.clear()
        for (const characterInventory of characterInventoriesFetch) {
            this.characterInventories.get(characterInventory.character_id)!.set(characterInventory.item_id, characterInventory.quantity)
        }

        const characterSkillsFetch = await this.db.select().from(skill_character)
        this.characterSkills.clear()
        for (const characterSkill of characterSkillsFetch) {
            this.characterSkills.get(characterSkill.character_id)!.set(characterSkill.skill_id, true)
        }



        return this
    }

    scenes = new SceneManager(this)

    //TOOLS
    tools = {
        create: {
            createRegion: {
                description: 'Create a new region in the DB. Regions are the largest unit of space in the game.',
                parameters: z.string().describe('Name and key points describing the region.'),
                execute: async (description) => {
                    const thread = new Thread()
                        .add('system', dedent`
                        # MISSION
                        Given a basic region description, generate a more detailed JSON object that represents the region for an RPG game.`)
                        .add('user', description)

                    const result = await genJSON({
                        thread,
                        schema: RegionInsertZod,
                        provider: 'openai'
                    })
                    const seededResult = injectSeed(result) as Region

                    const imageUrl = await generateImage(result.geographic_traits,'bg')

                    seededResult.landscape = imageUrl

                    const newRegion = await this.db.insert(region).values(seededResult)
                        .returning()

                    this.regions.set(newRegion[0].id, newRegion[0])
                    return seededResult
                }
            },
            createCity: {
                description: 'Create a new city in the DB. Cities are within a region and are the second largest unit of space in the game.',
                parameters: z.object({
                    cityInfo: z.string().describe('Name and key points describing the city.'),
                    regionId: z.number().describe('The ID of the region the city is in.')
                }),
                execute: async ({ cityInfo, regionId }) => {
                    const thread = new Thread()
                        .add('system', dedent`
                        # MISSION
                        Given a basic city description, generate a more detailed JSON object that represents the city for an RPG game.
                        The city should be within the region with the given ID.`)
                        .add('user', cityInfo)

                    const result = await genJSON({
                        thread,
                        schema: CityInsertZod,
                        provider: 'openai'
                    })

                    const seededResult = injectSeed(result) as City

                    const imageUrl = await generateImage(seededResult.geographic_traits, 'normal')

                    seededResult.landscape = imageUrl;

                    const newCity = await this.db.insert(city).values({
                        ...seededResult,
                        region_id: regionId
                    })
                    this.cities.set(newCity[0].id, newCity[0])

                    return seededResult
                }
            },
            createNewLocationInCity: {
                description: 'Create a location within a city. Create points of interest, shops, and other places the player can visit.',
                parameters: z.object({
                    locationInfo: z.string().describe('Name and key points describing the location.'),
                    cityId: z.number().describe('The ID of the city the location is in.')
                }),
                execute: async ({ locationInfo, cityId }) => {
                    const thread = new Thread()
                        .add('system', dedent`
                        # MISSION
                        Given a basic location description, generate a more detailed JSON object that represents the location for an RPG game.
                        The location should be within the city with the given ID.`)
                        .add('user', locationInfo)

                    const result = await genJSON({
                        thread,
                        schema: LocationInsertZod,
                        provider: 'openai'
                    })
                    const seededResult = injectSeed(result) as Location

                    const imageUrl = await generateImage(result.physical_traits,'normal')

                    seededResult.landscape = imageUrl

                    const newLocation = await this.db.insert(location).values({
                        ...seededResult,
                        city_id: cityId
                    })
                    this.locations.set(newLocation[0].id, newLocation[0])
                    return seededResult
                }
            },
            createNewLocationBetweenCities: {
                description: 'Create a location that the player must travel through when leaving one city and entering another.',
                parameters: z.object({
                    locationInfo: z.string().describe('Name and key points describing the location.'),
                    distance: z.number().describe('The distance in miles the player must travel to get to the other region.'),
                    cityID1: z.number().describe('The ID of the first city on the edge'),
                    cityID2: z.number().describe('The ID of the second city on the edge')
                }),
                execute: async ({ locationInfo, distance, cityID1, cityID2 }) => {
                    //Attempt to fetch edge ID
                    let edge = await this.db.select({ id: cityEdge.id }).from(cityEdge)
                        .where(
                            or(
                                and(
                                    eq(cityEdge.city_id_1, cityID1),
                                    eq(cityEdge.city_id_2, cityID2)
                                ),
                                and(
                                    eq(cityEdge.city_id_1, cityID2),
                                    eq(cityEdge.city_id_2, cityID1)
                                )
                            )
                        )
                        .limit(1)


                    if (edge.length === 0) {
                        //Create edge and insert
                        const info = await this.db.insert(cityEdge).values({
                            city_id_1: cityID1,
                            city_id_2: cityID2,
                            distance: distance
                        }).returning({ id: cityEdge.id })
                        edge = info
                        this.cityEdgeList.get(cityID1)!.add(cityID2)
                        this.cityEdgeList.get(cityID2)!.add(cityID1)
                    }

                    const edgeID = edge[0]?.id

                    if (!edgeID) throw new Error(`[INTERNAL GAME ENGINE ERROR]: Could not find edge ID for location between cities ${cityID1} and ${cityID2}`)


                    const thread = new Thread()
                        .add('system', dedent`
                        # MISSION
                        Given a basic location description, generate a more detailed JSON object that represents the location for an RPG game.
                        The location should be between the two regions with the given IDs.`)
                        .add('user', locationInfo)

                    const result = await genJSON({
                        thread,
                        schema: LocationInsertZod,
                        provider: 'openai'
                    })
                    const seededResult = injectSeed(result) as Location

                    const imageUrl = await generateImage(seededResult.physical_traits,"normal")

                    seededResult.landscape;

                    const newLocation = await this.db.insert(location).values({
                        ...seededResult,
                        city_edge_id: edgeID,
                    })

                    this.locations.set(newLocation[0].id, newLocation[0])
                    return newLocation
                }
            },
            createNewCharacter: {
                description: 'Create a new character in the DB.',
                parameters: z.object({
                    characterInfo: z.string().describe('Name and key points describing the character.'),
                    locationId: z.number().describe('The ID of the current location the character is in.')
                }),
                execute: async ({ characterInfo, locationId }) => {
                    const thread = new Thread()
                        .add('system', dedent`
                        # MISSION
                        Given a basic character description, generate a more detailed JSON object that represents the character for an RPG game.`)
                        .add('user', characterInfo)

                    const result = await genJSON({
                        thread,
                        schema: CharacterInsertZod,
                        provider: 'openai'
                    })
                    const seededResult = injectSeed(result) as Character

                   

                    const imageUrl = await generateImage("headshot avatar "+ seededResult.physical_traits,'avatar');
                    seededResult.headshot = imageUrl;

                    const newCharacter = await this.db.insert(character).values({
                        ...seededResult,
                        location_id: locationId,
                        role: 'NPC'
                    })
                    .returning()
                    

                    this.players.set(newCharacter[0].id, newCharacter[0])

                    return newCharacter
                }
            },
            createNewItem: {
                description: 'If an item is not found in the DB use this tool to create a new item.',
                parameters: z.string().describe('Basic item description.'),
                execute: async (description) => {
                    const thread = new Thread()
                        .add('system', dedent`
                        # MISSION
                        Given a basic item description, generate a more detailed JSON object that represents the item for an RPG game.`)
                        .add('user', description)

                    const result = await genJSON({
                        thread,
                        schema: ItemInsertZod,
                        provider: 'openai'
                    })
                    const seededResult = injectSeed(result) as Item

                    const imageUrl = await generateImage('game icon ' + seededResult.physical_traits,'icon')

                    seededResult.image = imageUrl
                    

                    const newItem = await this.db.insert(item).values(seededResult)
                        .returning()
                    

                    this.items.set(nameToID(newItem[0].name), newItem[0])
                    return newItem[0]
                }
            },
            createNewSkill: {
                description: 'If a skill is not found in the DB use this tool to create a new skill.',
                parameters: z.string().describe('Basic skill description.'),
                execute: async (description) => {
                    const thread = new Thread()
                        .add('system', dedent`
                        # MISSION
                        Given a basic skill description, generate a more detailed JSON object that represents the skill for an RPG game.`)
                        .add('user', description)

                    const result = await genJSON({
                        thread,
                        schema: SkillInsertZod,
                        provider: 'openai'
                    })
                    const seededResult = injectSeed(result) as Skill
                    const imageUrl = await generateImage('abllity icon ' + seededResult.description,'icon')

                    seededResult.icon = imageUrl;

    
                    const newSkill = await this.db.insert(skill).values(seededResult)
                        .returning()
                    this.skills.set(nameToID(newSkill[0].name), newSkill[0])
                    return seededResult as Skill
                }
            }
        },

        validate: {
            canUseItem: {
                description: 'Check if the player has enough of a specific item in their inventory.',
                parameters: z.object({
                    itemName: z.string().describe('The name of the item to check for.'),
                    characterID: z.number().describe('The ID of the character to check for the item.'),
                    requiredAmount: z.number().optional().describe('The amount of the item required.'),
                }),
                execute: async ({ characterID, itemName, requiredAmount }) => {
                    if (itemName.trim() === '') return "Invalid item name. It is blank.";
                    const character = this.players.get(characterID) || this.npcs.get(characterID)
                    if (!character) throw new Error(`[INTERNAL GAME ENGINE ERROR]: Character with ID ${characterID} not found in the character map.`)

                    const item = await this.helpers.fetchOrCreateItem(itemName)
                    if (!item) {
                        this.turnState.notes.push(
                            `Item ${itemName} has not been added to the game yet. Improvise if appropriate.`
                        )
                        return this.turnState.notes[this.turnState.notes.length - 1];
                    }

                    const inventory = this.characterInventories.get(characterID)?.get(item.id)
                    if (!inventory) {
                        this.turnState.notes.push(
                            `${character.name} does not have ${itemName} in their inventory. The task has become nearly impossible!`
                        )
                        return this.turnState.notes[this.turnState.notes.length - 1];
                    }

                    if (inventory < (requiredAmount || 1)) {
                        this.turnState.notes.push(
                            `${character.name} only has ${inventory} of ${itemName}.`
                        )
                        return this.turnState.notes[this.turnState.notes.length - 1];
                    }

                    this.turnState.itemsUsed.push(item.name)
                    this.turnState.notes.push(
                        `${character.name} has ${inventory} "${itemName}".`
                    )
                    return this.turnState.notes[this.turnState.notes.length - 1];
                }
            },

            canUseSkill: {
                description: 'Check if the player has a specific skill.',
                parameters: z.object({
                    skillName: z.string().describe('The name of the skill to check for.'),
                    characterID: z.number().describe('The ID of the character to check for the skill.')
                }),
                execute: async ({ characterID, skillName }) => {
                    if (skillName.trim() === '') return "Invalid skill name. It is blank.";

                    const character = this.players.get(characterID) || this.npcs.get(characterID)
                    if (!character) throw new Error(`[INTERNAL GAME ENGINE ERROR]: Character with ID ${characterID} not found in the character map.`)


                    const skill = await this.helpers.fetchOrCreateSkill(skillName)
                    if (!skill) {
                        this.turnState.notes.push(
                            `The skill ${skillName} has not been added to the game yet. Improvise if appropriate.`
                        )
                        return this.turnState.notes[this.turnState.notes.length - 1];
                    }

                    const characterSkills = this.characterSkills.get(characterID)
                    if (!characterSkills) {
                        this.turnState.notes.push(
                            `${character.name} is not proficient with any skills.`
                        )
                        return this.turnState.notes[this.turnState.notes.length - 1];
                    }

                    if (!characterSkills.get(skill.id)) {
                        this.turnState.notes.push(
                            `${character.name} is not proficient with the "${skillName}" skill.`
                        )
                        return this.turnState.notes[this.turnState.notes.length - 1];
                    }

                    const hasEnoughEnergy = skill.energy_cost <= character.energy
                    if (!hasEnoughEnergy) {
                        this.turnState.notes.push(
                            `${character.name} does not have enough energy to use ${skillName} at the moment.`
                        )
                        return this.turnState.notes[this.turnState.notes.length - 1];
                    }

                    character.energy -= skill.energy_cost
                    this.turnState.skillsUsed.push(skill.name)
                    this.turnState.notes.push(
                        `${character.name} has used ${skillName}.`
                    )
                    return this.turnState.notes[this.turnState.notes.length - 1];
                }
            },

            canTravelToLocation: {
                description: 'Check if the player can travel to a location.',
                parameters: z.object({
                    location: z.string().describe('The name of the location to check for.'),
                    characterID: z.number().describe('The ID of the character to check for the skill.')
                }),
                execute: async ({ location, characterID }) => {
                    const character = this.players.get(characterID);
                    if (!character) return;

                    const currentLocation = this.helpers.fetchLocationDetails(character.location_id);
                    const currentCityID = currentLocation.city?.id
                    const allLocations = Array.from(this.locations.values())
                    const validLocationIds: number[] = [];

                    // option 1: in the same city
                    for (let loc of this.locations.values()) {
                        if (loc.city_id === currentLocation.city?.id) {
                            validLocationIds.push(loc.id);
                        }
                    }

                    // option 2: connected city
                    const connectedCities = Array.from(this.cityEdgeList.get(currentCityID) ?? new Map())
                    .map(cID=>this.cities.get(cID))
                    for (const city of connectedCities) {
                        if(!city) continue
                        const locationsInCity = allLocations.filter(l=>l.city_id===city.id)
                        for (const location of locationsInCity) {
                            validLocationIds.push(location.id)
                        }
                    }

                    const validLocations = validLocationIds.map(id=>this.locations.get(id))
                    

                    const scoredLocations = validLocations.map(loc => ({
                        loc,
                        score: match(location, loc.name)
                    }));

                    let maxScoredLocation = null as Location | null;
                    let maxScore = 0;

                    for (let loc of scoredLocations) {
                        if (loc.score.score > maxScore) {
                            maxScoredLocation = loc.loc;
                        }
                    }

                    if (maxScore >= 87 && maxScoredLocation !== null) {
                        //Success
                        this.turnState.new_location_id = maxScoredLocation?.id;
                        this.turnState.notes.push(
                            `${character.name} can travel to "${maxScoredLocation?.name}" (ID=${maxScoredLocation?.id}).`
                        )
                        return this.turnState.notes[this.turnState.notes.length - 1];
                    } else {
                        return dedent`
                        Could not find a location that matches the given name.
                        If you are moving to a location already close to your current location you do NOT need to specify a new location..
                        
                        Possible locations:
                        ${validLocations.map(loc => `- ${loc.name}`).join("\n")}
                        `
                    }
                }
            }
        },

        actions: {
            goToLocation: {
                description: "Send player to a different location",
                parameters: z.object({
                    locationID: z.string().describe("The new location ID"),
                    characterID: z.number().describe('The ID of the character to check for the skill.')
                }),
                execute: async ({ locationID, characterID }) => {
                    const character = this.players.get(characterID);
                    if (!character) return "Unknown character ID";

                    //Found a match
                    if (locationID) {
                        const newLocation = this.helpers.fetchLocationDetails(locationID);
                        await this.scenes.movePlayerToLocation(characterID, locationID);
                        return `${character.name} has traveled to ${newLocation.location.name}.`;
                    } else {
                        return dedent`
                        Could not find a location that matches the given name.
                        If you are moving to a location already close to your current location you do NOT need to specify a new location..
                        `
                    }


                }
            },
            exploreSurroundings: {
                description: "Discover a random nearby location.",
                parameters: z.object({
                    characterID: z.number().describe('The ID of the character to check for the skill.')
                }),
                execute: async ({ characterID }) => {
                    const character = this.players.get(characterID);
                    if (!character) return;

                    const currentLocation = this.helpers.fetchLocationDetails(character.location_id);
                    const currentCityID = currentLocation.city?.id
                    const allLocations = Array.from(this.locations.values())
                    const validLocationIds: number[] = [];

                    // option 1: in the same city
                    for (let loc of this.locations.values()) {
                        if (loc.city_id === currentLocation.city?.id) {
                            validLocationIds.push(loc.id);
                        }
                    }

                    // option 2: connected city
                    const connectedCities = Array.from(this.cityEdgeList.get(currentCityID) ?? new Map())
                    .map(cID=>this.cities.get(cID))
                    for (const city of connectedCities) {
                        if(!city) continue
                        const locationsInCity = allLocations.filter(l=>l.city_id===city.id)
                        for (const location of locationsInCity) {
                            validLocationIds.push(location.id)
                        }
                    }

                    if (validLocationIds.length > 0) {
                        const randomLocationID = validLocationIds[randInt(0, validLocationIds.length - 1)];
                        const location = this.locations.get(randomLocationID);
                        return `There is a ${location?.name} in the distance.`;
                    } else {
                        return "There is no nearby location to explore.";
                    }
                }
            },
        } as Record<string, CoreTool>,

        effects: {
        } as Record<string, CoreTool>,

        scene: {
            startNewScene: {
                description: `If a MAJOR event involving multiple characters seems to be starting. Start a new scene.`,
                parameters: z.object({
                    character_ids: z.array(z.number()).describe('The IDs of the characters involved in the new scene.'),
                    description: z.string().describe('A concise description of what is happening in the new scene.'),
                    type: z.enum(['CONVERSATION', 'BATTLE']).describe('The type of scene to start.'),
                }),
                execute: async ({ character_ids, description, type }) => {
                    if (character_ids.length <= 1) return `There is no need to start a new scene if there is only one character involved.`;
                    await this.scenes.createScene({
                        type,
                        location_id: this.turnState.location_id as number,
                        character_ids,
                        summary: description
                    })
                    return `A new scene has been started. ${scene.summary}`
                }
            },
            endScene: {
                description: `If a major event involving multiple characters seems to be ending. End the current scene.`,
                parameters: z.object({
                    location_id: z.number().describe('The ID of the location the scene is ending in.'),
                }),
                execute: async () => {
                    const scene = this.scenes.active.get(this.turnState.scene_id as number)
                    if (!scene || scene.scene.type === 'DEFAULT') return
                    await this.scenes.disposeScene(this.turnState.scene_id as number)
                    return `The scene has ended!`
                }
            }
        } as Record<string, CoreTool>


    }

    buildTools() {
        if (!this.config) return
        const DIFFICULTY_ENUMS = Object.keys(this.config.difficulty) as any
        const STATS_ENUMS = this.config.stats as any


        //ACTIONS
        this.tools.actions.observation = {
            description: 'Implement a player\'s observation request with a skill check.',
            parameters: z.object({
                target: z.string().describe('The target of the observation.'),
                difficulty: z.enum(DIFFICULTY_ENUMS),
                stat: z.enum(STATS_ENUMS).describe('The skill check stat to use.'),
                characterID: z.number().describe('The ID of the character to use for the skill check.')
            }),
            execute: async ({ target, difficulty, stat, characterID }) => {
                const result = this.mechanics.skillCheck(characterID, stat, difficulty)
                return `${(result.isCritical) ? 'CRITICAL ' : ''}${(result.success) ? 'SUCCESS' : 'FAILURE'}`
            }
        }

        this.tools.actions.useItem = {
            description: `Implement a player's request to use an item.`,
            parameters: z.object({
                item_name: z.string().describe('The name of the item to use.'),
                characterID: z.number().describe('The ID of the character using the item.'),
                difficulty: z.enum(DIFFICULTY_ENUMS).describe('How difficult it is to use the item in this situation.'),
                stat: z.enum(STATS_ENUMS).describe('The skill check stat to use.'),
            }),
            execute: async ({ item_name, characterID, difficulty, stat }) => {
                const result = this.mechanics.skillCheck(characterID, stat, difficulty)
                return `${(result.isCritical) ? 'CRITICAL ' : ''}${(result.success) ? 'SUCCESS' : 'FAILURE'}`
            }
        }

        this.tools.actions.useSkill = {
            description: `Implement a player's request to use a skill.`,
            parameters: z.object({
                skill_name: z.string().describe('The name of the skill to use.'),
                characterID: z.number().describe('The ID of the character using the skill.'),
                difficulty: z.enum(DIFFICULTY_ENUMS).describe('How difficult it is to use the skill in this situation.'),
                stat: z.enum(STATS_ENUMS).describe('The skill check stat to use.'),
            }),
            execute: async ({ skill_name, characterID, difficulty, stat }) => {
                const result = this.mechanics.skillCheck(characterID, stat, difficulty)
                return `${(result.isCritical) ? 'CRITICAL ' : ''}${(result.success) ? 'SUCCESS' : 'FAILURE'}`
            }
        }

        this.tools.actions.do = {
            description: 'Implement a player\'s generic action request with a skill check.',
            parameters: z.object({
                target: z.string().describe('The target of the action.'),
                difficulty: z.enum(DIFFICULTY_ENUMS),
                stat: z.enum(STATS_ENUMS).describe('The skill check stat to use.'),
                characterID: z.number().describe('The ID of the character to use for the skill check.')
            }),
            execute: async ({ target, difficulty, stat, characterID }) => {
                const result = this.mechanics.skillCheck(characterID, stat, difficulty)
                return `${(result.isCritical) ? 'CRITICAL ' : ''}${(result.success) ? 'SUCCESS' : 'FAILURE'}`
            }
        }


        //EFFECTS
        this.tools.effects.modifyHealth = {
            description: 'Modify a character\'s health.',
            parameters: z.object({
                targets: z.array(z.number()).describe('The IDs of the characters to modify.'),
                amount: z.number().describe(dedent`
                    The amount to modify the health by
                    +-5 = minor,
                    +-10 = moderate,
                    +-20 = major,
                    +-50 = critical,
                    +-100 = instant,
                    `).min(-100).max(100),
                item_name: z.string().optional().describe('If this effect was caused by an item, specify the item name to include it in calculations.'),
                skill_name: z.string().optional().describe('If this effect was caused by a skill, specify the skill name to include it in calculations.'),
                resistance_stat: z.enum(STATS_ENUMS).optional().describe('Scale the effect based on a target stat.'),
            }),
            execute: async ({ targets, amount, item_name, skill_name, resistance_stat }) => {
                for (const target of targets) {
                    await this.mechanics.modifyStatScaled({
                        targetCharID: target,
                        stat: 'health',
                        amount,
                        resistance_stat,
                        item_name: (item_name?.trim() === '') ? null : item_name,
                        skill_name: (skill_name?.trim() === '') ? null : skill_name
                    })

                }
                return { success: true }
            }
        },

            this.tools.effects.modifyEnergy = {
                description: 'Modify a character\'s energy.',
                parameters: z.object({
                    targets: z.array(z.number()).describe('The IDs of the characters to modify.'),
                    amount: z.number().describe(dedent`
                    The amount to modify the energy by
                    +-5 = minor,
                    +-10 = moderate,
                    +-20 = major,
                    +-50 = critical,
                    +-100 = instant,
                    `).min(-100).max(100),
                    item_name: z.string().optional().describe('If this effect was caused by an item, specify the item name to include it in calculations.'),
                    skill_name: z.string().optional().describe('If this effect was caused by a skill, specify the skill name to include it in calculations.'),
                    resistance_stat: z.enum(STATS_ENUMS).optional().describe('Scale the effect based on a target stat.'),
                }),
                execute: async ({ targets, amount, item_name, skill_name, resistance_stat }) => {
                    console.log(`IN TOOLS.EFFECTS.MODIFY ENERGY`)
                    for (const target of targets) {
                        console.log(`Attempting to modify energy for character ${target}`)
                        await this.mechanics.modifyStatScaled({
                            targetCharID: target,
                            stat: 'energy',
                            amount,
                            resistance_stat: (resistance_stat?.trim() === '') ? null : resistance_stat,
                            item_name: (item_name?.trim() === '') ? null : item_name,
                            skill_name: (skill_name?.trim() === '') ? null : skill_name
                        })
                    }

                    return { success: true }
                }

            }

        this.tools.effects.permanentlyModifyStats = {
            description: 'Modify a character\'s stat permanently.',
            parameters: z.object({
                targets: z.array(z.number()).describe('The IDs of the characters to modify.'),
                stats: z.array(z.enum(STATS_ENUMS)).describe('The stats to modify.'),
                amount: z.number().describe(dedent`
                    The amount to modify the stats by
                    +-1 = minor,
                    +-3 = moderate,
                    +-5 = major,
                    +-10 = critical
                    `).min(-20).max(20),
                item_name: z.string().optional().describe('If this effect was caused by an item, specify the item name to include it in calculations.'),
                skill_name: z.string().optional().describe('If this effect was caused by a skill, specify the skill name to include it in calculations.')
            }),
            execute: async ({ targets, stats, amount, item_name, skill_name }) => {
                console.log(`IN TOOLS.EFFECTS.PERMANENTLY MODIFY STATS`)
                for (const target of targets) {
                    for (const stat of stats) {
                        await this.mechanics.modifyStatScaled({
                            targetCharID: target,
                            stat,
                            amount,
                            item_name: (item_name?.trim() === '') ? null : item_name,
                            skill_name: (skill_name?.trim() === '') ? null : skill_name
                        })
                    }
                }

                return { success: true }
            }
        }

        this.tools.effects.giveItem = {
            description: 'Give characters (non-currency) items.',
            parameters: z.object({
                item_name: z.string().describe('The name of the item to give.'),
                targets: z.array(z.object({
                    character_id: z.number().describe('The ID of the character to give the item to.'),
                    amount: z.number().describe('The amount of the item to give.').min(0)
                })),
            }),
            execute: async ({ targets, item_name }) => {
                console.log(`IN TOOLS.EFFECTS.GIVE ITEM`)
                try {
                    const item = await this.helpers.fetchOrCreateItem(item_name)
                    if (!item) throw new Error(`[INTERNAL GAME ENGINE ERROR]: Item with name ${item_name} not found in the item map.`)

                    for (const { character_id, amount } of targets) {
                        const character = this.players.get(character_id)
                        if (!character) return;

                        const localInventory = this.characterInventories.get(character_id)
                        if (!localInventory) return;

                        localInventory.set(item.id, Math.max(0, (localInventory.get(item.id) || 0) + amount))
                        this.broadcast('GOT_ITEM',{
                            characterID: character_id,
                            itemID: item.id,
                            itenName: item.name,
                            amount: localInventory.get(item.id),
                            image: item.image
                        })
                        console.log(`Attempting to add ROW,`, {
                            character_id: character_id,
                            item_id: item.id,
                            quantity: localInventory.get(item.id)
                        })
                        await this.db.insert(inventory).values({
                            character_id: character_id,
                            item_id: item.id,
                            quantity: localInventory.get(item.id)
                        })
                            .onConflictDoUpdate({
                                target: [inventory.character_id, inventory.item_id],
                                set: {
                                    quantity: localInventory.get(item.id)
                                }
                            })
                    }

                    return { success: true }
                } catch (e) {
                   // console.log(e)

                }

                return { success: true }
            }
        }

        this.tools.effects.consumeItem = {
            description: 'Consume/remove characters (non-currency) items.',
            parameters: z.object({
                item_name: z.string().describe('The name of the item to consume/remove.'),
                targets: z.array(z.object({
                    character_id: z.number().describe('The ID of the character to consume/remove the item from.'),
                    amount: z.number().describe('The amount of the item to consume/remove.').min(0)
                })),
            }),
            execute: async ({ targets, item_name }) => {
                console.log(`IN TOOLS.EFFECTS.CONSUME ITEM`)
                try {
                    const item = this.items.get(nameToID(item_name))
                    if (!item) throw new Error(`[INTERNAL GAME ENGINE ERROR]: Item with name ${item_name} not found in the item map.`)


                    for (const { character_id, amount } of targets) {
                        const character = this.players.get(character_id)
                        if (!character) return;

                        const localInventory = this.characterInventories.get(character_id)
                        if (!localInventory) return;

                        await this.db.insert(inventory).values({
                            character_id: character_id,
                            item_id: item.id,
                            quantity: localInventory.get(item.id)
                        })
                            .onConflictDoUpdate({
                                target: [inventory.character_id, inventory.item_id],
                                set: {
                                    quantity: localInventory.get(item.id)
                                }
                            })

                        localInventory.set(item.id, Math.max(0, (localInventory.get(item.id) || 0) - amount))
                    }

                    return { success: true }
                } catch (e) {
                    //console.log(e)

                }

                return { success: true }
            }
        }
    }

    mechanics = {
        skillCheck: (charID: number, stat: string, difficulty: Difficuty) => {
            const character = this.players.get(charID) || this.npcs.get(charID)
            if (!character) throw new Error(`[INTERNAL GAME ENGINE ERROR]: Character with ID ${charID} not found in the character map.`)
            if (typeof character[stat] !== 'number') throw new Error(`[INTERNAL GAME ENGINE ERROR]: Character with ID ${charID} does not have a stat called ${stat}.`)

            const baseValue = character[stat]
            const diceRoll = randInt(1, 20)

            const difficultyValue = this.config.difficulty[difficulty]
            const rollValue = baseValue + diceRoll

            return {
                success: rollValue >= difficultyValue,
                isCritical: rollValue <= 1 || rollValue >= 20,
                roll: rollValue
            }
        },
        modifyStatScaled: async ({
            targetCharID,
            stat,
            amount,
            resistance_stat,
            item_name,
            skill_name
        }: {
            targetCharID: number,
            stat: string,
            amount: number,
            resistance_stat?: string,
            item_name?: string,
            skill_name?: string
        }) => {
            const characterInfo = this.players.get(targetCharID) || this.npcs.get(targetCharID)
            if (!characterInfo) return;


            const statValue = characterInfo[stat]
            if (typeof statValue !== 'number') return;

            const resistanceValue = (resistance_stat) ? characterInfo[resistance_stat] : 0

            const baseResistanceRoll = (randInt(1, resistanceValue / 2) / 10) * 0.15

            //Amplify good stat changes but reduce bad stat changes
            const adjustedMultipler = (Math.sign(amount) > 0) ? 1 + baseResistanceRoll : 1 - baseResistanceRoll

            const item = (item_name) ? this.items.get(nameToID(item_name)) : null
            const skill = (skill_name) ? this.skills.get(nameToID(skill_name)) : null

            const itemMultiplier = (item) ? item.multiplier : 1
            const skillMultiplier = (skill) ? skill.multiplier : 1


            const totalMultiplier = itemMultiplier * skillMultiplier * adjustedMultipler

            const newValue = (amount * totalMultiplier)
            characterInfo[stat] = statValue + Math.round(newValue)

            //Save the new value
            await this.db.update(character)
                .set({ [stat]: characterInfo[stat] })
                .where((eq(character.id, targetCharID)))
        }


    }
}