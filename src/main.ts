import './styles/main.css';
import { App } from './App';

const mount = document.querySelector<HTMLDivElement>('#app');

if (!mount) {
  throw new Error('Application mount node was not found.');
}

const app = new App(mount);
app.render();
