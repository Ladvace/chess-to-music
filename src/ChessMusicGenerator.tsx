import { createSignal, Show } from 'solid-js';
import * as Tone from 'tone';
import pgnParser from 'pgn-parser';

const piano = new Tone.Sampler({
  urls: {
    C4: 'C4.mp3',
    'D#4': 'Ds4.mp3',
    'F#4': 'Fs4.mp3',
    A4: 'A4.mp3',
  },
  release: 1,
  baseUrl: 'https://tonejs.github.io/audio/salamander/',
}).toDestination();

let timeouts: number[] = [];

// Function to determine duration of note based on the piece moved
const piece2duration = (move: string): string => {
  if (move.startsWith('N')) {
    return '4n';
  } else if (move.startsWith('B')) {
    return '8n';
  } else if (move.startsWith('R')) {
    return '2n';
  } else if (move.startsWith('Q')) {
    return '1m';
  } else {
    return '16n';
  }
};

// Function to determine volume of note based on the piece moved
const piece2volume = (move: string): number => {
  if (move.startsWith('N')) {
    return 0.5;
  } else if (move.startsWith('B')) {
    return 0.6;
  } else if (move.startsWith('R')) {
    return 0.7;
  } else if (move.startsWith('Q')) {
    return 0.8;
  } else {
    return 0.4;
  }
};

const move2note = (move: string): string => {
  const square = move.length === 3 ? move.substring(1) : move;
  const rank = parseInt(square.substring(1));
  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
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
      // Ensure that note is not null before triggering sound
      timeouts.push(
        setTimeout(() => piano.triggerAttackRelease(note, duration, Tone.now(), volume), index * 500)
      );
    }
  });
};

const ChessMusicGenerator = () => {
  const [pgn, setPgn] = createSignal('');
  const [isPlaying, setIsPlaying] = createSignal(false);

  const onStart = async () => {
    setIsPlaying(true);
    await generateChessMusic(pgn());
  };

  const onStop = () => {
    setIsPlaying(false);
    // Clear all timeouts and stop the music
    timeouts.forEach((timeout) => clearTimeout(timeout));
    piano.releaseAll();
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
    <div>
      <h1>Chess Music Generator</h1>
      <textarea value={pgn()} onInput={(e) => setPgn(e.currentTarget.value)} />
      <button onClick={onStart} disabled={isPlaying()}>
        Start Music
      </button>
      <button onClick={onStop}>Stop Music</button>
      <button onClick={onResume} disabled={isPlaying()}>
        Resume Music
      </button>
      <button onClick={onRestart}>Restart Music</button>
    </div>
  );
};

export default ChessMusicGenerator;
