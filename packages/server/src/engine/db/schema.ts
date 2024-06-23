import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from 'drizzle-zod';

export const region = sqliteTable("region", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  geographic_traits: text("geographic_traits").notNull(),
  development_traits: text("development_traits").notNull(),
  random: text("random").notNull(),
  seed: integer("seed").notNull(),
  landscape: text("landscape"),
});

export type Region = typeof region.$inferSelect;
export const RegionInsertZod = createInsertSchema(region, {
  geographic_traits: (s) => s['geographic_traits'].describe('Region climate, terrain, etc.'),
  development_traits: (s) => s['development_traits'].describe('Region lore / backstory, economics, culture, etc.'),
  random: (s) => s['random'].describe('Fun fact about the region')
})
  .omit({
    id: true,
    seed: true,
    landscape: true,
  })

export const cityEdge = sqliteTable("city_edge", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  city_id_1: integer("city_id_1").notNull()
    .references(() => city.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  city_id_2: integer("city_id_2").notNull()
    .references(() => city.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  distance: integer("distance").notNull().references(() => city.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  })
});

export type CityEdge = typeof cityEdge.$inferSelect;
export const CityEdgeInsertZod = createInsertSchema(cityEdge);

export const city = sqliteTable("city", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  geographic_traits: text("geographic_traits").notNull(),
  development_traits: text("development_traits").notNull(),
  random: text("random").notNull(),
  seed: integer("seed").notNull(),
  landscape: text("landscape"),
  region_id: integer("region_id").notNull()
    .references(() => region.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
});

export type City = typeof city.$inferSelect;
export const CityInsertZod = createInsertSchema(city, {
  geographic_traits: (s) => s['geographic_traits'].describe('City climate, terrain, etc.'),
  development_traits: (s) => s['development_traits'].describe('City lore / backstory, economics, culture, etc.'),
  random: (s) => s['random'].describe('Fun fact about the city')
})
  .omit({
    id: true,
    seed: true,
    landscape: true,
    region_id: true,
  })

export const location = sqliteTable("location", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  physical_traits: text("physical_traits").notNull(),
  development_traits: text("development_traits").notNull(),
  seed: integer("seed").notNull(),
  landscape: text("landscape"),
  city_id: integer("city_id")
    .references(() => city.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  city_edge_id: integer("city_edge_id")
    .references(() => cityEdge.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
});

export type Location = typeof location.$inferSelect;
export const LocationInsertZod = createInsertSchema(location, {
  'physical_traits': (s) => s['physical_traits'].describe('How the location looks, interior/exterior, etc.'),
  'development_traits': (s) => s['development_traits'].describe('Location lore / backstory, economics, culture, etc.'),
})
  .omit({
    id: true,
    seed: true,
    landscape: true,
    city_id: true,
    city_edge_id: true,
  })

export const character = sqliteTable("character", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  //"PLAYER" or "NPC"
  role: text("role").notNull(),
  name: text("name").notNull(),
  physical_traits: text("physical_traits").notNull(),
  personality_traits: text("personality_traits").notNull(),
  random: text("random").notNull(),
  //ASSETS
  seed: integer("seed").notNull(),
  headshot: text("headshot"),
  fullbody: text("fullbody"),
  //LOCATION
  location_id: integer("location_id")
    .notNull()
    .references(() => location.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  //SCENE
  scene_id: integer("scene_id")
    .references(() => scene.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  //STATS
  health: integer("health").notNull().default(100),
  energy: integer("energy").notNull().default(100),
  currency: integer("currency").notNull().default(0),
  strength: integer("strength").notNull().default(10),
  dexterity: integer("dexterity").notNull().default(10),
  constitution: integer("constitution").notNull().default(10),
  intelligence: integer("intelligence").notNull().default(10),
  wisdom: integer("wisdom").notNull().default(10),
  charisma: integer("charisma").notNull().default(10),
});

export type Character = typeof character.$inferSelect;
export const CharacterInsertZod = createInsertSchema(character, {
  'physical_traits': (s) => s['physical_traits'].describe('Describe species, race, gender, height, weight, clothes, looks, etc.'),
  'personality_traits': (s) => s['personality_traits'].describe('Describe alignment, quirks, personality type, etc.'),
  'random': (s) => s['random'].describe('Fun facts about the character'),
  'currency': (s) => s['currency'].describe('The starting amount of currency the character has'),
  'strength': (s) => s['strength'].describe('The character\'s strength stat').min(0).max(20).default(10),
  'dexterity': (s) => s['dexterity'].describe('The character\'s dexterity stat').min(0).max(20).default(10),
  'constitution': (s) => s['constitution'].describe('The character\'s constitution stat').min(0).max(20).default(10),
  'intelligence': (s) => s['intelligence'].describe('The character\'s intelligence stat').min(0).max(20).default(10),
  'wisdom': (s) => s['wisdom'].describe('The character\'s wisdom stat').min(0).max(20).default(10),
  'charisma': (s) => s['charisma'].describe('The character\'s charisma stat').min(0).max(20).default(10),
}).omit({
  id: true,
  seed: true,
  headshot: true,
  fullbody: true,
  location_id: true,
  role: true
})

export const organization = sqliteTable("organization", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  random: text("random").notNull(),
  development_traits: text("development_traits").notNull(),
  //ASSETS
  seed: integer("seed").notNull(),
  logo: text("logo"),
  //STATS
  status: text("status").notNull()
});

export type Organization = typeof organization.$inferSelect;
export const OrganizationInsertZod = createInsertSchema(organization, {
  'description': (s) => s['description'].describe('What the organization does'),
  'development_traits': (s) => s['development_traits'].describe('Lore on how the organization came to be'),
  'random': (s) => s['random'].describe('Fun facts about the organization'),
  'status': (s) => s['status'].describe('Include level of respect, power, etc.'),
})
  .omit({
    id: true,
    seed: true,
    logo: true,
  })

export const organization_character = sqliteTable("organization_character", {
  role: text("role").notNull(),
  status: text("status").notNull().default("good standing"),
  organization_id: integer("organization_id").notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  character_id: integer("character_id").notNull()
    .references(() => character.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
})

export type OrganizationCharacter = typeof organization_character.$inferSelect;
export const OrganizationCharacterInsertZod = createInsertSchema(organization_character, {
  role: (s) => s['role'].describe('Character position in the organization'),
  status: (s) => s['status'].describe('How other members of the organization view the character'),
})


export const character_relationship = sqliteTable("character_relationship", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  character_id_1: integer("character_id_1").notNull()
    .references(() => character.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  character_id_2: integer("character_id_2").notNull()
    .references(() => character.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  type: text("type").notNull().default("stranger"),
  journal: text("journal").notNull().default(""),
});

export type CharacterRelationship = typeof character_relationship.$inferSelect;
export const CharacterRelationshipInsertZod = createInsertSchema(character_relationship, {
  'type': (s) => s['type'].describe('The relationship type i.e friend, enemy, family, etc.'),
  'journal': (s) => s['journal'].describe('A running journal of the relationship'),
});


export const item = sqliteTable("item", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull().unique(),
  physical_traits: text("physical_traits").notNull(),
  development_traits: text("development_traits").notNull(),
  effect: text("effect").notNull(),
  type: text("type").notNull(),
  value: integer("value").notNull().default(0),
  rarity: text("rarity").notNull().default("common"),
  weight: integer("weight").notNull().default(0),
  seed: integer("seed").notNull(),
  image: text("image"),
  multiplier: real("multiplier").notNull().default(1),
});

export type Item = typeof item.$inferSelect;
export const ItemInsertZod = createInsertSchema(item, {
  'physical_traits': (s) => s['physical_traits'].describe('How the item looks, feels, and acts'),
  'development_traits': (s) => s['development_traits'].describe('Item lore / backstory'),
  effect: (s) => s['effect'].describe('What happens when the item is used. Do not use exact values, instead use relative terms like "a bit" or "a lot"'),
  type: (s) => s['type'].describe('Examples: weapon, armor, consumable, tool, etc.'),
  value: (s) => s['value'].describe('How much the item costs in USD'),
  rarity: (s) => s['rarity'].describe('How rare the item is'),
  weight: (s) => s['weight'].describe('How heavy the item is in pounds'),
  multiplier: (s) => s['multiplier'].describe('How the item affects game mechanics. 1=Normal 0.5=Basic 0.1=Bad Item 1.5=Better Item 2=Good Item and so on'),
})
  .omit({
    id: true,
    image: true,
    seed: true,
  })

export const inventory = sqliteTable("inventory", {
  character_id: integer("character_id").notNull()
    .references(() => character.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  item_id: integer("item_id").notNull().references(() => item.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  quantity: integer("quantity").notNull().default(0),
}, (inventory) => ({
  pk: primaryKey({
    columns: [inventory.character_id, inventory.item_id]
  })
}));

export type Inventory = typeof inventory.$inferSelect;
export const InventoryInsertZod = createInsertSchema(inventory);


export const skill = sqliteTable("skill", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }).unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  energy_cost: integer("energy_cost").notNull().default(0),
  multiplier: real("multiplier").notNull().default(1),
  //ASSETS
  seed: integer("seed").notNull(),
  icon: text("icon"),
});

export type Skill = typeof skill.$inferSelect;
export const SkillInsertZod = createInsertSchema(skill, {
  name: (s) => s['name'].describe('What the skill is called'),
  description: (s) => s['description'].describe('What the skill does'),
  energy_cost: (s) => s['energy_cost'].describe('How much energy the skill costs').min(0).max(100),
  multiplier: (s) => s['multiplier'].describe('How the skill affects game mechanics. 1=Normal 0.5=Basic 0.1=Bad Skill 1.5=Better Skill 2=Good Skill and so on'),
}).omit({
  id: true,
  seed: true,
  icon: true
})

export const skill_character = sqliteTable("skill_character", {
  skill_id: integer("skill_id").notNull()
    .references(() => skill.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  character_id: integer("character_id").notNull()
    .references(() => character.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export type SkillCharacter = typeof skill_character.$inferSelect;
export const SkillCharacterInsertZod = createInsertSchema(skill_character);

export const quest = sqliteTable("quest", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location_id: integer("location_id")
    .references(() => location.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  character_id: integer("character_id")
    .references(() => character.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  status: text("status").notNull().default("active"),
});
export type Quest = typeof quest.$inferSelect;
export const QuestInsertZod = createInsertSchema(quest);


export const scene = sqliteTable("scene", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  //"DEFAULT", "CONVERSATION", "BATTLE"
  summary: text("summary"),
  type: text("type").notNull(),
  active: integer("active", { mode: 'boolean' }).notNull().default(true),
  location_id: integer("location_id").notNull()
    .references(() => location.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});
export type Scene = typeof scene.$inferSelect;

export const message = sqliteTable("message", {
  //Null char id means it's a world message
  character_id: integer("character_id")
    .references(() => character.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  scene_id: integer("scene_id").notNull()
    .references(() => scene.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  message: text("message").notNull(),
  timestamp_in_game: integer("timestamp_in_game").notNull(),
  timestamp: integer("timestamp").notNull(),
});

export type Message = typeof message.$inferSelect;
export const MessageInsertZod = createInsertSchema(message);


export const sceneRelations = relations(scene, ({ many }) => ({
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  scene: one(scene, {
    fields: [message.scene_id],
    references: [scene.id],
  }),
  character: one(character, {
    fields: [message.character_id],
    references: [character.id],
  }),
}));

export interface MessageWithCharacter extends Message {
  character: Character | null;
}