import type { Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";
import ChessMusicGenerator from "./ChessMusicGenerator";

const App: Component = () => {
  return (
    <div class={styles.App}>
      <ChessMusicGenerator />
    </div>
  );
};

export default App;
