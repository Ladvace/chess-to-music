import { createSignal } from "solid-js";
import * as Tone from "tone";
import pgnParser from "pgn-parser";

const piano = new Tone.Sampler({
  urls: {
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
  },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

// Create a reverb effect
const reverb = new Tone.Reverb({
  decay: 1.5,
  wet: 0.4,
}).toDestination();

piano.connect(reverb);

// Add a delay effect
const delay = new Tone.FeedbackDelay("8n", 0.5).toDestination();
piano.connect(delay);

// Use a Tone.Sequence for more dynamic beat
const synth = new Tone.Synth().toDestination();
const notes = ["C2", "D2", "E2", "A2"];
const sequence = new Tone.Sequence(
  (time, note) => {
    synth.triggerAttackRelease(note, "8n", time);
  },
  notes,
  "4n"
).start(0);

// Vary the reverb effect over time
Tone.Transport.scheduleRepeat((time) => {
  reverb.wet.value = Math.random() * 0.5;
}, "4n");

// Start the transport
Tone.Transport.start();

let timeouts: number[] = [];
let recorder: Tone.Recorder | null = null;
let recordingUrl: string | null = null;

const piece2duration = (move: string): string => {
  if (move.startsWith("N")) {
    return "4n";
  } else if (move.startsWith("B")) {
    return "8n";
  } else if (move.startsWith("R")) {
    return "2n";
  } else if (move.startsWith("Q")) {
    return "1m";
  } else {
    return "16n";
  }
};

const piece2volume = (move: string): number => {
  if (move.startsWith("N")) {
    return 0.5;
  } else if (move.startsWith("B")) {
    return 0.6;
  } else if (move.startsWith("R")) {
    return 0.7;
  } else if (move.startsWith("Q")) {
    return 0.8;
  } else {
    return 0.4;
  }
};

const move2note = (move: string): string => {
  const square = move.length === 3 ? move.substring(1) : move.substring(0, 2);
  const rank = parseInt(square.substring(1));
  const notes = ["C", "D", "E", "F", "G", "A", "B"];
  const octave = Math.floor((rank - 1) / notes.length) + 4;
  const note = notes[(rank - 1) % notes.length];
  return note + octave;
};

const generateChessMusic = async (pgn: string): Promise<void> => {
  const parsed = pgnParser.parse(pgn);
  await Tone.start(); // Start audio context

  // Clear previous timeouts
  timeouts.forEach((timeout) => clearTimeout(timeout));
  timeouts = [];

  parsed[0].moves.forEach((move, index) => {
    const note = move2note(move.move);
    const duration = piece2duration(move.move);
    const volume = piece2volume(move.move);
    if (note) {
      timeouts.push(
        setTimeout(
          () => piano.triggerAttackRelease(note, duration, Tone.now(), volume),
          index * 500
        )
      );
    }
  });

  // Start recording
  recorder = new Tone.Recorder();
  piano.connect(recorder);
  recorder.start();
};

const ChessMusicGenerator = () => {
  const [pgn, setPgn] = createSignal("");
  const [isPlaying, setIsPlaying] = createSignal(false);

  const onStart = async () => {
    setIsPlaying(true);
    await generateChessMusic(pgn());
  };

  const onStop = async () => {
    setIsPlaying(false);
    // Clear all timeouts and stop the music
    timeouts.forEach((timeout) => clearTimeout(timeout));
    piano.releaseAll();
    sequence.stop();

    // Stop the recording and generate a Blob
    if (recorder) {
      const recording = await recorder.stop();
      recordingUrl = URL.createObjectURL(recording);
      recorder.dispose();
      recorder = null;
    }
  };

  const onDownload = () => {
    if (recordingUrl) {
      const link = document.createElement("a");
      link.href = recordingUrl;
      link.download = "chess-music.mp3";
      link.click();
    }
  };

  const onResume = async () => {
    if (!isPlaying()) {
      setIsPlaying(true);
      await generateChessMusic(pgn());
    }
  };

  const onRestart = async () => {
    onStop();
    onStart();
  };

  return (
    <div class="h-full w-full bg-gray-800 text-white p-6 flex flex-col items-center justify-center">
      <h1 class="text-4xl font-bold mb-6">Chess Music Generator</h1>
      <textarea
        value={pgn()}
        onInput={(e) => setPgn(e.currentTarget.value)}
        class="bg-gray-700 p-3 w-full h-64 text-white mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
        placeholder="Enter your PGN here..."
      />
      <div class="flex gap-2">
        <button
          onClick={onStart}
          disabled={isPlaying()}
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Music
        </button>
        <button
          onClick={onStop}
          class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Stop Music
        </button>
        <button
          onClick={onResume}
          disabled={isPlaying()}
          class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Resume Music
        </button>
        <button
          onClick={onRestart}
          class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
        >
          Restart Music
        </button>
        <button
          onClick={onDownload}
          class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Download Music
        </button>
      </div>
    </div>
  );
};

export default ChessMusicGenerator;
