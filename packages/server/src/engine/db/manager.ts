import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { city, region, character, location } from "./schema";
import * as schema from "./schema.ts";

export type Schema = typeof schema;

export const loadDB = async (path: string) => {
    const pathToDB = `./data/${path}.sqlite`;
    const fileExists = await (Bun.file(pathToDB)).exists();
    const sqlite = new Database(pathToDB);
    const db = drizzle(sqlite, { schema });

    //Init the database if new
    if (!fileExists) {
        await initDatabase(db);
    }

    return db;
}

const initDatabase = async (db: any) => {
    await migrate(db, { migrationsFolder: "./drizzle" });

    //Insert default data
    await db.insert(region).values({
        name: "Battle Island",
        geographic_traits: "A large island with dense cities",
        development_traits: "A high-tech island with advanced infrastructure",
        random: "It was once a peaceful island, but now it's a battlefield.",
        seed: 0
    })

    await db.insert(city).values({
        name: "Titled Towers",
        geographic_traits: "A group of towers in the center of the island",
        development_traits: "The largest city on the island, with advanced infrastructure and a large population",
        random: "The city is a hub of activity, with a large population and advanced infrastructure.",
        region_id: 1,
        seed: 0
    })

    await db.insert(location).values({
        name: "The Great Hall",
        physical_traits: "A large, ornate hall with intricate carvings and a grand staircase",
        development_traits: "The main metro hub for the island",
        city_id: 1,
        seed: 0
    })

    await db.insert(location).values({
        name: "Open Shop",
        physical_traits: "A small shop with a variety of items",
        development_traits: "A shop that sells a variety of items",
        city_id: 1,
        seed: 0
    })


    await db.insert(character).values({
        role: "PLAYER",
        name: "Baze Barvis",
        physical_traits: "An average human male with a beard and a scar on his forehead",
        personality_traits: "A friendly and outgoing person, but also a bit of a loner",
        random: "Formerlly a soldier, now a civilian, Baze is a kind and friendly person who enjoys spending time with his friends.",
        runtime_context: "",
        seed: 0,
        location_id: 1,
    })
}