import { createElement } from './createElement';
import { render } from './render';

function App() {
  return createElement('div', { id: 'root' },
    createElement('h1', null, 'Hello, world!'),
    createElement('p', null, 'It\'s my first component')
  );
}

const app = createElement(App, {}); 
const rootElement = document.getElementById('app'); 
render(app, rootElement); 