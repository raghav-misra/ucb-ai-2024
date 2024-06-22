<template>
    <div class="page">
        <section class="container p-4 my-2">
            <h1 class="h1 text-center">My Games</h1>
            <div class="mt-3 games-grid">
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