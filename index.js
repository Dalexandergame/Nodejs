/*
* Primary file for the API
*
*/

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');

// the server should respond to all request with a string
var server = http.createServer(function(req, res) {

    // Get the URL and parse it 
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP Method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data',function(data){
        buffer += decoder.write(data);
    });
    req.on('end',function(){
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use the not found handler
        var choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notfound;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        };

        // Route the request to the handler specified in the router
        choosenHandler(data, function(statusCode,payload){
            //Use the status code callback by the handler or default to
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            
            // Use the payload called back by the handler, or the default to 
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request path
            console.log('Returning this response: ',statusCode,payloadString);
        });

        });
    });

// start the the server
server.listen(config.port, function(){
    console.log("The server is listening on port "+config.port+" in "+config.envName+" mode");
});

// Define the handlers
var handlers = {};

// Sample handler
handlers.sample = function(data,callback){
    // Callback a http status code, and a payload object
    callback(406,{'name' : 'sample handler'});

};

// Not found handlers
handlers.notfound = function(data,callback){
    callback(404);
};

// Define a request router
var router = {
    'sample' : handlers.sample
};