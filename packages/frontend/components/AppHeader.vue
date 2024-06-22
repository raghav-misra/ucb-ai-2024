<script setup lang="ts">
const route = useRoute();
</script>

<template>
    <header v-if="!route.fullPath.includes('/play')" class="bg-dark p-3 d-flex">
        <h1 class="h3 mb-0 text-white">TwizzApp</h1>
        <div class="ms-auto">
            <input type="text" class="form-control" placeholder="Search games...">
        </div>
    </header>
</template>