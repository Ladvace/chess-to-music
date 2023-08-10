import type { Component } from "solid-js";
import ChessMusicGenerator from "./ChessMusicGenerator";
import { inject } from "@vercel/analytics";

const App: Component = () => {
  inject();

  return (
    <div class="h-screen">
      <ChessMusicGenerator />
    </div>
  );
};

export default App;
