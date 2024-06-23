<script setup lang="ts">
const props = defineProps<{
    region: IRegion;
    city: ICity;
}>();

const emit = defineEmits<{
    (e: 'delete'): void;
}>();

const builderState = useBuilderState();

const allCities = computed(() => {
    const cities: ({ city: string; full: string; obj: ICity; })[] = [];
    for (let region of builderState.value.regions) {
        cities.push(...region.cities.map(c => ({
            city: c.name,
            full: `${c.name}, ${region.name}`,
            obj: c
        })));
    }

    return cities.filter(c => c.full !== `${props.city.name}, ${props.region.name}`);
});

const addPoi = () => {
    props.city.pois.push({
        name: "New point of interest",
        developmentTraits: "",
        physicalTraits: "",
    });
}

const deletePoi = (i: number) => {
    props.city.pois.splice(i, 1);
}

const changeCallbackConnected = () => {
    for (let connected of props.city.connectedCities) {
        const connectedCityObj = allCities.value.find(c => c.city === connected)?.obj;

        if (connectedCityObj) {
            connectedCityObj.connectedCities.push(props.city.name);
            connectedCityObj.connectedCities = [...new Set(connectedCityObj.connectedCities)];
        }
    }
};
</script>


<template>
    <div class="p-4 py-2 bg-white rounded border">
        <div class="my-3">
            <div class="d-flex align-items-end">
                <h6>City name</h6>
                <button class="btn btn-danger btn-light text-danger ms-auto" @click="emit('delete')">
                    <span class="material-symbols-outlined">delete</span> 
                </button>
            </div>
            <input v-model="city.name" type="text" class="form-control form-control-sm flex-grow-1">
        </div>

        <div class="my-3" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
                <h6>Geographic traits</h6>
                <textarea v-model="city.geographicTraits" class="form-control form-control-sm"
                    twizz="Info about the city's climate, weather, terrain, etc."></textarea>
            </div>
            <div>
                <h6>Development traits</h6>
                <textarea v-model="city.developmentTraits" class="form-control form-control-sm"
                    twizz="Info about the city's economy, social norms, hierarchy, etc."></textarea>
            </div>
        </div>

        <div class="my-3">
            <h6 class="mb-0">Connected cities</h6>
            <small>What other cities can be reached from this one?</small>
            <select v-model="city.connectedCities" @input="changeCallbackConnected" multiple class="form-control form-control-sm flex-grow-1">
                <option v-for="(t, i) of allCities" :name="t.city" :key="i">{{ t.full }}</option>
            </select>
        </div>

        <div class="my-3">
            <h6>Points of interest</h6>

            <button class="btn btn-primary btn-sm mb-2" @click="addPoi">Add point of interest</button>
            <small class="d-block" v-if="city.pois.length === 0">No POIs, add one above!</small>

            <BuilderPoiCard v-for="(poi, i) of city.pois" :key="i" :poi="poi" @delete="deletePoi(i)" />
        </div>
    </div>
</template>