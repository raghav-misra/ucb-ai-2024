<script setup lang="ts">
const props = defineProps<{
    title: string;
    description: string;
}>();
</script>

<template>
    <div class="container">
        <h2 class="text-center">{{ props.title }}</h2>
        <div class="text-center">
            <small><i>"{{ props.description }}"</i></small>
        </div>
        <hr>
        <slot name="content" />
        <hr>
        <slot name="buttons" />
    </div>
</template>