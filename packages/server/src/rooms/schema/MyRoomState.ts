import { Schema, Context, type, ArraySchema } from "@colyseus/schema";

class Character extends Schema {
    // stats
    @type("number") currency: number;
    @type("number") health: number;
    @type("number") strength: number;
    @type("number") constitution: number;
    @type("number") intelligence: number;
    @type("number") wisdom: number;
    @type("number") dexterity: number;
    @type("number") charisma: number;

    @type("string") scene: "relaxed" | "conversation" | "battle";
}

// class Conversation extends Schema {
//     @type("string") receiverId: string; // the id who selfId (below) is talking to
//     @type(["string"]) messages = new ArraySchema<string>();
// }

// class Battle extends Schema {
//     @type("string") receiverId: string; // the id who selfId (below) is talking to
// }

export class MyRoomState extends Schema {
    @type("string") currentPlayerId: string; // the id of whoever's turn it is
    @type([Character]) characters = new ArraySchema<Character>(); // info on all characters
}