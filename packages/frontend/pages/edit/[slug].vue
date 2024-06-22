<script setup lang="ts">
const view = {
    curr: ref('overview'),
    go(loc: string) {
        this.curr.value = loc;
    },
    is(loc: string) {
        return this.curr.value === loc;
    }
};

const currentView = ref('overview');
</script>

<template>
    <div class="page d-flex align-items-stretch">
        <div class="sidebar bg-light p-4 text-end d-flex flex-column">
            <div class="pe-3">
                <h2 class="lead">TwizzApp Builder</h2>
                <small><i>"Untitled game"</i></small>
                <hr>
            </div>
            <nav class="d-flex flex-column align-items-stretch flex-grow-1">
                <button class="text-end btn btn-light" @click="view.go('overview')">Game overview</button>
                <button class="text-end btn btn-light" @click="view.go('locations')">Map and locations</button>
                <button class="text-end btn btn-light" @click="view.go('attributes')">Player attributes</button>
                <button class="text-end btn btn-light" @click="view.go('npcs')">Non-playable characters</button>
                <button class="text-end btn btn-light" @click="view.go('outcomes')">Game outcomes</button>

                <button class="text-end btn btn-light mt-auto">Back to dashboard</button>
            </nav>
        </div>
        <div class="content flex-grow-1 p-4">
            <div v-if="view.is('overview')">overview</div>
            <div v-if="view.is('locations')">locations</div>
            <div v-if="view.is('attributes')">attributes</div>
            <div v-if="view.is('npcs')">npcs</div>
            <div v-if="view.is('outcomes')">outcomes</div>
        </div>
    </div>
</template>