import { defineDotzeeStore, ref } from 'dotzee';

export const useFeatureStore = defineDotzeeStore('featureStore', () => {
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