# Chess Music Generator

This application generates a unique music based on a chess game, using a provided PGN (Portable Game Notation). It's built using [SolidJS](https://www.solidjs.com/) and utilizes [pgn-parser](https://github.com/kevinludwig/pgn-parser) for parsing the chess games, along with [Tone.js](https://github.com/Tonejs/Tone.js) for music synthesis.

## How It Works

1. The user inputs a PGN string, which contains a record of a chess game.
2. The PGN input is parsed by `pgn-parser`, converting the chess moves into a format the application can use.
3. Each chess move corresponds to a musical note, which is determined by factors such as the type of piece moved, the destination square, and the type of move (e.g., capture, check). Special moves like castling or promotion trigger unique musical effects.
4. `Tone.js` takes the resulting sequence of notes and plays the generated music.

Each chess piece is mapped to a specific pitch or set of pitches:

- Pawn: C
- Knight: D
- Bishop: E
- Rook: F
- Queen: G
- King: A

In this iteration of the algorithm, white moves are played in the C4 octave, and black moves are played in the C3 octave.

# Steps ▶️

```
# Clone this repository
$ git clone https://github.com/Ladvace/chess-to-music
```

```
# Go into the repository
$ cd chess-to-music
```

```
# Install dependencies
$ pnpm install
```

```
# Start the project in development
$ pnpm dev
```

## Roadmap

- [ ] Makes music sharable
- [ ] Allow the user to adjust musical parameters.

## Contributing

Contributions are welcome. Please fork this repository and create a pull request if you have something valuable to add.

## License

This project is licensed under the MIT License.
