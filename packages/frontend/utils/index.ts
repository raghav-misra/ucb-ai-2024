export const getAttributes = 
    () => ["health", "currency", "strength", "constitution", "dexterity", "intelligence", "wisdom", "charisma"];

export function getCharacterFromId(id: string) {
    const gameRoomState = useGameRoomState();
    return gameRoomState.value.characters.find(c => c.userId === id);
}