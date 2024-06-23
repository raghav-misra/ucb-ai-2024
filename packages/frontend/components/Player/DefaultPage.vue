<script setup lang="ts">
const { prompt, sendPrompt } = usePrompt();
</script>

<template>
    <div class="relaxed-box bg-black">
        <div class="city"></div>
        <div style="position: relative;">
            <textarea placeholder="Type here..." v-model.trim="prompt" style="resize: none;" class="lead input-box mb-0 bg-black p-4" @keydown.enter="sendPrompt"></textarea>
            <span class="enter-icon text-white d-flex align-items-center">↵</span>
        </div>
    </div>
</template>

<style scoped>
.relaxed-box {
    width: 25rem;
    box-shadow: -0.5rem -0.5rem 2rem black, 0.5rem 0.5rem 2rem black;
    display: flex;
    flex-direction: column;
}

.input-box {
    border: none;
    outline: none;
    color: white;
    width: 100%;
    padding-right: 3rem !important;
    height: 5rem;
    line-height: 1.25rem;
}

.enter-icon {
    position: absolute;
    bottom: 0;
    top: 0;
    right: 1rem;
    pointer-events: none;
    font-size: 2rem;
}

.city {
    width: 25rem;
    height: 25rem;
    background-image: url(~/assets/city.png);
    background-position: center center;
    background-size: cover;
}
</style>