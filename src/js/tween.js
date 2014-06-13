/*＠jQuery
 */
(function($)
{
	/**************************************************************************************
	transition ver 0.27
	*/

	window.Tween = function()
	{
		this.init.apply(this, arguments);
	};

	/*
	p_tgt				セレクタ文字列
	p_isBackface		裏の表示の可否
	p_transformOrign	変形の中心点
	p_isAutoDispose		アニメーション終了時にdispose
	*/
	window.Tween.prototype.init = function(p_tgt, p_isBackface, p_transformOrign, p_isAutoDispose)
	{
		var _this = this;
		_this._arg = arguments;
		_this.selector = p_tgt;
		_this.tgt = $(p_tgt);
		_this.isBackface = !!p_isBackface;
		_this.transformOrign = p_transformOrign;
		_this.isAutoDispose = !!p_isAutoDispose;
		_this.timestamp = "";
		_this.tid = 0;
		_this.userInfo = Utils.getUserInfo();
		_this.tsDuration = 20;//from描画待ち待機時間。16～で安定か？
		if(_this.tgt.length >1) throw new Error("Tween target too length!");

		if(_this.userInfo.isIE) _this.bKey = "";
		else if(_this.userInfo.isSafari || _this.userInfo.isChrome) _this.bKey = "-webkit-";
		else if(_this.userInfo.isFirefox) _this.bKey = "-moz-";
		else if(_this.userInfo.isOpera) _this.bKey = "-o-";
		else _this.bKey = "-webkit-";

		_this.transitionName = _this.bKey + "transition";
		_this.transformName = _this.bKey + "transform";
		_this.transformOrignName = _this.bKey + "transform-origin";
		_this.backfacevisibilityName = _this.bKey+"backface-visibility";

		_this._cssOn = _this._f_createCssOn();
		_this.tgt.css(_this._cssOn);
	};

	/*直接参照用*/
	window.Tween.ease = {
		linear:"linear",
		easeIn:"ease-in",
		easeOut:"ease-out",
		easeInOut:"ease-in-out",

		cubicIn:"cubic-bezier(0.550, 0.055, 0.675, 0.190)",
		cubicOut:"cubic-bezier(0.215, 0.610, 0.355, 1.000)",
		cubicInOut:"cubic-bezier(0.645, 0.045, 0.355, 1.000)",

		circIn:"cubic-bezier(0.600, 0.040, 0.980, 0.335)",
		circOut:"cubic-bezier(0.075, 0.820, 0.165, 1.000)",
		circInOut:"cubic-bezier(0.785, 0.135, 0.150, 0.860)",

		expoIn:"cubic-bezier(0.950, 0.050, 0.795, 0.035)",
		expoOut:"cubic-bezier(0.190, 1.000, 0.220, 1.000)",
		expoInOut:"cubic-bezier(1.000, 0.000, 0.000, 1.000)",

		quadIn:"cubic-bezier(0.550, 0.085, 0.680, 0.530)",
		quadOut:"cubic-bezier(0.250, 0.460, 0.450, 0.940)",
		quadInOut:"cubic-bezier(0.455, 0.030, 0.515, 0.955)",

		quartIn:"cubic-bezier(0.895, 0.030, 0.685, 0.220)",
		quartOut:"cubic-bezier(0.165, 0.840, 0.440, 1.000)",
		quartInOut:"cubic-bezier(0.770, 0.000, 0.175, 1.000)",

		quintIn:"cubic-bezier(0.755, 0.050, 0.855, 0.060)",
		quintOut:"cubic-bezier(0.230, 1.000, 0.320, 1.000)",
		quintInOut:"cubic-bezier(0.860, 0.000, 0.070, 1.000)",

		sineIn:"cubic-bezier(0.470, 0.000, 0.745, 0.715)",
		sineOut:"cubic-bezier(0.390, 0.575, 0.565, 1.000)",
		sineInOut:"cubic-bezier(0.445, 0.050, 0.550, 0.950)",

		backIn:"cubic-bezier(0.600, -0.280, 0.735, 0.045)",
		backOut:"cubic-bezier(0.175,  0.885, 0.320, 1.275)",
		backInOut:"cubic-bezier(0.680, -0.550, 0.265, 1.550)"
	};

	window.Tween.prototype._transitionEnd = "webkitTransitionEnd transitionend oTransitionEnd";

	window.Tween.prototype._cssOff = {
		"-webkit-transition":"",
		"-moz-transition":"",
		"-ms-transition":"",
		"-o-transition":"",
		"transition":""
	};

	window.Tween.prototype._cssDispose = {
		"-webkit-transition":"",
		"-webkit-transform":"",
		"-webkit-transform-style":"",
		"-webkit-backface-visibility":"",

		"-moz-transition":"",
		"-moz-transform":"",
		"-moz-transform-style":"",
		"-moz-backface-visibility":"",

		"-ms-transition":"",
		"-ms-transform":"",
		"-ms-transform-style":"",
		"-ms-backface-visibility":"",

		"-o-transition":"",
		"-o-transform":"",
		"-o-transform-style":"",
		"-o-backface-visibility":"",

		"transition":"",
		"transform":"",
		"transform-style":"",
		"backface-visibility":""
	};

	window.Tween.prototype._f_createCssOn = function()
	{
		var _this = this;
		var _css = {};
		_css["-webkit-transform-style"] = "preserve-3d";
		if(_this.transformOrign) _css[_this.transformOrignName] = _this.transformOrign;
		if(!_this.isBackface) _css[_this.backfacevisibilityName] = "hidden";
		//_css.overflow = "hidden";//ちらつき防止
		return _css;
	};

	window.Tween.prototype._f_createParams = function(p_param)
	{
		var _this = this;
		var _param = "";
		for (key in p_param)
		{
			if(key.indexOf("translate") <0 && key.indexOf("skew") <0 && key.indexOf("rotate") <0 && key.indexOf("scale") <0)
			{
				_this._cssOn[key] = p_param[key]+"";
			}
			else
			{
				if(_param !== "") _param += " ";
				if(p_param[key]) _param += key+"("+p_param[key]+")";
			}
		}

		return _param;
	};

	window.Tween.prototype._createTimestamp = function()
	{
		return new Date().getTimestamp();//utils-full_old.js
	};

	window.Tween.prototype.dispose = function()
	{
		var _this = this;
		_this.tgt.find("h1,h2,h3,h4,p").css({"-webkit-transform-style":""});//ちらつき防止
		_this.tgt.css(_this._cssDispose);
	};

	/*
	 ～へ
	 */
	window.Tween.prototype.to = function(p_to, p_duration, p_transition, p_delay, p_callback, p_noTransitionCallback)
	{
		var _this = this;
		if(!_this.userInfo.isTransition)
		{
			if(p_noTransitionCallback) p_noTransitionCallback(_this.tgt);
			return;
		}

		clearTimeout(_this.tid);
		_this._cssOn = _this._f_createCssOn();
		if(!p_duration) p_duration = 0;
		if(!p_transition) p_transition = "linear";
		if(!p_delay) p_delay = 0;
		_this._cssOn[_this.transitionName] = "all " + p_duration +"ms " + p_delay +"ms "+ p_transition;
		_this._cssOn[_this.transformName] = _this._f_createParams(p_to);

		function f_onComplete(e)
		{
			if($(e.target).attr("data-tweenTimestamp") !== _this.timestamp) return;
			_this.tgt.unbind(_this._transitionEnd, f_onComplete);
			_this.timestamp = "";
			_this.tgt.removeAttr("data-tweenTimestamp");
			//_this.tgt.find("h1,h2,h3,h4,p").css({"-webkit-transform-style":""});
			_this.tgt.css(_this._cssOff);
			if(_this.isAutoDispose) _this.dispose();
			if(p_callback) p_callback(_this);
		}

		if(p_duration <= 0)
		{
			_this._cssOn[_this.transitionName] = "";
			_this.tgt.css(_this._cssOn);
			f_onComplete();
		}
		else
		{
			_this.tgt.unbind(_this._transitionEnd);
			_this.tgt.bind(_this._transitionEnd, f_onComplete);
			_this.tgt.find("h1,h2,h3,h4,p").css({"-webkit-transform-style":"preserve-3d"});//ちらつき防止
			_this.tgt.css(_this._cssOn);
			_this.timestamp = _this._createTimestamp();
			_this.tgt.attr("data-tweenTimestamp", _this.timestamp);
		}
	};

	/*
	 ～から～へ
	 */
	window.Tween.prototype.fromTo = function(p_from, p_to, p_duration, p_transition, p_delay, p_callback, p_noTransitionCallback)
	{
		var _this = this;
		if(!_this.userInfo.isTransition)
		{
			if(p_noTransitionCallback) p_noTransitionCallback(_this.tgt);
			return;
		}

		_this.setTransform(p_from);
		clearTimeout(_this.tid);
		_this.tid = setTimeout(function(){_this.to(p_to, p_duration, p_transition, p_delay, p_callback)}, _this.tsDuration);
	};

	window.Tween.prototype.setTransform = function(p_prop)
	{
		var _this = this;
		_this._cssOn = _this._f_createCssOn();
		_this.dispose();
		_this._cssOn[_this.transformName] = _this._f_createParams(p_prop);
		_this.tgt.css(_this._cssOn);
	};

	//Loaded
	$(function()
	{

	});
})(jQuery);