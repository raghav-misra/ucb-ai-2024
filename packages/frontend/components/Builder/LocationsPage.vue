<script setup lang="ts">
const emit = defineEmits<{
    (e: "next"): void;
}>();
</script>


<template>
    <BuilderBasePage title="Map and locations" description="The map is composed of regions, each of which can have unique geographic and development traits. Each region contains cities, which also have their own geographic and development traits. Some points of interests (like shops, bars, etc.) within each cities are AI-generated, but you can specify key POIs, which have physical traits (how they look and feel) as well as development traits.">
        <template v-slot:content>
            <details class="px-4 bg-light rounded border py-2">
                <summary class="h4 my-1">Luh desert</summary>
                <hr>
                <div class="my-3">
                    <h5>Region name</h5>
                    <input type="text" class="form-control" placeholder="twizz bizz, the return of yeat">
                </div>
                <div class="my-3" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <h5>Geographic traits</h5>
                        <textarea class="form-control" placeholder="Info about the region's climate, weather, terrain, etc."></textarea>
                    </div>
                    <div>
                        <h5>Development traits</h5>
                        <textarea class="form-control" placeholder="Info about the region's economy, social norms, hierarchy, etc."></textarea>
                    </div>
                </div>
                
                <div class="my-3">
                    <h5>Contained cities</h5>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" class="my-2">
                        <div class="p-4 py-2 bg-white rounded border">
                            <div class="my-3">
                                <h6>City name</h6>
                                <input type="text" class="form-control form-control-sm flex-grow-1">
                            </div>

                            <div class="my-3" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div>
                                    <h6>Geographic traits</h6>
                                    <textarea class="form-control form-control-sm" placeholder="Info about the city's climate, weather, terrain, etc."></textarea>
                                </div>
                                <div>
                                    <h6>Development traits</h6>
                                    <textarea class="form-control form-control-sm" placeholder="Info about the city's economy, social norms, hierarchy, etc."></textarea>
                                </div>
                            </div>

                            <div class="my-3">
                                <h6 class="mb-0">Connected cities</h6>
                                <small>What other cities can be reached from this one?</small>
                                <select multiple class="form-control form-control-sm flex-grow-1">
                                    <option value="r">WOW</option>
                                    <option value="r">WOW2</option>
                                    <option value="r">WOW3</option>
                                </select>
                            </div>                            

                            <div class="my-3">
                                <h6>Points of interest</h6>

                                <div class="px-4 bg-light rounded border py-2">
                                    <div class="my-2">
                                        <small><b>POI name</b></small>
                                        <input type="text" class="form-control form-control-sm flex-grow-1">
                                    </div>

                                    <div class="my-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                        <div>
                                            <small><b>Physical traits</b></small>
                                            <textarea class="form-control form-control-sm" placeholder="Info about the city's climate, weather, terrain, etc."></textarea>
                                        </div>
                                        <div>
                                            <small><b>Development traits</b></small>
                                            <textarea class="form-control form-control-sm" placeholder="Info about the city's economy, social norms, hierarchy, etc."></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                        </div>
                    </div>
                </div>
            </details>
        </template>
        <template v-slot:buttons>
            <button class="btn btn-primary" @click="emit('next')">Next Page (Attributes)</button>
        </template>
    </BuilderBasePage>
</template>