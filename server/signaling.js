"use strict";

// 🔻 Socket Io
var port = process.env.PORT || 3001;
var io = require('socket.io').listen(port);
console.log((new Date()) + " Server is listening on port " + port);

io.sockets.on('connection', function(socket) {
	var connectGroup = null;

	// 接続時の処理
	socket.on('open', function(option) {
		connectGroup = option.connectGroup
		socket.join(option.connectGroup);
		socket.emit('open', {
			messageTypes: messageTypes,
			userId: socket.id
		});
	});

	// 切断時の処理
	socket.on('disconnect', function() {
		console.log("disconnect");
	});

	// シグナリング処理
	socket.on('message', function(message) {
		// 特定のユーザに送信
		var target = message.sendto || message.param.sendto;
		if (target) {
			socket.to(target).emit('message', message);
			return;
		}
		// 接続グループ全員に送信
		socket.broadcast.to(connectGroup).emit('message', message);
	});
});
// 🔺 Socket Io
