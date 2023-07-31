import { Show, createEffect, createSignal, onCleanup } from "solid-js";
import * as Tone from "tone";
import pgnParser from "pgn-parser";

const piano = new Tone.Sampler({
  urls: {
    A0: "/assets/Notes/A0.mp3",
    A1: "/assets/Notes/A1.mp3",
    A3: "/assets/Notes/A3.mp3",
    A4: "/assets/Notes/A4.mp3",
    A5: "/assets/Notes/A5.mp3",
    A6: "/assets/Notes/A6.mp3",
    A7: "/assets/Notes/A7.mp3",
    Ab1: "/assets/Notes/Ab1.mp3",
    Ab2: "/assets/Notes/Ab2.mp3",
    Ab3: "/assets/Notes/Ab3.mp3",
    Ab4: "/assets/Notes/Ab4.mp3",
    Ab5: "/assets/Notes/Ab5.mp3",
    Ab6: "/assets/Notes/Ab6.mp3",
    Ab7: "/assets/Notes/Ab7.mp3",
    B0: "/assets/Notes/B0.mp3",
    B1: "/assets/Notes/B1.mp3",
    B2: "/assets/Notes/B2.mp3",
    B3: "/assets/Notes/B3.mp3",
    B4: "/assets/Notes/B4.mp3",
    B5: "/assets/Notes/B5.mp3",
    B6: "/assets/Notes/B6.mp3",
    B7: "/assets/Notes/B7.mp3",
    Bb0: "/assets/Notes/Bb0.mp3",
    Bb1: "/assets/Notes/Bb1.mp3",
    Bb2: "/assets/Notes/Bb2.mp3",
    Bb3: "/assets/Notes/Bb3.mp3",
    Bb4: "/assets/Notes/Bb4.mp3",
    Bb5: "/assets/Notes/Bb5.mp3",
    Bb6: "/assets/Notes/Bb6.mp3",
    Bb7: "/assets/Notes/Bb7.mp3",
    C1: "/assets/Notes/C1.mp3",
    C3: "/assets/Notes/C3.mp3",
    C5: "/assets/Notes/C5.mp3",
    C6: "/assets/Notes/C6.mp3",
    C7: "/assets/Notes/C7.mp3",
    C8: "/assets/Notes/C8.mp3",
    D1: "/assets/Notes/D1.mp3",
    D2: "/assets/Notes/D2.mp3",
    D3: "/assets/Notes/D3.mp3",
    D4: "/assets/Notes/D4.mp3",
    D5: "/assets/Notes/D5.mp3",
    D6: "/assets/Notes/D6.mp3",
    D7: "/assets/Notes/D7.mp3",
    Db1: "/assets/Notes/Db1.mp3",
    Db2: "/assets/Notes/Db2.mp3",
    Db3: "/assets/Notes/Db3.mp3",
    Db4: "/assets/Notes/Db4.mp3",
    Db5: "/assets/Notes/Db5.mp3",
    Db6: "/assets/Notes/Db6.mp3",
    Db7: "/assets/Notes/Db7.mp3",
    Db8: "/assets/Notes/Db8.mp3",
    E1: "/assets/Notes/E1.mp3",
    E2: "/assets/Notes/E2.mp3",
    E3: "/assets/Notes/E3.mp3",
    E4: "/assets/Notes/E4.mp3",
    E5: "/assets/Notes/E5.mp3",
    E6: "/assets/Notes/E6.mp3",
    E7: "/assets/Notes/E7.mp3",
    Eb1: "/assets/Notes/Eb1.mp3",
    Eb2: "/assets/Notes/Eb2.mp3",
    Eb3: "/assets/Notes/Eb3.mp3",
    Eb4: "/assets/Notes/Eb4.mp3",
    Eb5: "/assets/Notes/Eb5.mp3",
    Eb6: "/assets/Notes/Eb6.mp3",
    Eb7: "/assets/Notes/Eb7.mp3",
    F1: "/assets/Notes/F1.mp3",
    F2: "/assets/Notes/F2.mp3",
    F3: "/assets/Notes/F3.mp3",
    F4: "/assets/Notes/F4.mp3",
    F5: "/assets/Notes/F5.mp3",
    F6: "/assets/Notes/F6.mp3",
    F7: "/assets/Notes/F7.mp3",
    G1: "/assets/Notes/G1.mp3",
    G2: "/assets/Notes/G2.mp3",
    G3: "/assets/Notes/G3.mp3",
    G4: "/assets/Notes/G4.mp3",
    G5: "/assets/Notes/G5.mp3",
    G6: "/assets/Notes/G6.mp3",
    G7: "/assets/Notes/G7.mp3",
    Gb1: "/assets/Notes/Gb1.mp3",
    Gb2: "/assets/Notes/Gb2.mp3",
    Gb3: "/assets/Notes/Gb3.mp3",
    Gb4: "/assets/Notes/Gb4.mp3",
    Gb5: "/assets/Notes/Gb5.mp3",
    Gb6: "/assets/Notes/Gb6.mp3",
    Gb7: "/assets/Notes/Gb7.mp3",
  },
  release: 1,
}).toDestination();

const reverb = new Tone.Reverb({
  decay: 1.5,
  wet: 0.4,
}).toDestination();

piano.connect(reverb);

const delay = new Tone.FeedbackDelay("8n", 0.5).toDestination();
piano.connect(delay);

const synth = new Tone.Synth().toDestination();
const notes = ["C2", "D2", "E2", "A2"];
const sequence = new Tone.Sequence(
  (time, note) => {
    synth.triggerAttackRelease(note, "8n", time);
  },
  notes,
  "4n"
).start(0);

Tone.Transport.scheduleRepeat((time) => {
  reverb.wet.value = Math.random() * 0.5;
}, "4n");

Tone.Transport.start();

let timeouts: number[] = [];
let recorder: Tone.Recorder | null = null;
let recordingUrl: string | null = null;

const piece2duration = (move: string): string => {
  switch (move.charAt(0)) {
    case "N": // Knight
      return "4n";
    case "B": // Bishop
      return "8n";
    case "R": // Rook
      return "2n";
    case "Q": // Queen
      return "1m";
    case "K": // King
      return "2m";
    default: // Pawn
      return "16n";
  }
};

const piece2volume = (move: string): number => {
  switch (move.charAt(0)) {
    case "N": // Knight
      return 0.5;
    case "B": // Bishop
      return 0.6;
    case "R": // Rook
      return 0.7;
    case "Q": // Queen
      return 0.8;
    case "K": // King
      return 0.9;
    default: // Pawn
      return 0.4;
  }
};

const move2note = (move: string): string => {
  const specialMoves: { [key: string]: string } = {
    "O-O": "C4", // kingside castling
    "O-O-O": "D4", // queenside castling
    "+": "E4", // check
    "#": "F4", // checkmate
    "e.p.": "G4", // en passant
  };

  // Check if the move contains any of the special moves keys
  const specialMoveKey = Object.keys(specialMoves).find((key) =>
    move.includes(key)
  );
  if (specialMoveKey) {
    return specialMoves[specialMoveKey];
  }

  // Check if move is a promotion (like "e8=Q")
  if (move.includes("=")) {
    move = move.substring(0, move.indexOf("="));
  }

  // The last two characters of the move string represent the destination square
  const square = move.substring(move.length - 2);
  const rank = parseInt(square.substring(1));
  const notes = ["C", "D", "E", "F", "G", "A", "B"];
  const octave = Math.floor((rank - 1) / notes.length) + 4;
  const note = notes[(rank - 1) % notes.length];

  return note + octave;
};

const generateChessMusic = async (pgn: string): Promise<number> => {
  const parsed = pgnParser.parse(pgn);
  await Tone.start();

  timeouts.forEach((timeout) => clearTimeout(timeout));
  timeouts = [];

  const delayBetweenNotes = 500; // milliseconds
  parsed[0].moves.forEach((move, index) => {
    const note = move2note(move.move);
    const duration = piece2duration(move.move);
    const volume = piece2volume(move.move);
    if (note) {
      timeouts.push(
        setTimeout(
          () => piano.triggerAttackRelease(note, duration, Tone.now(), volume),
          index * delayBetweenNotes
        )
      );
    }
  });

  recorder = new Tone.Recorder();
  piano.connect(recorder);
  recorder.start();

  const lastMoveTime = parsed[0].moves.length * delayBetweenNotes;
  setTimeout(() => {
    sequence.stop();
    Tone.Transport.cancel();
  }, lastMoveTime);

  return lastMoveTime;
};

const ChessMusicGenerator = () => {
  const [pgn, setPgn] = createSignal("");
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [progress, setProgress] = createSignal(0);
  const [totalDuration, setTotalDuration] = createSignal(0);
  let progressInterval: ReturnType<typeof setTimeout>;

  const onStart = async () => {
    if (!pgn()) return;
    setIsPlaying(true);
    const duration = await generateChessMusic(pgn());
    setTotalDuration(duration);
    progressInterval = setInterval(() => {
      setProgress((oldProgress) => oldProgress + 500);
    }, 500);
  };

  const onStop = async () => {
    setIsPlaying(false);
    clearInterval(progressInterval);

    timeouts.forEach((timeout) => clearTimeout(timeout));
    timeouts = [];

    sequence.stop();
    Tone.Transport.cancel();

    if (recorder) {
      await recorder.stop();
      recorder.dispose();
      recorder = null;
    }
  };

  const onResume = async () => {
    setIsPlaying(true);
    await generateChessMusic(pgn());
    progressInterval = setInterval(() => {
      setProgress((oldProgress) => oldProgress + 500);
    }, 500);
  };

  const onRestart = async () => {
    onStop();
    setProgress(0);
    onStart();
  };

  const onDownload = async () => {
    if (recorder) {
      const recording = await recorder.stop();
      const blob = new Blob([recording], { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "chess-music.mp3";
      link.click();

      // If music is still playing, restart the recorder
      if (isPlaying()) {
        recorder.start();
      }
    }
  };

  onCleanup(() => {
    onStop();
  });

  const onReset = () => {
    onStop();
    setProgress(0);
    setTotalDuration(0);
  };

  createEffect(() => {
    if (pgn()) {
      onReset();
    }
  });

  return (
    <div class="h-full w-full bg-gray-800 text-white p-6 flex flex-col items-center justify-center">
      <h1 class="text-4xl font-bold mb-6">Chess Music Generator</h1>
      <textarea
        value={pgn()}
        onInput={(e) => setPgn(e.currentTarget.value)}
        class="bg-gray-700 p-3 w-full h-64 text-white mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 max-w-screen-lg"
        placeholder="Enter your PGN here..."
      />
      <Show when={totalDuration()}>
        <div class="w-full mb-4 bg-gray-500 rounded-full h-2 overflow-hidden max-w-screen-lg">
          <div
            class="h-full bg-green-500"
            style={`width: ${(progress() / totalDuration()) * 100}%`}
          />
        </div>
      </Show>
      <div class="flex flex-col sm:flex-row gap-2 justify-center w-full">
        <button
          onClick={onStart}
          disabled={isPlaying() || !pgn()}
          class="bg-green-500 px-4 py-2 rounded-md disabled:cursor-not-allowed disabled:bg-green-800 disabled:opacity-50"
        >
          Start
        </button>
        <button
          onClick={onStop}
          disabled={!isPlaying()}
          class="bg-red-500 px-4 py-2 rounded-md disabled:cursor-not-allowed disabled:bg-red-800 disabled:opacity-50"
        >
          Stop
        </button>
        <button
          onClick={onResume}
          disabled={isPlaying() || progress() === 0}
          class="bg-blue-500 px-4 py-2 rounded-md disabled:cursor-not-allowed disabled:bg-blue-800 disabled:opacity-50"
        >
          Resume
        </button>
        <button
          onClick={onRestart}
          disabled={!isPlaying() && progress() === 0}
          class="bg-yellow-500 px-4 py-2 rounded-md disabled:cursor-not-allowed disabled:bg-yellow-800 disabled:opacity-50"
        >
          Restart
        </button>
        <button
          onClick={onDownload}
          disabled={progress() === totalDuration()}
          class="bg-purple-500 px-4 py-2 rounded-md disabled:cursor-not-allowed disabled:bg-purple-800 disabled:opacity-50"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default ChessMusicGenerator;
