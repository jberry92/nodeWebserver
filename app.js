
const net = require('net');
const fs = require('fs');
const utils = require('util');
const promiseReadFile = utils.promisify(fs.readFile);

const server = net.createServer((socket) => {
    socket.on('data', async (request) => {
        const parsedRequest = parseRequest(request.toString());    
        const html = await promiseReadFile('./pages/' + parsedRequest.path);
        let response = `HTTP/1.1 200 OK`
        if (!html) {
            response = 'HTTP/1.1 404 NOT-FOUND'
        }
        const fullResponse = `${response}\r\n\r\n${html}`   
        socket.end(fullResponse);
    });
    

    socket.on('error', (err) => {
        console.log(err);
    })
}).on('error', (err) => {
    console.log(err);
});

server.listen(1234, 'localhost', () => {
    console.log('listening on port ' + JSON.stringify(server.address()));
});

server.maxConnections = 20;


function parseRequest(requestString) {
    splitRequest = requestString.split("\r\n");
    const firstLine = splitRequest[0].match(/^([A-Z]+) ([^ ]+) (HTTP\/\d+\.\d+)$/);
    if (!firstLine) {
        throw new Error('Invalid HTTP request');
    }

    let headers = {};
    for(let i = 1; i < splitRequest.length; i++ ) {
        if (!splitRequest[i]) {
            break;
        }
        let header = splitRequest[i].match(/^([^:]+): (.+)$/i);
        headers[header[1]] = header[2];
    }

    const parsedRequest = {
        method: firstLine[1],
        path: firstLine[2],
        protocol: firstLine[3],
        headers: headers,
    }

    return parsedRequest;
}