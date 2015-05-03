// ie8+
function $ (selector) {
	return document.querySelectorAll(selector);
}
// 事件代理
$.delegate = function (element, tag, eventName, listener) {
	element['on' + eventName] = function (event) {
		var theTarget = getTarget(event);
		if (theTarget.tagName.toLowerCase() == tag.toLowerCase())
			listener(event);
	}
}
//////////////////////////////////////////////////////////////////
var player = new Player(document.getElementById('play-list-cont'));

var BASE_IMG_URL = 'images/';
var playList = document.getElementById('play-list');
var volumeMenu = document.getElementById('volume');
var listBtn = document.getElementById('list-btn');

var timeBar = document.getElementById('time-bar');
var timeBarPoint = timeBar.getElementsByTagName('div')[1];
var volOut = document.getElementById('vol-out');
var volPoint = volOut.getElementsByTagName('div')[1];

var preBtn = document.getElementById('pre');
var pausePlayBtn = document.getElementById('pause-play');
var nextBtn = document.getElementById('next');

var headerTitle = $('header h1')[0];
var headerSinger = $('header p')[0];
// 创建Canvas
var canvas = document.createElement('canvas');
canvas.style.position = 'absolute';
canvas.style.zIndex = -1;
canvas.style.left = 0;
canvas.style.top = 0;
document.body.appendChild(canvas);
var canvasCtx = canvas.getContext('2d');
// canvas上的点
var dots = [];

Player.prototype.draw = function (arr) {
	canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < dots.length; i++) {
		var dot = dots[i];
		var r = 10 + arr[i] / (player.size * 2) 
				* (canvas.width > canvas.height ? canvas.height : canvas.width) / 10;	// 圆的半径随机
		canvasCtx.beginPath();
		canvasCtx.arc(dot.x, dot.y, r, 0, Math.PI * 2, true);
		var g = canvasCtx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, r);
		g.addColorStop(0, 'white');
		g.addColorStop(1, dot.color);
		canvasCtx.fillStyle = g;
		canvasCtx.fill();
		dot.x += dot.dx;
		dot.y += dot.dy;
		if(dot.x > canvas.width || dot.x < 0) dot.dx = -dot.dx;
		if(dot.y > canvas.height || dot.y < 0) dot.dy = -dot.dy;
	}
}

preBtn.onclick = function (event) {
	player.pre();
	stopBubble(event);
}
pausePlayBtn.onclick = function (event) {
	if (this.title == '暂停') {
		player.stop();
		this.title = '播放';
		this.getElementsByTagName('img')[0].src = BASE_IMG_URL
			+ 'player_btn_play_normal.png';
	} else if (this.title == '播放') {
		player.play();
		this.title = '暂停';
		this.getElementsByTagName('img')[0].src = BASE_IMG_URL
			+ 'player_btn_pause_normal.png';
	}
	stopBubble(event);
}
nextBtn.onclick = function (event) {
	player.next();
	stopBubble(event);
}
listBtn.onclick = function (event) {
	playList.style.display = 'block';
	stopBubble(event);
}

playList.onclick = function (event) {
	stopBubble(event);
}
// 点击文档，显示隐藏菜单
document.onclick = function(event) {
	showOrHideMenu(playList, volumeMenu);
}
// 点击列表的歌曲时Ajax获取歌曲流
$.delegate($('#play-list-cont')[0], 'span', 'click', function (event) {
	var theTarget = getTarget(event);
	player.play(theTarget.parentNode.title);
});
// 取消音量条事件冒泡
volumeMenu.onclick = function (event) {
	stopBubble(event);
}
// 为音量进度条添加点击改变音量事件
volOut.onclick = function (event) {
	changeProgress(this, event, function (percent) {
		player.setVol(percent);
	});
}
onProgressPointDrag(volPoint);

this.onresize = resizeCanvas;
this.onload = resizeCanvas;

player.setSuccessCallback(switchSongChangeUI);
////////////////////////////////////////////////////////////////
function getDots () {
	dots = [];
	for (var i = 0; i < player.size; i++) {
		var x = random(0, canvas.width);
		var y = random(0, canvas.height);
		var color = 'rgba(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ', 0)';
		dots.push({x: x, y: y, dx: Math.random(2), dy: Math.random(2), color: color});
	}
}
function resizeCanvas () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	getDots();
}
function switchSongChangeUI () {
	// 改变header
	headerTitle.innerHTML = player.getCurSongTitle();
	headerSinger.innerHTML = '— ' + player.getCurSinger() + ' —';
	// 改变封面
	var coverImg = document.getElementById('cover').querySelectorAll('img')[0];
	var tmpFilename = player.getCurFileName();
	coverImg.src = BASE_IMG_URL + tmpFilename.substring(0, tmpFilename.lastIndexOf('.')) + '.jpg';
	// 改变时间轴
	var duration = document.getElementById('duration');
	duration.innerHTML = Math.floor(player.getCurSongDuration() / 60)
		+ ':' + Math.ceil(player.getCurSongDuration() % 60);
	// 改变歌曲列表选中状态
	var lis = document.getElementById('play-list-cont').childNodes;
	for(var i = 0; i < lis.length; i++) {
		if (lis[i].nodeName.toLowerCase() == 'li') {
			var title = lis[i].querySelectorAll('.list-song-title')[0];
			var singer = lis[i].querySelectorAll('.list-singer')[0];
			if (lis[i].title == player.getCurFileName())
				title.style.color = '#31C27C';			
			else
				title.style.color = 'white';
		}
	}
	if(pausePlayBtn.title == '播放') {
		pausePlayBtn.title = '暂停';
		pausePlayBtn.getElementsByTagName('img')[0].src = BASE_IMG_URL
			+ 'player_btn_pause_normal.png';
	}
	
}
/**
 * 点击文档，显示隐藏菜单
 */
function showOrHideMenu (playList, volumeMenu) {
	if (playList.style.display == 'block') {
		playList.style.display = 'none';
		return;
	}
	if (volumeMenu.style.display == 'none')
		volumeMenu.style.display = 'block';
	else
		volumeMenu.style.display = 'none';
}
/**
 * 改变进度条的值和样式，progressEle为最外层div; callback为回调函数
 */
function changeProgress (progressEle, event, callback) {
	var theEvent = getEvent(event);
	var percent = (event.clientX - getElementLeft(progressEle)) / progressEle.clientWidth * 100;
	if (percent > 100) percent = 100;
	if (percent < 0) percent = 0;
	var nodes = progressEle.getElementsByTagName('div');
	nodes[0].style.width = percent + '%';
	nodes[1].style.left = percent + '%';
	nodes[1].style.marginLeft = (-nodes[1].clientWidth / 2) + 'px';
	if (callback) callback(percent / 100);
}
/**
 * 拖动进度条小点时触发改变进度条事件
 */
function onProgressPointDrag (pointEle) {
	var isMouseDown = false;
	addListener(document, 'mousedown', function (mouseDownEvent) {
		if (getTarget(mouseDownEvent) === pointEle)
			isMouseDown = true;
	});
	addListener(document, 'mouseup', function (mouseUpEvent) { 
		isMouseDown = false;
	});
	addListener(document, 'mousemove', function (mouseMoveEvent) {
		if (!isMouseDown) return;
		changeProgress(pointEle.parentNode, mouseMoveEvent, function (percent) {
			player.setVol(percent);
		});
	});
}
///////////////////////////////////////////////////////////////////
function Player (ul) {
	var xmlhttp;
	if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest(); else xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
	// 与文件有关
	var lis = ul.getElementsByTagName('li');
	var baseURL = 'media/';
	var fileNames = [];
	for (var i = 0; i < lis.length; i++) {
		fileNames.push(lis[i].title);
	}
	var curFileName = '';
	var curSongTitle = '';
	var curSinger = '';
	var curSongDuration = 0;
	// 与音频分析有关
	var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	var bufferSource = null;
	var gainNode = audioCtx[audioCtx.createGain ? 'createGain' : 'createGainNode']();
	gainNode.connect(audioCtx.destination);
	var analyser = audioCtx.createAnalyser();
	var size = 128;
	analyser.fftSize = size * 2;
	analyser.connect(gainNode);
	// 回调函数
	var onsuccessCallback = function () {};

	var playCount = 0;

	function play(filename, onsuccess, onfail) {
		if (fileNames.length <= 0) { onfail(new Error('播放列表没有音乐')); return; }
		stop();
		var n = ++playCount;
		filename = filename || fileNames[0];
		var url = baseURL + filename;
		onsuccess = onsuccess || onsuccessCallback;
		onfail = onfail ? onfail : function (err) {console.log(err);};
		var that = this;
		xmlhttp.abort();
		xmlhttp.open('get', url, true);
		xmlhttp.responseType = 'arraybuffer';
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				if (n != playCount) return;
				audioCtx.decodeAudioData(xmlhttp.response, function (buffer) {
					if (n != playCount) return;
					bufferSource = audioCtx.createBufferSource();
					bufferSource.buffer = buffer;
					bufferSource.connect(analyser);
					bufferSource[bufferSource.start ? 'start' : 'noteOn'](0);
					that.curFileName = filename;
					that.curSongTitle = getSongTitle(filename);
					that.curSinger = getSinger(filename);
					that.curSongDuration = bufferSource.buffer.duration;
					onsuccess();
				}, onfail);
			}
		}
		xmlhttp.send();
	}

	function stop () {
		bufferSource && bufferSource[bufferSource.stop ? 'stop' : 'noteOff']();
	}

	function pre () {
		if (fileNames.length <= 0) return;
		fileNames.unshift(fileNames.pop());
		this.play();
	}

	function next () {
		if (fileNames.length <= 0) return;
		fileNames.push(fileNames.shift());
		this.play();
	}

	function getVol () {
		return gainNode.gain.value;
	}

	function setVol (value) {
		gainNode.gain.value = value;	
	}

	function addSong (songData) {
		fileNames.push(songData);
	}
	/**
	 * 删除歌曲，一次只能删除一首
	 * @param songName 歌曲名
	 */
	function removeSong (songName) {
		for (var i = 0; i < fileNames.length; i++) {
			if(fileNames[i].indexOf(songName) != -1)
				fileNames.splice(i - 1, 1);
		}
	}

	function getSongTitle (filename) {
		var arr = filename.split(/\s*-\s*/);
        return arr[1].split(/\./)[0];
	}

	function getSinger (filename) {
		return filename.split(/\s*-\s*/)[0];
	}

	function visualizer () {
		var arr = new Uint8Array(analyser.frequencyBinCount);
		requestAnimationFrame = window.requestAnimationFrame ||
								window.webkitRequestAnimationFrame ||
								window.mozRequestAnimation;
		function v () {
			analyser.getByteFrequencyData(arr);
			if (Player.prototype.draw) Player.prototype.draw(arr);
			requestAnimationFrame(v);
		}
		requestAnimationFrame(v);
	}
	function setSuccessCallback (callback) { onsuccessCallback = callback; }
	function getCurFileName () { return this.curFileName; }
	function getCurSongTitle () { return this.curSongTitle; }
	function getCurSinger () { return this.curSinger; }
	function getCurSongDuration () { return this.curSongDuration; }

	visualizer();

	return {
		BASE_URL: baseURL,
		size: size,
		getCurFileName: getCurFileName,
		getCurSongTitle: getCurSongTitle,
		getCurSinger: getCurSinger,
		getCurSongDuration: getCurSongDuration,
		setSuccessCallback: setSuccessCallback,
		play: play,
		stop: stop,
		pre: pre,
		next: next,
		getVol: getVol,
		setVol: setVol,
		addSong: addSong,
		removeSong: removeSong
	};
}




















































/**
 * 一些工具方法
 * @author Bill
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
function addListener (ele, eventName, callback) {
	if (ele.addEventListener) addEventListener(eventName, callback, false);
	else ele.attachEvent('on' + eventName, callback);
}
function removeListener (ele, eventName, callback) {
	if (ele.removeEventListener) ele.removeEventListener(eventName, callback, false);
	else ele.detachEvent('on' + eventName, callback);
}
/**
 * 获取元素的绝对位置left
 */
function getElementLeft (ele) {
	var offsetLeft = ele.offsetLeft;
	var curr = ele.offsetParent;
	while(curr) {
		if (curr.offsetLeft) {
			offsetLeft += curr.offsetLeft;
		}
		curr = curr.offsetParent;
	}
	return offsetLeft;
}
function random (m, n) {
	return Math.round(Math.random() * (n - m) + m);
}