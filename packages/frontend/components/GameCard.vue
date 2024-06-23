<script setup lang="ts">
const props = defineProps<{
    builderState: IBuilderState;
}>();
</script>

<template>
    <div class="card">
        <div class="card-body">
            <h5 class="d-flex align-items-center">
                <span class="h5">{{  props.builderState.name  }}</span>
                <!-- <button class="btn btn-light ms-auto">
                    <span class="material-symbols-outlined">ios_share</span>
                </button>
                <button class="btn btn-danger btn-light text-danger ms-2">
                    <span class="material-symbols-outlined">delete</span> 
                </button> -->
            </h5>
            <p class="card-text">{{ props.builderState.description }}</p>
            <div class="d-flex">
                <button class="btn btn-primary me-2 flex-grow-1">Play</button>
                <button class="btn btn-dark flex-grow-1">Edit</button>
            </div>
        </div>
    </div>
</template>