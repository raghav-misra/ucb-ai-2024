<script setup lang="ts">
const user = useUser();
const player = computed(() => getCharacterFromId(user.value.userId));
</script>

<template>
    <div class="bg-black stats-card py-2 px-3 rounded shadow-lg" style="top: 2rem; right: 2rem;">
        <p v-for="attr of getAttributes().filter(s => !['health', 'strength', 'currency'].includes(s))" class="mb-0 lead" style="display: grid; grid-template-columns: 2fr 1fr;">
            <span style="font-weight: bold !important; text-transform: capitalize;">{{ attr }}</span>
            <span class="text-end">{{ player?.[attr as keyof typeof player] }}</span>
        </p>
    </div>

    <div class="stats-card d-flex" style="top: 2rem; left: 2rem;">
        <div class="bg-black py-2 px-3 rounded shadow-lg">
            <p class="mb-0 lead">
                <span class="text-end">{{ player?.health }}</span>
                <span style="font-weight: bold !important;"> Health ❤️</span>
            </p>
        </div>
        <div class="bg-black py-2 px-3 rounded shadow-lg ms-3">
            <p class="mb-0 lead">
                <span class="text-end">{{ player?.strength }}</span>
                <span style="font-weight: bold !important;"> Strength ⚡</span>
            </p>
        </div>
        <div class="bg-black py-2 px-3 rounded shadow-lg ms-3">
            <p class="mb-0 lead">
                <span class="text-end">{{ player?.currency }}</span>
                <span style="font-weight: bold !important;"> Currency 💸</span>
            </p>
        </div>
    </div>
</template>

<style scoped>
.stats-card {
    position: absolute;
    opacity: 0.8;
}
</style>