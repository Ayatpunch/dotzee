import { defineZestStore } from 'zest-state-library';

// Define state type for better type inference
interface CounterState {
    count: number;
    name: string;
    loading: boolean;
}

export const useCounterOptionsStore = defineZestStore('counterOptions', {
    state: () => ({
        count: 5, // Start with 5 to match our initialZestState
        name: 'Options Counter',
        loading: false,
    }),
    getters: {
        doubled: (state: CounterState) => state.count * 2,
        countStatus: (state: CounterState) => {
            if (state.count === 0) return 'Zero';
            return state.count > 0 ? 'Positive' : 'Negative';
        }
    },
    actions: {
        increment() {
            this.count++;
        },
        decrement() {
            this.count--;
        },
        async incrementAsync(delay = 1000) {
            this.loading = true;
            await new Promise(resolve => setTimeout(resolve, delay));
            this.count++;
            this.loading = false;
        }
    }
}); 