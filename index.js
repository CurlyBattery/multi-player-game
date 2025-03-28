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
                "balls": 20
            }

            const payLoad = {
                "method": "create",
                "game": games[gameId]
            };

            const conn = clients[clientId].connection;
            conn.send(JSON.stringify(payLoad));
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
