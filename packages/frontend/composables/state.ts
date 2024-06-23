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
        regions: [],
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
    };

    return initial as IBuilderState;
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
    userId: string;

    currency: number;
    health: number;
    strength: number;
    energy: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    charisma: number;

    sceneId: string;

    city: string;
    region: string;
}

export interface IGameScene {
    sceneId: string;
    sceneType: "default" | "conversation" | "battle";
    messages: {
        userId: string;
        message: string;
    }[];
}

export interface IGameRoomState {   
    currentPlayerId: string;
    characters: IGameCharacter[];
    scenes: IGameScene[],
}

export const useUser = () => useState<{
    userId: string;
    gameConfigs: IBuilderState[];
}>("user", () => ({
    userId: "",
    gameConfigs: []
}));

export const useGameRoomState = () => useState<IGameRoomState>("gameState", () => ({
    currentPlayerId: "",
    characters: [],
    scenes: [],
}));