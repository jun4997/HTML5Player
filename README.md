# 酷炫HTML5可视化音乐播放器

## 简介

![运行截图](html5_player.png "运行截图")

* 酷炫
* Canvas绘制音乐可视化背景。圆点随机移动，随音频不同而跳动
* 专辑封面旋转，歌曲时间轴（暂不可快进、快退）
* 音乐列表，列表循环重复播放。上一首，暂停，下一首功能
* 拖动滑条调节音量
* 后台由NodeJS + express + ejs提供服务

## 运行

安装NodeJS和express。切换到项目根目录，在命令行窗口输入：

	node bin/www

请使用较新版本Chrome/FireFox浏览器访问地址(默认3000端口)：

	http://localhost:3000/