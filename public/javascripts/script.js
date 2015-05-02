window.onload = function () {
	init();
}

function init () {
	var playList = document.getElementById('play-list');
	var listBtn = document.getElementById('list-btn');
	listBtn.onclick = function (event) {
		playList.style.display = 'block';
		stopBubble(event);
	}

	playList.onclick = function (event) {
		stopBubble(event);
	}

	document.onclick = function(event) {
		playList.style.display = 'none';
	}
}





/**
 * 一些工具方法
 */
function getEvent (event) {
	return event || window.event;
}
function getTarget (event) {
	var theEvent = getEvent(event);
	return theEvent.target || theEvent.srcElement;
}
function stopBubble (event) {
	var theEvent = getEvent(event);
	if (theEvent.stopPropagation) { theEvent.stopPropagation();	} else { theEvent.cancelBubbles = true; }
}