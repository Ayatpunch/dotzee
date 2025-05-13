import { defineZestStore, ref } from 'zest-state-library';

export const useFeatureStore = defineZestStore('featureStore', () => {
    const count = ref(0);
    const message = ref('Lazy Feature Not Loaded Yet');

    function increment() {
        count.value++;
    }

    function setMessage(newMessage: string) {
        message.value = newMessage;
    }

    return {
        count,
        message,
        increment,
        setMessage,
    };
}); 