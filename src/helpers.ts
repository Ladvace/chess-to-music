export const piece2duration = (move: string): string => {
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
  
  export const piece2volume = (move: string): number => {
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
  
  export const move2note = (move: string): string => {
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