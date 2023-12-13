import { useState, useMemo, useCallback, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import Dialog from "./Dialog";
import socket from "../socket";
import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
  Box,
} from "@mui/material";

function Game({ players, username, room, orientation, cleanup }) {

  const chess = useMemo(() => new Chess(), []); 
  const [fen, setFen] = useState(chess.fen());
  const [over, setOver] = useState("");

  const makeMove = useCallback(
    (move) => {
      try {
        const result = chess.move(move);
        setFen(chess.fen());

        console.log("over","checkmate", chess.isGameOver(), chess.isCheckmate());

        if (chess.isGameOver()) {
          if (chess.isCheckmate()) {
            setOver(
              `it's a checkmate!!! and ${chess.turn() === "w" ? "black" : "white "} wins🏆`
            );
          } else if (chess.isDraw()) {
            setOver(
              `It's a Draw guys ...gg`
            );
          } else {
            setOver (
              `Game over!`
            );
          }
        }
        return result;
      } catch (e) {
        return null;
      }
    },
    [chess]
  );

  function onDrop(sourceSquare, targetSquare) {
    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      promotion: "q",
    };

    const move = makeMove(moveData);
    if(move === null) return false;

    socket.emit("move", {
      move,
      room,
    });

    return true;
  } 

  useEffect(() => {
    socket.on("move", (move) => {
      makeMove(move);
    });
  }, [makeMove]);

  useEffect(() => {
    socket.on('playerDisconnected', (player) => {
      setOver(`${player.username} has disconnected`);
    });
  }, []);

  return (
    <div className="game">
      <Stack>
        <Card>
          <CardContent>
              <Typography variant="h6">Room ID : {room} ♟️</Typography>
          </CardContent>
        </Card>
        <Stack flexDirection="row" sx={{pt: 2}}>
          <div className="board" style={{
            maxWidth: 600,
            maxHeight: 600,
            flexGrow: 1,
          }}>
            <Chessboard 
              position={fen}
              onPieceDrop={onDrop}
              boardOrientation={orientation}
            />
          </div>
          {players.length > 0 && (
            <Box>
              <List className="list">
                <ListSubheader>Players</ListSubheader>
                {players.map((p) => (
                  <ListItem key={p.id}>
                    <ListItemText primary={p.username} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Stack>
        <Dialog 
          open={Boolean(over)}
          title={over}
          contentText={over}
          handleContinue={() => {
            socket.emit("closeRoom", { roomId: room });
            cleanup();
          }}
        />
      </Stack>
    </div>
  );
}

export default Game;