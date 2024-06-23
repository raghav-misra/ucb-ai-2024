<script setup lang="ts">
const props = defineProps<{
    poi: IPoi
}>();

const emit = defineEmits<{
    (e: 'delete'): void;
}>();
</script>

<template>
    <div class="px-4 bg-light rounded border py-2 mt-2">
        <div class="my-2">
            <small class="d-flex align-items-center">
                <b>POI name</b>
                <button class="btn btn-small btn-light text-danger ms-auto" @click="emit('delete')">
                    <span class="material-symbols-outlined">delete</span> 
                </button>
            </small>
            <input v-model="poi.name" type="text" class="form-control form-control-sm flex-grow-1">
        </div>

        <div class="my-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
                <small><b>Physical traits</b></small>
                <textarea v-model="poi.physicalTraits" class="form-control form-control-sm"
                    twizz="Info about the city's climate, weather, terrain, etc."></textarea>
            </div>
            <div>
                <small><b>Development traits</b></small>
                <textarea v-model="poi.developmentTraits" class="form-control form-control-sm"
                    twizz="Info about the city's economy, social norms, hierarchy, etc."></textarea>
            </div>
        </div>
    </div>
</template>