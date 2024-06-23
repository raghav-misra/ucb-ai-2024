import * as Colyseus from "colyseus.js";

export interface IPoi {
    name: string;
    physicalTraits: string;
    developmentTraits: string;
}

export interface ICity {
    name: string;
    geographicTraits: string;
    developmentTraits: string;
    connectedCities: string[];
    pois: IPoi[];
}

export interface IRegion {
    name: string;
    geographicTraits: string;
    developmentTraits: string;
    cities: ICity[];
}

export interface ICharacter {
    physicalTraits: string;
    personalityTraits: string;
    initialCurrency: number;
    initialHealth: number;
    initialStrength: number;
    initialConstitution: number;
    initialIntelligence: number;
    initialEnergy: number;
    initialWisdom: number;
    initialDexterity: number;
    initialCharisma: number;
}

export interface IEvent {
    attribute: string;
    comparator: "eq" | "l" | "g" | "leq" | "geq";
    amount: number;
    outcome: string;
}

export interface IBuilderState {
    // page 1
    name: string;
    description: string;
    theme: string;

    // page 2
    regions: IRegion[];

    // page 3
    character: ICharacter;

    // page 4
    events: IEvent[];
}

function getInitialBuilderState() {
    const initial = {
        name: `New game ${new Date(Date.now()).toLocaleDateString("en-US")}`,
        description: "",
        theme: "",

        "regions": [
            {
                "name": "Mountainous Highlands",
                "geographicTraits": "A rugged region with towering mountains, deep valleys, and clear, cold rivers. The area is characterized by its steep cliffs and rocky terrain.",
                "developmentTraits": "Sparse population with small, isolated communities. The harsh environment limits large-scale development, but the region is rich in natural resources.",
                "cities": [
                    {
                        "name": "Highland Village",
                        "geographicTraits": "Located in a sheltered valley surrounded by high peaks. The village is built on terraces carved into the mountainside.",
                        "developmentTraits": "The community relies on traditional agriculture and livestock farming. The village is known for its strong sense of community and self-sufficiency.",
                        "connectedCities": ["Riverside Town"],
                        "pois": [
                            {
                                "name": "Old Fort",
                                "physicalTraits": "An ancient stone fort perched on a cliff, overlooking the valley below. The fort is partially in ruins but still stands as a testament to the region's history.",
                                "developmentTraits": "A historical site and tourist attraction, offering guided tours and historical reenactments."
                            },
                            {
                                "name": "Mountain Lake",
                                "physicalTraits": "A pristine, crystal-clear lake fed by mountain springs. The lake is surrounded by pine forests and wildflowers.",
                                "developmentTraits": "A popular spot for fishing, hiking, and picnicking. The lake is also a source of fresh water for the village."
                            }
                        ]
                    },
                    {
                        "name": "Riverside Town",
                        "geographicTraits": "Situated along a wide, fast-flowing river. The town is built on both sides of the river, connected by a historic stone bridge.",
                        "developmentTraits": "A bustling market town with a diverse economy based on trade, agriculture, and tourism. The town is a regional hub for commerce and transportation.",
                        "connectedCities": ["Highland Village"],
                        "pois": [
                            {
                                "name": "Stone Bridge",
                                "physicalTraits": "A centuries-old bridge made of stone, with arches spanning the river. The bridge is a key landmark and vital crossing point.",
                                "developmentTraits": "A symbol of the town's heritage, the bridge is well-maintained and often photographed by visitors."
                            },
                            {
                                "name": "Market Square",
                                "physicalTraits": "A large, open square in the center of town, surrounded by shops and cafes. The square hosts a weekly market that draws vendors and buyers from across the region.",
                                "developmentTraits": "The economic heart of the town, the market is known for its fresh produce, handmade goods, and vibrant atmosphere."
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Coastal Plains",
                "geographicTraits": "A flat, expansive region with fertile soil, dotted with farms and small towns. The coastline features sandy beaches and rocky outcrops.",
                "developmentTraits": "Heavily agricultural, with large-scale farming operations. The region also has a growing tourism industry due to its scenic coastlines and pleasant climate.",
                "cities": [
                    {
                        "name": "Seaside City",
                        "geographicTraits": "A bustling port city located at the mouth of a major river. The city has a mix of modern buildings and historic architecture.",
                        "developmentTraits": "A major commercial and cultural center, the city is known for its seafood, maritime industry, and vibrant arts scene.",
                        "connectedCities": ["Harbor Town"],
                        "pois": [
                            {
                                "name": "Harbor",
                                "physicalTraits": "A large, busy harbor filled with ships and boats. The harbor is equipped with modern facilities for loading and unloading cargo.",
                                "developmentTraits": "The economic lifeline of the city, the harbor handles a significant portion of the region's trade and commerce."
                            },
                            {
                                "name": "Old Lighthouse",
                                "physicalTraits": "A historic lighthouse situated on a rocky promontory overlooking the sea. The lighthouse is still operational and offers panoramic views.",
                                "developmentTraits": "A popular tourist attraction, the lighthouse is also a vital navigational aid for ships entering the harbor."
                            }
                        ]
                    },
                    {
                        "name": "Harbor Town",
                        "geographicTraits": "A smaller town located along the coast, known for its picturesque beaches and charming seaside atmosphere.",
                        "developmentTraits": "The town has a mix of fishing and tourism-based economy, with numerous beachfront hotels and restaurants.",
                        "connectedCities": ["Seaside City"],
                        "pois": [
                            {
                                "name": "Fisherman's Wharf",
                                "physicalTraits": "A bustling wharf with fishing boats, seafood markets, and docks. The wharf is the heart of the town's fishing industry.",
                                "developmentTraits": "A lively area where visitors can buy fresh seafood, watch fishermen at work, and enjoy waterfront dining."
                            },
                            {
                                "name": "Sandy Beach",
                                "physicalTraits": "A long stretch of sandy beach with gentle waves and clear blue water. The beach is lined with palm trees and beach huts.",
                                "developmentTraits": "A major attraction for tourists, offering activities like swimming, sunbathing, and beach volleyball."
                            }
                        ]
                    }
                ]
            }
        ],

        character: {
            physicalTraits: "",
            personalityTraits: "",
            initialCurrency: 8,
            initialHealth: 20,
            initialStrength: 8,
            initialEnergy: 8,
            initialConstitution: 8,
            initialDexterity: 8,
            initialIntelligence: 8,
            initialWisdom: 8,
            initialCharisma: 8
        },
        events: []
    } as IBuilderState;

    return initial;
}

export const useBuilderState = () => useState<IBuilderState>("builderState", () => getInitialBuilderState());

export const useWSClient = () => useState<{
    client: Colyseus.Client | null,
    room: Colyseus.Room | null
}>("wsClient", () => ({
    client: null,
    room: null,
}));

export interface IGameCharacter {
    name: string;
    userId: number;

    currency: number;
    health: number;
    strength: number;
    energy: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    charisma: number;

    sceneId: number;

    city: string;
    region: string;
}

export interface IGameScene {
    sceneId: number;
    sceneType: "default" | "conversation" | "battle";
    messages: {
        userId: number;
        message: string;
    }[];
}

export interface IGameRoomState {
    currentPlayerId: string;
    characters: IGameCharacter[];
    scenes: IGameScene[],
}

export const useUser = () => useState<{
    userId: number;
    gameConfigs: IBuilderState[];
}>("user", () => ({
    userId: -1,
    gameConfigs: []
}));

export const useGameInitialState = () => useState<{
    name: string;
    config: IBuilderState;
    dbName: string;
} | null>("gameInitialState", () => null);

export const useGameRoomState = () => useState<IGameRoomState>("gameState", () => ({
    currentPlayerId: "",
    characters: [],
    scenes: [],
}));

export const useImageState = () => useState<{
    region: string;
    city: string;
}>("imageState", () => ({
    region: "https://i.pinimg.com/originals/c7/4e/30/c74e3049300cc10c3c0dc0abc9d6e404.gif",
    city: ""
}));

export const useLocationState = () => useState<{
    region: string;
    city: string;
    poi: string;
}>("locationState", () => ({
    region: "Region",
    city: "City",
    poi: "POI"
}));

type TMessage = {
    characterName: string;
    message: string;
};

export const useMessageState = () => useState<TMessage[]>("messageState", () => []);

export const useSceneLogs = () => useState<{
    conversation: TMessage[];
    battle: TMessage[];
}>("sceneLogs", () => ({
    conversation: [],
    battle: [],
}));