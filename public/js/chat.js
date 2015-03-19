var sock = new SockJS('http://localhost:3000/chat');

// Open the connection
sock.onopen = function() {
	console.log('open');
};

// On connection close
sock.onclose = function() {
	console.log('close');
};


var app = angular.module('Chart', ['ui.bootstrap']);
app.controller('ChatCtrl', function ($scope) {
	$scope.clientID = '';
	$scope.currentChat = {}
	$scope.currentChat.id = '';

	$scope.userlist = {};
	$scope.chat = {};

	$scope.selectChat = function(key) {
		$scope.currentChat.id = key;
		$scope.messageText = "";
	};
	$scope.newChat = function() {
		$scope.currentChat.id = '';
	};



	$scope.sendMessage = function() {
		var msg = {
			type: "message",
			message: $scope.messageText,
			dialog: [$scope.clientID, $scope.currentChat.id],
			date: Date.now()
		};

		sock.send(JSON.stringify(msg));

		$scope.messageText = "";
	};


  	sock.onmessage = function(e) {
		console.log(e.data)

		var msg = JSON.parse(e.data);
		var user = msg.dialog[0] == $scope.clientID ? msg.dialog[1] : msg.dialog[0];
		var dir = msg.dialog[0] == $scope.clientID ? 'outbox' : 'inbox';
		var time = new Date(msg.date);
		var timeStr = time.toLocaleTimeString();

		switch(msg.type) {

			case "id":
				$scope.clientID = msg.message;
				break;
			case "message":
				console.log('message');
				console.log(msg);

				if (!$scope.chat[user]) {
					$scope.chat[user] = {};
					$scope.chat[user].massages = [];
				}

				var m = {
					time: timeStr,
					dir: dir,
					text:msg.message
				}


				$scope.chat[user].massages.push(m);
				$scope.$apply();

				break;

			case "userlist":
				console.log('user');

				$scope.userlist = msg.message;
				$scope.$apply();

				break;
			/*
			 case "username":
			 text = "<b>User <em>" + msg.name + "</em> signed in at " + timeStr + "</b><br>";
			 break;
			 case "rejectusername":
			 text = "<b>Your username has been set to <em>" + msg.name + "</em> because the name you chose is in use.</b><br>"
			 break;
			 */
		}
  	};

});

app.filter('getByName', function() {
	return function(input, search) {
		var out = [];

		if (search) {
			angular.forEach(input, function (e) {
				if (e.name.indexOf(search)>=0 ) {
					out.push(e);
				}
			});
		} else {
			out = input;
		}

		return out;
	}
});