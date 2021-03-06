(function () {
	var contextRoot = "/" + window.location.pathname.split('/')[1];
	var socket = new SockJS("/OnlineQuestionAndAnswerSystem/ws");
	var stompClient = Stomp.over(socket);

	var handleQuestionAdd = function (frame) {
		let question = JSON.parse(frame.body);
		let topics = question.topics;
		let topicHtml = '';
		topics.forEach((v) => {
			topicHtml += '<div class="topic-item">' + v.name + '</div>';
		});
		let newQuestion = '<div class="question" id="question_${question.id}">'+
							'<a href="javascript:void(0)" class="vote-up-icon voteUpQuestion" data-qid="' + question.id + '"></a>' +
							'<div class="vote-num"><span id="vote_' + question.id + '">'+question.votes+'</span> ' + i18nVote + '</div>'+
							'<div class="answer-num">'+question.numOfAnswers +' ' + i18nAnswer + '</div>'+
							'<div class="group-title">'+
								'<div class="title">'+
									'<a href="'+question.id+'">'+question.title+'</a>'+
								'</div>'+
								'<div class="sub-group-title">'+
									'<div class="topic">'+
											topicHtml +
									'</div>'+
									'<div class="by-user">'+
										i18nAt + ' ' + convertDateToString(question.dateTime) + ' by <a href="#">'+ (question.questioner?question.questioner.username : 'Unknown') +'</a>'+
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>';
		$('#questionList').prepend(newQuestion);
		$('#questionList').children().first().effect("highlight", {}, 2000);
	};
	// Handle Vote up WS
	var handleQuestionVoteUp = function (frame) {
		let question = JSON.parse(frame.body);
		$('#vote_' + question.id).html(question.votes);
		if (question.votes >= 3) {
			$('#question_' + question.id).addClass('high-vote');
		}
	}

	var handleAnswerAdd = function (frame) {
		let answer = JSON.parse(frame.body);
		var element = $("#answers[data-question-id=" + answer.question.id + "] #comments");
		console.log(answer);
		element.prepend('<div class="media"><div class="media-left"><div class="blank-profile avatar '+ answer.answerer.username.charAt(0) +'">'+ answer.answerer.username.charAt(0) +'</div></div><div class="media-body"style="overflow: hidden; zoom: 1; display: table-cell; vertical-align: top;"><div class="media-heading"><h4>'+ answer.answerer.username +'</h4><span class="time">- ' + convertDateToString(answer.dateTime) + '</span></div><p>' + answer.details + '</p></div></div>');

		element.children().first().effect("highlight", {}, 2000);
	};

	// Handle Vote Up
	var onClickVoteUp = function (e) {
		let self = $(e.target);
		let id = self.data('qid');
		if (self.hasClass('voted')) {
			return;
		}
		$.ajax({
			url: contextRoot + '/question/voteUp/' + id,
			type: 'GET',
			success: function (resp) {
				self.addClass('voted');
			},
			error: function (err) {
				console.log(err);
			}
		});
	}

	// Callback function to be called when stomp client is connected to server
	var connectCallback = function () {
		stompClient.subscribe('/topic/question/add', handleQuestionAdd);
		stompClient.subscribe('/topic/question/voteUp', handleQuestionVoteUp);
		stompClient.subscribe('/topic/answer/add', handleAnswerAdd);
	};

	// Callback function to be called when stomp client could not connect to
	// server
	var errorCallback = function (error) {
		console.log(error);
	};

	stompClient.connect("guest", "guest", connectCallback, errorCallback);

	// Register for events
	$(document).ready(function (e) {
		$('#questionList').on('click', '.voteUpQuestion', onClickVoteUp);
	});

	//----Add new answer
	var contextRoot = "/" + window.location.pathname.split('/')[1];

})();

//----Add new answer
var contextRoot = "/" + window.location.pathname.split('/')[1];

function addAnswer(questionId) {
	$.ajax({
		url: contextRoot + "/answer/add",
		type: 'GET',
		data: {
			questionId: questionId,
			details: $("#add_answer_form").find("#answer_detail").val(),
		},
		dataType: "json",
		contentType: 'application/json',
		success: function (answer) {

		},
		error: function (errorObject) {
			console.log(errorObject);
		}
	})
}

function convertDateToString(timeStamp) {
	var time = new Date(timeStamp);
	var timeAsString = time.getHours() +
		":" +
		time.getMinutes() +
		":" +
		time.getSeconds() +
		" " +
		time.getMonth() +
		"/" +
		time.getDate() +
		"/" +
		time.getFullYear() ;
	return timeAsString;
}