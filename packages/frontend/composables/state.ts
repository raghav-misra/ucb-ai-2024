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
