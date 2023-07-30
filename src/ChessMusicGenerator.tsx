import { createSignal, onCleanup } from "solid-js";
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
    setIsPlaying(true);
    const duration = await generateChessMusic(pgn());
    setTotalDuration(duration);
    progressInterval = setInterval(() => {
      setProgress((oldProgress) => oldProgress + 500);
    }, 500);
  };

  const onStop = async () => {
    setIsPlaying(false);
    timeouts.forEach((timeout) => clearTimeout(timeout));
    clearInterval(progressInterval);
    setProgress(0);
    sequence.stop();
    Tone.Transport.cancel();

    if (recorder) {
      const recording = await recorder.stop();
      recordingUrl = URL.createObjectURL(recording);
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
    onStart();
  };

  const onDownload = () => {
    if (recordingUrl) {
      const link = document.createElement("a");
      link.href = recordingUrl;
      link.download = "chess-music.mp3";
      link.click();
    }
  };

  onCleanup(() => {
    onStop();
  });

  return (
    <div class="h-full w-full bg-gray-800 text-white p-6 flex flex-col items-center justify-center">
      <h1 class="text-4xl font-bold mb-6">Chess Music Generator</h1>
      <textarea
        value={pgn()}
        onInput={(e) => setPgn(e.currentTarget.value)}
        class="bg-gray-700 p-3 w-full h-64 text-white mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
        placeholder="Enter your PGN here..."
      />
      <div class="w-full mb-4 bg-gray-500 rounded-full h-4 overflow-hidden">
        <div
          class="h-full bg-green-500"
          style={`width: ${(progress() / totalDuration()) * 100}%`}
        />
      </div>
      <div class="flex flex-col sm:flex-row gap-2">
        <button
          onClick={onStart}
          disabled={isPlaying()}
          class="bg-green-500 px-4 py-2 rounded-md"
        >
          Start
        </button>
        <button
          onClick={onStop}
          disabled={!isPlaying()}
          class="bg-red-500 px-4 py-2 rounded-md"
        >
          Stop
        </button>
        <button
          onClick={onResume}
          disabled={isPlaying()}
          class="bg-yellow-500 px-4 py-2 rounded-md"
        >
          Resume
        </button>
        <button onClick={onRestart} class="bg-purple-500 px-4 py-2 rounded-md">
          Restart
        </button>
        <button onClick={onDownload} class="bg-blue-500 px-4 py-2 rounded-md">
          Download
        </button>
      </div>
    </div>
  );
};

export default ChessMusicGenerator;
