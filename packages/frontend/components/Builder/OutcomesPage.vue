<script setup lang="ts">
import Swal from 'sweetalert2';

const emit = defineEmits<{
    (e: "next"): void;
}>();

const builderState = useBuilderState();
const user = useUser();

const display = async () => {
    const copy = JSON.parse(JSON.stringify(builderState.value)) as IBuilderState;
    const res = await fetch("http://localhost:2567/configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            userId: user.value.userId, 
            config: copy 
        })
    });
    const { success } = await res.json();
    if (success) {
        user.value.gameConfigs.push(copy);
        navigateTo("/dashboard");
        Swal.fire("Successfully uploaded game!", "It's ready to play!", "success");
    } else {
        Swal.fire("Unexpected error in upload.", "Sorry about the inconvenience", "error");
    }
};

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