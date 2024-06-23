import { Schema, type, ArraySchema, MapSchema } from "@colyseus/schema";

export class Character extends Schema {
    @type("string") name: string;
    @type("string") userId: string;

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

    @type("string") sceneId: string; // reference to the scene they're in.

    @type("string") city: string;
    @type("string") region: string;
}

export class Message extends Schema {
    @type("string") userId: string;
    @type("string") message: string;
}

export class Scene extends Schema {
    @type("string") sceneId: string;
    @type("string") sceneType: string; 
    @type([Message]) messages = new ArraySchema<Message>();
}
    
export class MyRoomState extends Schema {
    @type({ map: "string" }) sessionUserIdMap = new MapSchema<string>();
    @type("string") currentUserId: string; // the id of whoever's turn it is
    @type([Character]) characters = new ArraySchema<Character>(); // info on all characters
    @type([Scene]) scenes = new ArraySchema<Scene>();
}