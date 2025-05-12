import { defineZestStore } from 'zest-state-library'; // Assuming linked package name

export const useCounterOptionsStore = defineZestStore('counterOptions', {
    state: () => ({
        count: 0,
        name: 'Options Counter',
    }),
    actions: {
        increment() {
            this.count++;
        },
        decrement() {
            this.count--;
        },
    },
}); 