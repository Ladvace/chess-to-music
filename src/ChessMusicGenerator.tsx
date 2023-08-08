import { Show, createEffect, createSignal, onCleanup } from "solid-js";
import * as Tone from "tone";
import pgnParser from "pgn-parser";
import { allNotes } from "./constants";

const mappedNotes: Record<string, string> = allNotes.reduce(
  (acc: Record<string, string>, note: string) => {
    acc[note] = new URL(`./assets/${note}.mp3`, import.meta.url).href;
    return acc;
  },
  {}
);

const piano = new Tone.Sampler({
  urls: mappedNotes,
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
