const http = require("http");
const cors = require("cors");
const app = require("express")();
app.use(cors())
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.listen(9091, () => console.log("Listening on port 9091"));
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening... on 9090"));
const websocketServer = require("websocket").server
// hashmap clients
const clients = {};
const games = {};

 const wsServer = new websocketServer({
    "httpServer": httpServer
})
wsServer.on("request", request => {
    // connect
    const connection = request.accept(null, request.origin);
    connection.on("open", () => console.log("opened!"));
    connection.on("close", () => console.log("closed!"));
    connection.on("message", message => {
        const result = JSON.parse(message.utf8Data);
        // I have received a message from client
        //a user want to create a new game
        if(result.method === 'create') {
            const clientId = result.clientId;
            const gameId = guid();

            games[gameId] = {
                "id": gameId,
                "balls": 20,
                "clients": []
            }

            const payLoad = {
                "method": "create",
                "game": games[gameId]
            };

            const conn = clients[clientId].connection;
            conn.send(JSON.stringify(payLoad));
        }

        //a client want to join
        if(result.method === 'join') {
            const clientId = result.clientId;
            const gameId = result.gameId;
            const game = games[gameId];
            if(game.clients.length >= 3){
                //sorry max players reach
                return;
            }
            const color = {"0": "Red", "1": "Green", "2": "Blue"}[game.clients.length];
            game.clients.push({
                "clientId": clientId,
                "color": color
            });

            const payLoad = {
                "method": "join",
                "game": game
            }

            //loop through all clients and tell them that people has join
            game.clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify(payLoad))
            })
        }

    });

    // generate a new clientId
    const clientId = guid();
    clients[clientId] = {
        "connection": connection
    };

    const payLoad = {
        "method": "connect",
        "clientId": clientId
    };
    // send back the client connect
        connection.send(JSON.stringify(payLoad))
});

function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring();
}

const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substring());
