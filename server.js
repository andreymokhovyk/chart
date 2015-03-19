
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

var sockjs = require('sockjs');

var chat = sockjs.createServer();
var clients = {};
var count = 0;

var userlist = {
	'serverID' : {
		name : 'server',
		avatar : 'serverAvatar'
	}
}

function broadcast(message, users){
	if (users && users !== 'all') {
		for (var i in users) {
			clients[users[i]].write(message);
		}
	} else {
		for (var client in clients) {
			clients[client].write(message);
		}
	}
}


function createMessage(type, users, message, date) {
	var msg = {
		type: type,
		dialog: users,
		message: message,
		date: date || Date.now()
	};
	return JSON.stringify(msg);
}



chat.on('connection', function(conn) {
	count++;

	conn.write(createMessage('id', ['serverID'], conn.id));

	clients[conn.id] = conn;

	userlist[conn.id] = {};
	userlist[conn.id]['name'] = 'user'+count;
	userlist[conn.id]['avatar'] = 'img';


	broadcast(createMessage('userlist', ['serverID'], userlist));


	conn.write(createMessage('message', ['serverID', conn.id], 'Hello on chat'));


	conn.on('data', function(data) {

		var data =  JSON.parse(data)
		console.log(data)
		broadcast(createMessage('message', data.dialog, data.message, data.date), data.dialog);
	});


	// on connection close event
	conn.on('close', function() {
		delete clients[conn.id];
		delete userlist[conn.id];

		broadcast(createMessage('userlist', ['serverID'], userlist));
	});
});


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
chat.installHandlers(server, {prefix:'/chat'});
