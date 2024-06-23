<script setup lang="ts">
const route = useRoute();
</script>

<template>
    <header v-if="!route.fullPath.includes('/play')" class="bg-dark p-3 d-flex">
        <h1 class="h3 mb-0 text-white">GameForge</h1>

        <NuxtLink to="/auth" class="ms-auto btn btn-primary">Signup / Login</NuxtLink>
    </header>
</template>