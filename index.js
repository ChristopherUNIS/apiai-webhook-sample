'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const expressWs = require('express-ws')(server);

let sessionIds = new Map();
let globalWs;

server.use(bodyParser.json());

server.post('/hook', function (req, res) {

    console.log('hook request');

    try {
        // var speech = 'empty speech';

        // if (req.body) {
        //     var requestBody = req.body;

        //     if (requestBody.result) {
        //         speech = '';

        //         if (requestBody.result.fulfillment) {
        //             speech += requestBody.result.fulfillment.speech;
        //             speech += ' ';
        //         }

        //         if (requestBody.result.action) {
        //             speech += 'action: ' + requestBody.result.action;
        //         }
        //     }
        // }

        sessionIds.set(req.body.sessionId, res);

        //   console.log('result: ', speech);

        if (globalWs) {
            globalWs.send(JSON.stringify(req.body));
        }
        else {
            throw "Your car is not connected"; 
        }

        // return res.json({
        //     speech: speech,
        //     displayText: speech,
        //     source: 'apiai-webhook-sample'
        // });

        // res.sendStatus(200);
        // return res.json({
        //     status: {
        //         code: 200,
        //         errorType: res.su
        //     }
        // });
    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

server.ws('/', function (ws, req) {
    console.log('Client connected');
    globalWs = ws;
    ws.on('close', () => console.log('Client disconnected'));
    ws.on('message', function incoming(message) {
        let body = JSON.parse(message);
        console.log('received: %s', message);
        let res = (sessionIds.get(body.sessionId));
        if (res) {
            res.json({
                speech: body.message,
                displayText: body.message,
                source: 'apiai-webhook-sample'
            });
            sessionIds.delete(body.sessionId);
        }
    });
});

var aWss = expressWs.getWss('/');

// aWss.broadcast = function broadcast(data) {
//     aWss.clients.forEach(function each(client) {
//         // if (client.readyState === WebSocket.OPEN) {
//         client.send(data);
//         // }
//     });
// };

server.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
