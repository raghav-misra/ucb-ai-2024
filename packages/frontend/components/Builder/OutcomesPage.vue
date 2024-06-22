<script setup lang="ts">
const emit = defineEmits<{
    (e: "next"): void;
}>();

const builderState = useBuilderState();

const display = () => console.log(builderState.value);

const addEvent = () => {
    builderState.value.events.push({
        attribute: "health",
        comparator: "eq",
        amount: 0,
        outcome: "",
    });
};

const deleteEvent = (i: number) => {
    builderState.value.events.splice(i, 1);
};
</script>


<template>
    <BuilderBasePage title="Game events" description="Describe events that trigger on certain statistics (ex. death when health ≤
 0).">
        <template v-slot:content>
            <button class="btn btn-primary mb-3" @click="addEvent">Add an event</button>
            <BuilderOutcomeCard v-for="(event, i) of builderState.events" :key="i" :event="event" @delete="deleteEvent(i)" />
            <p class="lead" v-if="builderState.events.length === 0">No events, add one above.</p>
        </template>
        <template v-slot:buttons>
            <button class="btn btn-success" @click="display">Publish game!</button>
        </template>
    </BuilderBasePage>
</template>