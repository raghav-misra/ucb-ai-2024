<script setup lang="ts">
import Swal from "sweetalert2";

const user = useUser();
const gameInitialState = useGameInitialState();

async function play(config: IBuilderState) {
    const { value: username } = await Swal.fire({
        title: "Enter a name to play as:",
        inputLabel: `The game ${config.name} is almost ready!`,
        input: "text",
        inputValidator: value => {
            if (!value.trim()) {
                return "A name is required!";
            }
        }
    });

    const name = username?.trim();

    if (name) {
        gameInitialState.value = {
            name,
            config
        };
    }
}

definePageMeta({
    middleware: ["auth"]
});
</script>

<template>
    <div class="page">
        <section class="container p-4 my-2">
            <h1 class="h1 text-center">My Games</h1>
            <div class="text-center mb-4">
                <NuxtLink to="/edit/new" class="btn btn-primary">Create a new game</NuxtLink>
            </div>
            <p class="lead text-center" v-if="user.gameConfigs.length === 0">No games, build one by clicking above!</p>
            <div class="games-grid">
                <GameCard v-for="config of user.gameConfigs" :builder-state="config" @play="play(config)" />
            </div>
        </section>
    </div>
</template>

<style scoped>
.games-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    row-gap: 1rem;
    column-gap: 1rem
}
</style>