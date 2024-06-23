<script setup lang="ts">
const props = defineProps<{
    region: IRegion;
}>();

const emit = defineEmits<{
    (e: 'delete'): void;
}>();

const addCity = () => {
    props.region.cities.push({
        name: "New city",
        geographicTraits: "",
        developmentTraits: "",
        connectedCities: [],
        pois: [],
    });
};

const deleteCity = (i: number) => {
    props.region.cities.splice(i, 1);
};
</script>

<template>
    <details open class="px-4 bg-light rounded border py-2 mb-4">
        <summary class="my-1 d-flex">
            <h4 class="mb-0">{{ region.name || "unnamed region" }}</h4>
            <button class="btn btn-danger btn-light text-danger ms-auto" @click="emit('delete')">
                <span class="material-symbols-outlined">delete</span>
            </button>
        </summary>
        <hr>
        <div class="my-3">
            <h5>Region name</h5>
            <input v-model="region.name" type="text" class="form-control" twizz="twizz bizz, the return of yeat">
        </div>
        <div class="my-3" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
                <h5>Geographic traits</h5>
                <textarea class="form-control" v-model="region.geographicTraits"
                    twizz="Info about the region's climate, weather, terrain, etc."></textarea>
            </div>
            <div>
                <h5>Development traits</h5>
                <textarea class="form-control" v-model="region.developmentTraits"
                    twizz="Info about the region's economy, social norms, hierarchy, etc."></textarea>
            </div>
        </div>

        <div class="my-3">
            <h5>Contained cities</h5>
            <button class="btn btn-primary btn-sm mb-2" @click="addCity">Add city</button>
            <p v-if="region.cities.length === 0">No cities, add one above.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <BuilderCityCard v-for="(city, i) of region.cities" :key="i" :city="city" :region="region" @delete="deleteCity(i)" />
            </div>
        </div>
    </details>
</template>