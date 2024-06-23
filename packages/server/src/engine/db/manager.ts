import { BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { city, region, character, location } from "./schema";
import * as schema from "./schema.ts";
import { IBuilderState } from "../../routes/init.ts";
import { randInt } from "../utils.ts";

export type Schema = typeof schema;

export const loadDB = async (path: string, config: IBuilderState, player: {
    name: string
}) => {
    const pathToDB = path;
    console.log(pathToDB);
    const fileExists = await (Bun.file(pathToDB)).exists();
    const sqlite = new Database(pathToDB);
    const db = drizzle(sqlite, { schema });

    //Init the database if new
    if (!fileExists) {
        await initDatabase(db, config, player);
    }

    return db;
}

const initDatabase = async <T extends Record<string, unknown>>(db: BunSQLiteDatabase<T>, config: IBuilderState, player: {
    name: string
}) => {
    await migrate(db, { migrationsFolder: "./drizzle" });

    await db.insert(character).values({
        name: player.name,
        random: "",
        seed: 69,
        health: config.character.initialHealth,
        intelligence: config.character.initialIntelligence,
        charisma: config.character.initialCharisma,
        constitution: config.character.initialConstitution,
        role: "PLAYER",
        physical_traits: config.character.physicalTraits,
        personality_traits: config.character.personalityTraits,
        strength: config.character.initialStrength,
        energy: config.character.initialEnergy,
        currency: config.character.initialCurrency,
        dexterity: config.character.initialDexterity,
        wisdom: config.character.initialWisdom,
        location_id: 1,
        scene_id: null,
    });

    // stuff db with locations
    const cityNameIdMap: Record<string, number> = {}

    for (let regionClientSide of config.regions) {
        const regionDb = (await db.insert(region).values({
            name: regionClientSide.name,
            geographic_traits: regionClientSide.geographicTraits,
            development_traits: regionClientSide.developmentTraits,
            random: "",
            seed: 0
        }).returning())[0];

        for (let cityClientSide of regionClientSide.cities) {
            const cityDb = (await db.insert(city).values({
                name: cityClientSide.name,
                geographic_traits: cityClientSide.geographicTraits,
                development_traits: cityClientSide.developmentTraits,
                random: "",
                region_id: regionDb.id,
                seed: 1
            }).returning())[0];

            cityNameIdMap[cityClientSide.name] = cityDb.id;

            for (let city2 of cityClientSide.connectedCities) {
                if (city2 in cityNameIdMap) {
                    await db.insert(schema.cityEdge).values({
                        city_id_1: cityNameIdMap[city2],
                        city_id_2: cityDb.id,
                        distance: randInt(1, 10)
                    });
                }
            }

            for (const poiClientSide of cityClientSide.pois) {
                const poiDb = (await db.insert(location).values({
                    name: poiClientSide.name,
                    physical_traits: poiClientSide.physicalTraits,
                    development_traits: poiClientSide.developmentTraits,
                    city_id: cityDb.id,
                    seed: 2
                }));
            }
        }
    }
}