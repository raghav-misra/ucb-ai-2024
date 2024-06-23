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
                "name": "Enchanted Forest",
                "geographicTraits": "A mystical forest with towering ancient trees, magical flora, and sparkling streams. The forest is shrouded in a perpetual twilight with glowing bioluminescent plants.",
                "developmentTraits": "Protected by ancient magic, very few humans have ventured into its depths. A small community of elves and mystical creatures inhabit this forest.",
                "cities": [
                    {
                        "name": "Eldertree Village",
                        "geographicTraits": "Nestled among the oldest and tallest trees, with homes built into the trunks and canopy. The village is surrounded by lush greenery and vibrant flowers.",
                        "developmentTraits": "The village thrives on a symbiotic relationship with the forest. The inhabitants practice ancient magic and are skilled in herbal medicine.",
                        "connectedCities": ["Moonshadow Hamlet"],
                        "pois": [
                            {
                                "name": "Ancient Grove",
                                "physicalTraits": "A sacred grove with towering, centuries-old trees arranged in a perfect circle. The air is thick with magical energy.",
                                "developmentTraits": "Used for rituals and gatherings, it is a place of deep reverence and power for the inhabitants."
                            },
                            {
                                "name": "Crystal Springs",
                                "physicalTraits": "A series of clear, sparkling springs that emit a soft, ethereal glow. The water is said to have healing properties.",
                                "developmentTraits": "A place for healing and meditation, frequented by both the village inhabitants and travelers seeking solace."
                            }
                        ]
                    },
                    {
                        "name": "Moonshadow Hamlet",
                        "geographicTraits": "Located at the edge of the forest where the trees thin out, revealing a breathtaking view of the moonlit sky.",
                        "developmentTraits": "A community of stargazers and astronomers who study the celestial bodies. The hamlet is known for its observatory and star maps.",
                        "connectedCities": ["Eldertree Village"],
                        "pois": [
                            {
                                "name": "Silver Observatory",
                                "physicalTraits": "A grand observatory made of silver and glass, perched on a hill. It has a large telescope that reaches towards the stars.",
                                "developmentTraits": "A center of learning and discovery, attracting scholars from far and wide to study the night sky."
                            },
                            {
                                "name": "Lunar Temple",
                                "physicalTraits": "A beautiful temple made of white marble that glows under the moonlight. Surrounded by moonflowers that only bloom at night.",
                                "developmentTraits": "A place of worship and reflection dedicated to the moon goddess. Pilgrims come here to seek guidance and blessings."
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Desert of Echoes",
                "geographicTraits": "A vast desert with rolling sand dunes, rocky outcrops, and ancient ruins. The desert is known for its eerie silence, broken only by the whispers of the wind.",
                "developmentTraits": "Sparse human activity, with only a few nomadic tribes who have adapted to the harsh environment. The desert holds many secrets and hidden treasures.",
                "cities": [
                    {
                        "name": "Oasis City",
                        "geographicTraits": "Built around a large, lush oasis with palm trees and abundant water. The city is a bustling hub of trade and culture.",
                        "developmentTraits": "A melting pot of different cultures and peoples, the city thrives on commerce and trade. It is a beacon of life in the harsh desert.",
                        "connectedCities": [],
                        "pois": [
                            {
                                "name": "Sunset Bazaar",
                                "physicalTraits": "A vibrant marketplace filled with colorful tents and stalls. The air is filled with the scents of exotic spices and the sounds of haggling merchants.",
                                "developmentTraits": "A major trading hub where merchants from across the region come to sell their goods. It is the lifeblood of the city."
                            },
                            {
                                "name": "Whispering Dunes",
                                "physicalTraits": "A vast expanse of sand dunes that seem to move and shift with the wind. The dunes are said to hold the voices of ancient spirits.",
                                "developmentTraits": "Considered a sacred place by the nomads, who come here to seek wisdom and guidance from the spirits of the desert."
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