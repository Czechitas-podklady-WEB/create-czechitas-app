import React from 'react';
import { render } from 'react-dom';
import './style.css';

render(
  <div class="container">
    <header>
      <div class="logo"></div>
      <h1>React webová aplikace</h1>
    </header>
    <main>
      <p>Startovací šablona pro webovou aplikaci v Reactu.</p>
    </main>
    <footer>
      <p>Czechitas, Digitální akademie: Web</p>
    </footer>
  </div>,
  document.querySelector('#app'),
);
