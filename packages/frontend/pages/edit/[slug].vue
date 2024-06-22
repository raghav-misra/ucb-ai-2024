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
</script>

<template>
    <div class="page align-items-stretch" style="display: grid; grid-template-columns: 1fr 5fr;">
        <div class="sidebar bg-light p-4 text-end d-flex flex-column">
            <div class="pe-3">
                <h2 class="lead">TwizzApp Builder</h2>
                <small><i>"Untitled game"</i></small>
                <hr>
            </div>
            <nav class="d-flex flex-column flex-grow-1 align-items-stretch">
                <button class="text-end btn btn-light" @click="view.go('overview')">Game overview</button>
                <button class="text-end btn btn-light" @click="view.go('locations')">Map and locations</button>
                <button class="text-end btn btn-light" @click="view.go('attributes')">Character attributes</button>
                <button class="text-end btn btn-light" @click="view.go('outcomes')">Game outcomes</button>

                <button class="text-end btn btn-light mt-auto">Back to dashboard</button>
            </nav>
        </div>
        <div class="content flex-grow-1 p-4">
            <BuilderOverviewPage  v-if="view.is('overview')" @next="view.go('locations')" />
            <BuilderLocationsPage v-if="view.is('locations')" @next="view.go('attributes')" />
            <BuilderAttributesPage v-if="view.is('attributes')" @next="view.go('outcomes')" />
            <BuilderOutcomesPage v-if="view.is('outcomes')" />
        </div>
    </div>
</template>