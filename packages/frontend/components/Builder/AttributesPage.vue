<script setup lang="ts">
const emit = defineEmits<{
    (e: "next"): void;
}>();
</script>


<template>
    <BuilderBasePage title="Character attributes" description="Both the player(s) and NPCs (non-playable characters) share the same attributes.">
        <template v-slot:content>
            <div class="my-3" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <h5>Physical traits</h5>
                    <textarea class="form-control" placeholder="twizz bizz tonka chonka."></textarea>
                </div>   
                <div>
                    <h5>Personality traits</h5>
                    <textarea class="form-control" placeholder="ex. fantasy, spooky, etc"></textarea>
                </div>                
            </div> 

            <div class="my-3" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div>
                    <h5>Initial currency</h5>
                    <input type="range" class="form-range" value="0" min="0" max="100">
                </div>   
                <div>
                    <h5>Initial health</h5>
                    <input type="range" class="form-range" value="100" min="0" max="100">
                </div> 
                <div>
                    <h5>Initial strength</h5>
                    <input type="range" class="form-range" value="0" min="0" max="100">
                </div> 
                <div>
                    <h5>Initial dexterity</h5>
                    <input type="range" class="form-range" value="0" min="0" max="100">
                </div> 
                <div>
                    <h5>Initial constitution</h5>
                    <input type="range" class="form-range" value="0" min="0" max="100">
                </div> 
                <div>
                    <h5>Initial intelligence</h5>
                    <input type="range" class="form-range" value="0">
                </div>            
                <div>
                    <h5>Initial wisdom</h5>
                    <input type="range" class="form-range" value="0">
                </div> 
                <div>
                    <h5>Initial charisma</h5>
                    <input type="range" class="form-range" value="0">
                </div> 
            </div> 
        </template>
        <template v-slot:buttons>
            <button class="btn btn-primary" @click="emit('next')">Next Page (Outcomes)</button>
        </template>
    </BuilderBasePage>
</template>