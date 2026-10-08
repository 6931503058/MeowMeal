import { mountAiPortionScreen } from './ai-portion-screen.mjs';

const app = document.querySelector('#app');

if (!app) {
  throw new Error('Unable to start the AI Portion screen: #app was not found.');
}

mountAiPortionScreen(app);
