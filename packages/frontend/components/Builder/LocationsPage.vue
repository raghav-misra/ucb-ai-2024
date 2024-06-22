<script setup lang="ts">
const emit = defineEmits<{
    (e: "next"): void;
}>();

const builderState = useBuilderState();

const addRegion = () => {
    builderState.value.regions.push({
        name: "",
        cities: [],
        developmentTraits: "",
        geographicTraits: ""
    });
}

const deleteRegion = (i: number) => {
    builderState.value.regions.splice(i, 1);
}
</script>


<template>
    <BuilderBasePage title="Map and locations" description="The map is composed of regions, each of which can have unique geographic and development traits. Each region contains cities, which also have their own geographic and development traits. Some points of interests (like shops, bars, etc.) within each cities are AI-generated, but you can specify key POIs, which have physical traits (how they look and feel) as well as development traits.">
        <template v-slot:content>
            <button class="btn btn-primary mb-3" @click="addRegion">Add a region</button>
            <BuilderRegionCard v-for="(region, i) of builderState.regions" :key="i" :region="region" @delete="deleteRegion(i)" />
            <p class="lead" v-if="builderState.regions  .length === 0">No regions, add one above.</p>
        </template>
        <template v-slot:buttons>
            <button class="btn btn-primary" @click="emit('next')">Next Page (Attributes)</button>
        </template>
    </BuilderBasePage>
</template>