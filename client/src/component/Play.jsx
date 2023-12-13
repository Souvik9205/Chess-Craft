import { Stack, TextField, Button } from "@mui/material";
import { useState } from "react";
import Dialog from "../component/Dialog";
import socket from "../socket";
  
export default function Play({ setRoom, setOrientation, setPlayers, username }) {
    const [ roomDialogOpen, setRoomDialogOpen ]= useState(false);
    const [ roomInput, setRoomInput ] = useState('');
    const [ roomError, setRoomError ] = useState('');

    return(
        <div className="play">
            <Stack

                sx={{ py:1, height: "100vh" }}
            >
            <Dialog 
                open={roomDialogOpen}
                handleClose={() => setRoomDialogOpen(false)}
                title="Select Room to Join"
                contentText="Enter a valid room ID to join the room"

                handleContinue={() => {
                    //join room
                        if (!roomInput) return;
                        socket.emit("joinRoom", { roomId: roomInput }, (r) => {
                        if (r.error) return setRoomError(r.message); 
                        console.log("response:", r);
                        setRoom(r?.roomId); 
                        setPlayers(r?.players);
                        setOrientation("black"); 
                        setRoomDialogOpen(false); 
                    });
                }}
            >
                <TextField 
                    autoFocus
                    margin="dense"
                    id="room"
                    label="Room ID"
                    name="room"
                    value={roomInput}
                    required
                    onChange={(e) => setRoomInput(e.target.value)}
                    type="text"
                    fullWidth
                    variant="standard"
                    error={Boolean(roomError)}
                    helperText={!roomError ? 'Enter a room ID' : `Invalid room ID: ${roomError}` }
                />
            </Dialog>
                <div className="home-box">
                    <div className="header">
                        <h1>♟️ ChessCraft ♟️</h1>
                    </div>

                    <div className="buttons">
                        <h3>Multiplayer:</h3>
                        {/*Button for starting game*/}
                        <Button
                            className="button-home"
                            variant="contained"
                            color="success"
                            onClick={() => {
                                socket.emit("createRoom", (r) => {
                                    console.log(r);
                                    setRoom(r);
                                    setOrientation("white");
                                });
                            }}
                        >
                            Host a game
                        </Button>
                        {/*Button for join room*/}
                        <Button
                            className="button-home"
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                setRoomDialogOpen(true);
                            }}
                        >
                            Join a Game
                        </Button>
                        <h3>Single Mode:</h3>
                        {/*Button for single player*/}
                        <Button
                        className="button-home"
                        variant="contained"
                        color="success"
                        onClick={() => {
                            return(
                                <p>working on</p>
                            );
                        }}
                        >
                            Start a game
                        </Button>
                    </div>
                </div>
            </Stack>
        </div>
    );
}