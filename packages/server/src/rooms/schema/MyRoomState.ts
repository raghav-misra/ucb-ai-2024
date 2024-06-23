import { Schema, type, ArraySchema, MapSchema } from "@colyseus/schema";

export class Character extends Schema {
    @type("string") name: string;
    @type("number") userId: number;

    // stats
    @type("number") currency: number;
    @type("number") health: number;
    @type("number") strength: number;
    @type("number") constitution: number;
    @type("number") intelligence: number;
    @type("number") wisdom: number;
    @type("number") dexterity: number;
    @type("number") charisma: number;
    @type("number") energy: number;

    @type("number") sceneId: number; // reference to the scene they're in.

    @type("string") city: string;
    @type("string") region: string;

    @type("string") headshot: string;
}

export class Message extends Schema {
    @type("number") userId: string;
    @type("string") message: string;
}

export class Scene extends Schema {
    @type("number") sceneId: number;
    @type("string") sceneType: string; 
    @type("string") regionImage: string;
    @type("string") cityImage: string;
    @type("string") locationImage: string;
    @type("string") cityString: string;
    @type("string") regionString: string;
    @type("string") locationString:string
    @type([Message]) messages = new ArraySchema<Message>();
}
    
export class MyRoomState extends Schema {
    @type({ map: "number" }) sessionUserIdMap = new MapSchema<string>();
    @type("number") currentUserId: number; // the id of whoever's turn it is
    @type([Character]) characters = new ArraySchema<Character>(); // info on all characters
    @type([Scene]) scenes = new ArraySchema<Scene>();
}