<script setup lang="ts">
const props = defineProps<{
    event: IEvent;
}>();

const emit = defineEmits<{
    (e: 'delete'): void;
}>();
</script>

<template>
    <div class="p-4 bg-light rounded border mb-4">
        <div class="d-flex align-items-center">
            <h5 class="mb-0">When <select v-model="event.attribute" class="d-inline-block form-select form-select-sm"
                    style="width: unset;">
                    <option v-for="(t, i) of getAttributes()" :name="t" :key="i">{{ t }}</option>
                </select> is <select v-model="event.comparator" class="d-inline-block form-control form-control-sm"
                    style="width: unset;">
                    <option value="eq">=</option>
                    <option value="g">></option>
                    <option value="geq">≥</option>
                    <option value="l"><</option>
                    <option value="leq">≤</option>
                </select> <input type="number" v-model="event.amount"
                    class="d-inline-block form-control form-control-sm" style="width: unset;">:
            </h5>
            <button class="btn btn-danger btn-light text-danger ms-auto" @click="emit('delete')">
                <span class="material-symbols-outlined">delete</span> 
            </button>
        </div>
        <small><i>(describe what happens below)</i></small>
        <textarea class="form-control mt-1" v-model="event.outcome" twizz="bro is cooked"></textarea>
    </div>
</template>