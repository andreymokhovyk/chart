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
	$scope.currentChat = {}
	$scope.currentChat.id = '';

	$scope.userlist = {};
	$scope.chat = {};
	$scope.user = {
		id:'',
		name:'',
		avatar:''
	};

	$scope.selectChat = function(key) {
		$scope.currentChat.id = key;
		$scope.messageText = "";
	};
	$scope.newChat = function() {
		$scope.currentChat.id = '';
	};

	$scope.$watchCollection('user', function(newVal, oldVal){
		console.log('changed us');
		//$scope.sendUser();
	});

	$scope.sendMessage = function() {
		var msg = {
			type: "message",
			message: $scope.messageText,
			dialog: [$scope.user.id, $scope.currentChat.id],
			date: Date.now()
		};
console.log(msg)
		sock.send(JSON.stringify(msg));

		$scope.messageText = "";
	};

	$scope.sendUser = function() {
		var msg = {
			type: "user",
			message: $scope.user,
			dialog: [$scope.user.id],
			date: Date.now()
		};
		console.log('sendUser')
		console.log(msg)
		sock.send(JSON.stringify(msg));
	};

  	sock.onmessage = function(e) {
		console.log(e.data)

		var msg = JSON.parse(e.data);
		var user = msg.dialog[0] == $scope.user.id ? msg.dialog[1] : msg.dialog[0];
		var dir = msg.dialog[0] == $scope.user.id ? 'outbox' : 'inbox';
		var time = new Date(msg.date);
		var timeStr = time.toLocaleTimeString();

		switch(msg.type) {

			case 'id':
				$scope.user.id = msg.message.id;
				$scope.user.name = msg.message.name;
				$scope.user.avatar = msg.message.avatar;
				break;
			case 'message':
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

			case 'userlist':
				console.log('userlist');
				console.log($scope.userlist);
				$scope.userlist = msg.message;
								console.log($scope.userlist);
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