<script setup lang="ts">
const { dialogOptions, hideDialog } = useDialog();

const emit = defineEmits<{
    (e: "ok"): void;    
}>();
</script>

<template>
    <div class="dialog-box-container" v-if="dialogOptions.isOpen">
        <div class="dialog-box p-4 bg-black text-center">
            <h2>{{ dialogOptions.title }}</h2>
            <h4 class="fst-italic">{{ dialogOptions.text }}</h4>

            <button class="btn btn-black btn-lg" @click="hideDialog">[ okay ]</button>
        </div>
    </div>
</template>

<style scoped>
.dialog-box-container {
    position: absolute;
    bottom: 2rem;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
}

.dialog-box {
    width: 75%;
    border: 2px white solid;
    box-shadow: -0.5rem -0.5rem 2rem black, 0.5rem 0.5rem 2rem black;
}
</style>