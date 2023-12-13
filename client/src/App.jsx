import { Container, TextField } from "@mui/material";
import Game from "./component/game";
import { useCallback, useEffect, useState } from "react";
import Dialog from "./component/Dialog";
import socket from "./socket";
import Play from "./component/Play";

const App = () => {
    const [username, setUsername] = useState('');
    const [usernameSubmitted, setUsernameSubmitted] = useState(false);

    const [room, setRoom] = useState("");
    const [orientation, setOrientation] = useState("");
    const [players, setPlayers] = useState([]);

    const cleanup = useCallback(() => {
        setRoom("");
        setOrientation("");
        setPlayers("");
    }, []);

    useEffect(() => {
        socket.on("opponentJoined", (roomData) => {
            console.log("roomData", roomData)
            setPlayers(roomData.players);
        });
    }, []);

    return (
        <div className="app">
            <Container className="container-app">
                <Dialog
                    open={!usernameSubmitted}
                    handleClose={() => setUsernameSubmitted(true)}
                    title="Welcome!"
                    contentText="Please select a unique username"
                    handleContinue={() => {
                        if(!username) return;
                        socket.emit("username", username);
                        setUsernameSubmitted(true);
                    }}
                >
                <TextField 
                    autoFocus
                    margin="dense"
                    id="username"
                    label="username"
                    value={username}
                    required
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    fullWidth
                    variant="standard"
                    
                />
                </Dialog>
                {room ? (
                    <Game 
                        room={room}
                        orientation={orientation}
                        username={username}
                        players={players}
                        cleanup={cleanup}
                    />
                ) : (
                    <Play 
                        setRoom={setRoom}
                        setOrientation={setOrientation}
                        setPlayers={setPlayers}
                        username={username}
                    />
                )}
            </Container>
        </div>
    );
}

export default App;