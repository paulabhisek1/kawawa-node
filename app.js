var createError = require('http-errors');
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');
require('dotenv').config();

/* ENVIROMENT SET TO DEVELOPMENT */
process.env.ENVIRONMENT = 'development';

/* ENVIROMENT SET TO PRODUCTION */
// process.env.ENVIRONMENT = 'production';

/* SET NODE JS PROJECT ROOT DIRECTORY TO ENVIROMENT VARIABLE */
// process.env.NODE_BASE_PATH = path.dirname(require.main.filename || process.mainModule.filename);

var app = express();

// REMOVE X-POWERED-BY FROM RESPONSE HEADER
app.disable('x-powered-by');
// REMOVE SERVER FROM RESPONSE HEADER
app.disable('Server');

/* LOAD MYSQL DB */
require('./config/dbConfig');

app.use(bodyParser.json({
    limit: '50mb'
})); // support json encoded bodies
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
})); // support encoded bodies

/* using middleware */
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS,HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,access-token,x-http-method-override,x-access-token,authorization');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type,expire');
    next();
});

global.appPath = __dirname;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Load the constants
global.constants = require(global.appPath + '/config/constants');

// Initialize the events
require(global.appPath + '/helpers/events')(app)

var apiRouter = require('./routes/apiRoutes');
var adminRoutes = require('./routes/adminRoutes');
var artistRoutes = require('./routes/artistRoutes');

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.NODE_PORT || '3000');
app.set('port', port);

/**
 * Create HTTP / HTTPS server.
 */
console.log("process.env.ENVIRONMENT : ", process.env.ENVIRONMENT);
console.log("process.env.ENVIRONMENT : ", process.env.SSL_PRIVATE_KEY);
console.log("CHECK 1 : ", process.env.ENVIRONMENT == 'development');
console.log("CHECK 2 : ", fs.existsSync('../../../etc/letsencrypt/live/www.improcraft.com/privkey.pem'));
if ((process.env.ENVIRONMENT == 'development') && fs.existsSync(process.env.SSL_PRIVATE_KEY)) {
    console.log("HTTPS SERVER");
    var options = {
        key: fs.readFileSync(process.env.SSL_PRIVATE_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT_KEY),
        ca: fs.readFileSync(process.env.SSL_FULLCHAIN_KEY)
    };
    var server = require('https').createServer(options, app);
} else {
    console.log("HTTP SERVER");
    var server = require('http').createServer(app); // Create HTTP Server
}



/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/*
 * Listen to all http response here
 */
function InterceptorForAllResponse(req, res, next) {
    var oldSend = res.send;
    res.send = function(data) {
        // arguments[0] (or `data`) contains the response body        
        oldSend.apply(res, arguments);
    }
    next();
}

app.use(InterceptorForAllResponse);

//------------------------------------------- ROUTES ----------------------------------------------//
app.use('/api', apiRouter); // API Routes
app.use('/admin', adminRoutes); // ADMIN Routes
app.use('/artist', artistRoutes); // ARTIST Routes
app.use('/', function(req, res) {
    res.send({
        "status": 200,
        "message": "App Running Successfully"
    });
}); // Root Route (FOR TESTING)
//------------------------------------------- ROUTES ----------------------------------------------//

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    console.log(err);
    res.status(err.status || 500).json('error');
});


/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    console.log('Listening on', bind);
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

module.exports = app;