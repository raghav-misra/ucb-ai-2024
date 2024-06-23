<script setup lang="ts">
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
            <div class="games-grid">
                <GameCard />
                <GameCard />
                <GameCard />
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