import { RequestHandler } from "express";
import users from "../users";
import { loadDB } from "../engine/db/manager";
import { World } from "../engine/db/classes/World";

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

export const handler: RequestHandler = async (req, res) => {
    const { userId, config, name } = req.body;
    const path = `./data/${encodeURIComponent(config.name)}_${userId}.db`;

    const _config = config as IBuilderState;

    // const world = new World({
    //     dbName: path,
    //     builderState: _config,
    //     player: {
    //         name
    //     },
    //     stats: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as any,
    //     difficulty: {
    //         'Very Easy': 5,
    //         'Easy': 10,
    //         'Medium': 15,
    //         'Hard': 20,
    //         'Very Hard': 25,
    //         'Nearly Impossible': 30,
    //         'FORCE FAIL': 999999
    //     }
    // });

    users.enableBuilderState(path, _config);

    res.status(201).json({
        success: true,
        dbName: path
    });
};