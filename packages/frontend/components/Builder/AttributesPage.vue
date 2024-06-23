<script setup lang="ts">
const emit = defineEmits<{
    (e: "next"): void;
}>();

const builderState = useBuilderState();
</script>


<template>
    <BuilderBasePage title="Character attributes"
        description="Both the player(s) and NPCs (non-playable characters) share the same attributes.">
        <template v-slot:content>
            <div class="my-3" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <h5>Physical traits</h5>
                    <textarea v-model="builderState.character.physicalTraits" class="form-control"
                        placeholder="twizz bizz tonka chonka."></textarea>
                </div>
                <div>
                    <h5>Personality traits</h5>
                    <textarea v-model="builderState.character.personalityTraits" class="form-control"
                        placeholder="ex. fantasy, spooky, etc"></textarea>
                </div>
            </div>

            <div class="my-3" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div>
                    <h5>Initial currency ({{ builderState.character.initialCurrency }})</h5>
                    <input type="number" class="form-control" v-model="builderState.character.initialCurrency" :min="0">
                </div>
                <div>
                    <h5>Initial health ({{ builderState.character.initialHealth }})</h5>
                    <input type="range" class="form-range" v-model="builderState.character.initialHealth" :min="0"
                        :max="100">
                </div>
                <div>
                    <h5>Initial energy ({{ builderState.character.initialEnergy }})</h5>
                    <input type="range" class="form-range" v-model="builderState.character.initialEnergy" :min="0"
                    :max="20">
                </div>
                <div>
                    <h5>Initial strength ({{ builderState.character.initialStrength }})</h5>
                    <input type="range" class="form-range" v-model="builderState.character.initialStrength" :min="0"
                        :max="20">
                </div>
                <div>
                    <h5>Initial dexterity ({{ builderState.character.initialDexterity }})</h5>
                    <input type="range" class="form-range" v-model="builderState.character.initialDexterity" :min="0"
                        :max="20">
                </div>
                <div>
                    <h5>Initial constitution ({{ builderState.character.initialConstitution }})</h5>
                    <input type="range" class="form-range" v-model="builderState.character.initialConstitution" :min="0"
                        :max="20">
                </div>
                <div>
                    <h5>Initial intelligence ({{ builderState.character.initialIntelligence }})</h5>
                    <input type="range" class="form-range" v-model="builderState.character.initialIntelligence" :min="0"
                        :max="20">
                </div>
                <div>
                    <h5>Initial wisdom ({{ builderState.character.initialWisdom }})</h5>
                    <input type="range" class="form-range" v-model="builderState.character.initialWisdom" :min="0"
                        :max="20">
                </div>
                <div>
                    <h5>Initial charisma ({{ builderState.character.initialCharisma }})</h5>
                    <input type="range" class="form-range" v-model="builderState.character.initialCharisma" :min="0"
                    :max="20">
                </div>
            </div>
        </template>
        <template v-slot:buttons>
            <button class="btn btn-primary" @click="emit('next')">Next Page (Events)</button>
        </template>
    </BuilderBasePage>
</template>