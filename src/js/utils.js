/**************************************************************************************
 Utils ver0.8.9
 ***************************************************************************************/

/*＠jQuery
 */
(function ($){
	var _Utils = {};
	window.Utils = _Utils;

	/**************************************************************************************
	 よけもの
	 */
		//consoleよけ
	_Utils._isConsole = true;
	if (!Utils._isConsole || !window.console) window.console = {log: function (){
	}};

	//traceよけ
	_Utils._isTrace = true;

	/**************************************************************************************
	 継承関数
	 */
	Function.prototype.extend = function (Class){
		function f(){
		};
		f.prototype = Class.prototype;
		this.prototype = new f();
		this.prototype.__super__ = Class.prototype;
		this.prototype.__super__.constructor = Class;
		this.prototype.constructor = this;
	};

	/**************************************************************************************
	 clone
	 */

	Array.prototype.clone = function (){
		return this.concat();
	};

	//試験的：要json2.js
	_Utils.cloneObject = function (p_obj){
		return JSON.parse(JSON.stringify(p_obj));
	};

	/**************************************************************************************
	 String
	 */
	String.prototype.replaceAll = function (p_from, p_to){
		return this.split(p_from).join(p_to);
	};

	/**************************************************************************************
	 Point
	 */
	window.Point = function (p_x, p_y){
		var _this = this;
		_this.x = p_x * 1 || 0;
		_this.y = p_y * 1 || 0;

		_this.clone = function (){
			return new Point(_this.x, _this.y);
		};
	};

	/**************************************************************************************
	 Rectangle
	 */
	window.Rectangle = function (p_x, p_y, p_w, p_h){
		var _this = this;
		_this.x = p_x * 1 || 0;
		_this.y = p_y * 1 || 0;
		_this.width = p_w * 1 || 0;
		_this.height = p_h * 1 || 0;
		_this.clone = function (){
			return new Rectangle(_this.x, _this.y, _this.width, _this.height);
		};
	};

	/**************************************************************************************
	 日付
	 */
	Date.prototype.getObject = function (){
		var _date = new Date();
		var _yy = _date.getYear();
		var _mm = _date.getMonth() + 1;
		var _dd = _date.getDate();
		var _hh = _date.getHours();
		var _mi = _date.getMinutes();
		var _se = _date.getSeconds();
		var _mse = _date.getMilliseconds();
		var _now;

		if (_yy < 2000) {
			_yy += 1900;
		}
		_mm = _Utils.numAlignment(_mm, 2);
		_dd = _Utils.numAlignment(_dd, 2);
		_hh = _Utils.numAlignment(_hh, 2);
		_mi = _Utils.numAlignment(_mi, 2);
		_se = _Utils.numAlignment(_se, 2);
		_mse = _Utils.numAlignment(_mse, 3);
		_now = {year: _yy, month: _mm, day: _dd, hour: _hh, min: _mi, sec: _se, msec: _mse};
		return _now;
	};

	Date.prototype.getTimestamp = function (){
		var _obj = this.getObject();
		return _obj.year + "" + _obj.month + "" + _obj.day + "" + _obj.hour + "" + _obj.min + "" + _obj.sec + "" + _obj.msec;
	};

	Date.prototype.getUnixtime = function (){
		return parseInt(this.toString() / 1000);
	};

	/**************************************************************************************
	 UserInformation
	 */
	_Utils.UA = function (){
		var _this = this;
		var _appVersion = navigator.appVersion;
		var _appName = navigator.appName;
		var _userAgent = navigator.userAgent;

		_this.isWin9X = _appVersion.toLowerCase().search(/windows 98/) != -1;
		_this.isIE = _userAgent.toLowerCase().search(/msie/) != -1;
		_this.isIE6 = _userAgent.toLowerCase().search(/msie 6./) != -1;
		_this.isIE7 = _userAgent.toLowerCase().search(/msie 7./) != -1;
		_this.isIE8 = _userAgent.toLowerCase().search(/msie 8./) != -1;
		_this.isIE9 = _userAgent.toLowerCase().search(/msie 9./) != -1;
		_this.isIE10 = _userAgent.toLowerCase().search(/msie 10./) != -1;
		_this.isFirefox = _userAgent.toLowerCase().search(/firefox/) != -1;
		_this.isOpera = _userAgent.toLowerCase().search(/opera/) != -1;
		if (_this.isOpera) _this.isIE = false;
		_this.isSafari = _appVersion.toLowerCase().search(/safari/) != -1;
		_this.isChrome = _appVersion.toLowerCase().search(/chrome/) != -1;
		if (_this.isChrome) _this.isSafari = false;
		_this.isIPhone = _userAgent.search(/iPhone/) != -1;
		_this.isIPad = _userAgent.search(/iPad/) != -1;
		_this.isIPod = _userAgent.search(/iPod/) != -1;
		_this.isIOS = _this.isIPhone || _this.isIPad || _this.isIPod;
		_this.isIOS3 = _userAgent.search(/iPhone OS 3_/) != -1;
		_this.isIOS4 = _userAgent.search(/iPhone OS 4_/) != -1;
		_this.isIOS5 = _userAgent.search(/iPhone OS 5_/) != -1;
		_this.isIOS6 = _userAgent.search(/iPhone OS 6_/) != -1;
		_this.isAndroid = _userAgent.search(/Android /) != -1;
		_this.isAndroid1 = _userAgent.search(/Android 1./) != -1;
		_this.isAndroid2 = _userAgent.search(/Android 2./) != -1;
		_this.isAndroid3 = _userAgent.search(/Android 3./) != -1;
		_this.isAndroid4 = _userAgent.search(/Android 4./) != -1;
		_this.AndroidVer = _this.isAndroid ? _userAgent.match(/Android (\d+(?:\.\d+){1,2});/)[1] : null;
		_this.isLS = ('localStorage' in window) && window['localStorage'] !== null;

		//transitionの有無
		_this.isTransition = !!(function (undefined){
			var elem = document.createElement("div");
			var props = [
				"transition",
				"WebkitTransition",
				"MozTransition",
				"OTransition"
			];
			for (var i = 0; i < props.length; i++) {
				if (elem.style[props[i] + "Property"] !== undefined) {
					return props[i];
				}
			}
			return null;
		})();
	};
	_Utils._ua = new _Utils.UA();
	//$.UIDevice = _Utils._ua;
	_Utils.getUserInfo = function (){
		return _Utils._ua;
	};

	/**************************************************************************************
	 Scroll
	 */
	_Utils.scrollTo = function (p_posX, p_posY, p_duration, p_callback){
		if (typeof p_duration === "undefined" || p_duration == null) p_duration = 500;
		if (typeof p_callback === "undefined" || p_callback == null) p_callback = null;
		var _uf = Utils.getUserInfo();
		setTimeout(function (){
			if (_uf.isAndroid) {
				//Android一部機種でblur切りしないとanimateが動かないので破棄
				if (navigator.userAgent.search(/Android 2.3/) != -1 ||
					navigator.userAgent.search(/Android 2.2/) != -1 ||
					navigator.userAgent.search(/Android 2.1/) != -1 ||
					_uf.isAndroid1) {
					window.scrollTo(p_posX, p_posY);
					p_callback();
				}
				else $("html, body").animate({scrollLeft: p_posX, scrollTop: p_posY}, p_duration, p_callback);
			}
			else if (_uf.isIOS) {
				$("html, body").stop(true, false).animate({scrollTop: p_posY}, p_duration, p_callback);
				$("html").stop(true, false).animate({scrollLeft: p_posX}, p_duration);
			}
			else $("html, body").animate({scrollLeft: p_posX, scrollTop: p_posY}, p_duration, p_callback);
		}, _uf.isAndroid ? 200 : 10);
	};

	/**************************************************************************************
	 ScrollPosition
	 */
	_Utils.getScrollPos = function (){
		var obj = new Point();
		obj.x = document.documentElement.scrollLeft || document.body.scrollLeft;
		obj.y = document.documentElement.scrollTop || document.body.scrollTop;
		return obj;
	};

	/**************************************************************************************
	 getScreenSize
	 */
	_Utils.getScreenSize = function (){
		var _ui = Utils.getUserInfo();
		var _in = Utils.getInnerSize();
		var _sc = {};
		var _portrait = (Math.abs(window.orientation) == 0);
		_sc.w = _portrait ? screen.width : screen.height;
		_sc.h = _portrait ? screen.height : screen.width;
		_sc.inH = _in.h;
		_sc.inW = _in.w;

		var _adBar = 0;
		var _navBar = 0;
		var _height = _sc.h;
		var _width = _sc.w;
		var _head = 20;

		if (!window.webview && !window.navigator.standalone) {
			if (_ui.isAndroid) {
				_adBar = (window.outerHeight / window.devicePixelRatio) - _in.h;
			} else if (_ui.isIPad) {
				_adBar = _height - _in.h - _head;
			} else if (_ui.isIPhone || _ui.isIPod) {
				_navBar = _portrait ? 44 : 32;
				_adBar = _height - _in.h - (_head + _navBar);
			}
		}

		_sc.navigationH = _navBar;
		_sc.addressH = _adBar;
		//コンテンツ表示領域最大の高さ
		_sc.viewH = _ui.isIPad ? _in.h : _in.h + _adBar;
		return _sc;
	};

	_Utils.getDocumentSize = function (){
		var _doc = {};
		_doc.w = document.documentElement.scrollWidth || document.body.scrollWidth;
		_doc.h = document.documentElement.scrollHeight || document.body.scrollHeight;
		return _doc;
	};

	_Utils.getInnerSize = function (){
		var w, h;

		//IE以外
		if ((!document.all || window.opera) && document.getElementById) {
			w = window.innerWidth;
			h = window.innerHeight;
		}
		else {
			w = document.documentElement.clientWidth || document.body.clientWidth || document.body.scrollWidth;
			h = document.documentElement.clientHeight || document.body.clientHeight || document.body.scrollHeight;
		}

		return {w: w, h: h};
	};

	/**************************************************************************************
	 mouseMove
	 */
	_Utils.onMouseMove = function (p_boo, p_callback){
		function f_onMouseMove(e){
			var _pos = new Point();
			if (e) {
				_pos.x = e.pageX;
				_pos.y = e.pageY;
			}
			else {
				_pos.x = event.x + document.body.scrollLeft;
				_pos.y = event.y + document.body.scrollTop;
			}

			if (p_callback) p_callback(_pos);
		}

		if (p_boo) window.document.onmousemove = f_onMouseMove;
		else window.document.onmousemove = null;
	};

	/**************************************************************************************
	 UI Lock
	 */
	var f_lock = function (e){
		e.preventDefault();
		e.stopPropagation();
	};

	_Utils.uiLock = function (p_boo){
		var _isEl = !!(document.addEventListener);
		var _isAe = !!(document.attachEvent);
		if (p_boo) {
			document.addEventListener("touchstart", f_lock, true);
		}
		else {
			document.removeEventListener("touchstart", f_lock, true);
		}
	};

	/**************************************************************************************
	 型判定
	 */
	_Utils.getType = function (o){
		if (o === null) return 'null';
		if (typeof o == 'undefined') return 'undefined';
		if (typeof o == 'boolean') return 'boolean';
		if (typeof o == 'string') return 'string';
		if (typeof o == 'number') return 'number';
		if (o instanceof Array) return 'array';
		if (o instanceof RegExp) return 'regexp';
		if (o instanceof Date) return 'date';
		if (typeof o == 'function') return 'function';
		if (typeof o == 'object') return 'object';
		return 'unknown';
	};

	/**************************************************************************************
	 tracer
	 obj            出力したいモノ
	 isHtml        HTMLとしてView側に出力するかどうか:Boolean 省略可能
	 isSolo        最新のみ表示するかどうか:Boolean 省略可能
	 p_maxDeep    検出深度:Number 省略可能
	 */
	_Utils.trace = function (obj, isHtml, isSolo, p_maxDeep){
		if (!_Utils._isTrace) return;

		var __traceObject;
		var type;
		var str = "";//"-- Utils.trace : " + new Date().toString() + "\n";
		var maxDeep = p_maxDeep || 10;

		__traceObject = function (obj, str, num){
			var space = "", i, key;
			for (i = 0; i < num; i++) space += "   ";

			for (key in obj) {
				type = Utils.getType(obj[key]);
				if (type == "object" || type == "array") {
					str += space + "┗ " + key + "[" + type + "]\n";
					if (maxDeep > num) {
						str = __traceObject(obj[key], str, num + 1);
					}
					else {
						str += space + "   ┗ <<max deep>>\n";
					}
				}
				else if (type == "date" || type == "regexp" || type == "function" || type == "unknown" || type == "null")
					str += space + "┗ " + key + " @" + "[" + type + "]\n";
				else str += space + "┗ " + key + " @" + obj[key] + "[" + type + "]\n";
			}

			return str;
		};

		type = Utils.getType(obj);
		if (type == "object" || type == "array") str = __traceObject(obj, str + "[" + type + "]\n", 1);
		else if (type == "date" || type == "regexp" || type == "function" || type == "unknown" || type == "null") str += "[" + type + "]";
		else str += obj + "[" + type + "]";

		//console出力
		console.log(str);

		//html出力
		if (isHtml) {
			if (!$("#trace").length) {
				var __html = '<div id="trace"><div id="traceIn"></div></div>';
				$("body").prepend(__html);
				$("#trace").css({position: "fixed", top: 0, left: 0, "z-index": 0x7fffffff, background: "#fff", opacity: 0.7, color: "#333", "font-size": "10px", "text-align": "left", "font-family": "verdana, sans-serif"});
			}

			var _ui = Utils.getUserInfo();
			//互換モード:fixedが効かないとき
			if ((document.compatMode === 'BackCompat' && _ui.isIE) || _ui.isIE6) {
				$("#trace").css({position: "absolute", top: Utils.getScrollPos().y + "px", left: 0});
			}
			var __htmlt = str;
			//__htmlt = __htmlt.split('&').join("&amp;");
			__htmlt = __htmlt.split(" ").join("&nbsp;");
			__htmlt = __htmlt.split("　").join("&emsp;");
			__htmlt = __htmlt.split("<").join("&lt;");
			__htmlt = __htmlt.split(">").join("&gt;");
			__htmlt = __htmlt.split('"').join("&quot;");
			__htmlt = __htmlt.split("\n").join("<br/>");
			__htmlt = isSolo ? "<p>" + __htmlt + "</p>" : $("#traceIn").html() + "<p>" + __htmlt + "</p>";
			$("#traceIn").html(__htmlt);
		}
		;

		return str;
	};

	/**************************************************************************************
	 桁揃え：「035」みたいなのをつくる
	 */
	_Utils.numAlignment = function (p_num, p_align){
		var _str = "" + p_num;
		var _leng = _str.length;
		var _diff = p_align - _leng;
		if (_diff > 0) while (_diff--) _str = "0" + _str;
		return _str;
	};

	/**************************************************************************************
	 お値段のカンマを振る
	 */
	_Utils.addComma = function (p_int){
		if (typeof p_int === "undefined" || p_int == null) return 0;

		var v_isMinus = Boolean(p_int < 0);
		var v_str = String(p_int);
		var v_ret = "";
		var v_length = v_str.length;
		var v_count = 0;
		var v_total = Math.ceil(v_length / 3);
		var v_amari = v_length % 3;
		if (v_amari == 0) v_amari = 3;
		var v_partstr = "";

		for (var i = 0; i < v_total; i++) {
			v_partstr = "";
			if (i == 0) {
				v_partstr = v_str.slice(0, v_amari);
				v_count += v_amari;
			} else {
				v_partstr = v_str.slice(v_count, v_count + 3);
				v_count += 3;
			}
			v_ret += v_partstr + ",";
		}
		v_ret = v_ret.slice(0, v_ret.length - 1);
		if (v_isMinus) v_ret = "-" + v_ret;
		return v_ret;
	};

	/**************************************************************************************
	 QuestionParameter
	 */
	_Utils.getQuestionParam = function (p_url){
		var _hash = document.URL.indexOf("#");
		var _hashstr;
		var _url = p_url ? p_url : document.URL;

		if (_hash >= 0) {
			_hashstr = _url.slice(_hash, _url.length);
			_url = _url.replace(_hashstr, "");
		}

		var _start = _url.indexOf("?") + 1;
		if (_start <= 0) return null;
		var _arr = _start ? _url.slice(_start, _url.length).split("&") : null;

		var _leng = _arr.length;
		var _obj = {};

		for (var i = 0; i < _leng; i++) {
			var _cored = _arr[i].split("=");
			_obj[_cored[0]] = _cored[1];
		}

		return _obj;
	};

	/**************************************************************************************
	 cookie
	 */
	_Utils.cookie = {};
	_Utils.cookie.set = function (p_key, p_value, p_date){
		var _str = p_key + "=" + escape(p_value);
		if (p_date) _str += ";expires=" + p_date;
		document.cookie = _str;
	};

	_Utils.cookie.get = function (p_key){
		var _arr = document.cookie.split("; ");
		var i = _arr.length;
		var _arrs;
		while (i--) {
			_arrs = _arr[i].split("=");
			if (_arrs[0] == p_key) return unescape(_arrs[1]);
		}
	};

	_Utils.cookie.clear = function (p_key){
		document.cookie = p_key + "=" + "xx;expires=Tue, 1-Jan-1980 00:00:00;";
	};

	/**************************************************************************************
	 localStrage

	 JSONをセット
	 json2.jsが必要
	 */
	_Utils.LSConnector = function (p_name){
		var _this = this;

		if (!p_name) return false;

		_this.setValue = function (p_key, p_obj){
			var _obj = f_getJson(p_name) || {};
			_obj[p_key] = p_obj;
			f_setJson(p_name, _obj);
		};

		_this.getValue = function (p_key){
			var _obj = f_getJson(p_name) || {};
			return _obj[p_key];
		};

		_this.getAll = function (){
			var _obj = f_getJson(p_name);
			return _obj;
		};

		_this.clear = function (){
			f_clear();
		};

		_this.remove = function (){
			f_remove(p_name);
		};

		function f_setJson(key, obj){
			var str = JSON.stringify(obj);
			localStorage.setItem(key, str);
		}

		function f_getJson(key){
			var tmp = localStorage.getItem(key);
			if (!tmp) return null;
			return JSON.parse(tmp);
		}

		function f_clear(){
			localStorage.clear();
		}

		function f_remove(p_name){
			localStorage.removeItem(p_name);
		}
	};

	/**************************************************************************************
	 Image preload
	 */
	window.Preload = function (p_urls, p_callback){
		var _count = 0;
		var _leng = p_urls.length;

		var ImgPreload = function (url, callback){
			var img = new Image();
			$(img).one('load error', function (e){
				if (callback) callback();
			});
			img.src = url;
		};

		for (var i = 0; i < _leng; i++) new ImgPreload(p_urls[i], function (){
			_count++;
			if (_count >= _leng && p_callback) setTimeout(function (){
				p_callback()
			}, 100);
		});
	};

	/**************************************************************************************
	 timeStopper
	 */
	window.TimeStopper = function (){
		var _this = this;
		var _st = 0;
		var _et = 0;

		_this.time = 0;

		_this.start = function (){
			_et = _st = new Date().getTime();
		};

		_this.stop = function (){
			_et = new Date().getTime();
			_this.time = _et - _st;
		};
	};

	/**************************************************************************************
	 ajax
	 Ajax通信
	 */
	window.AjaxConnector = function (){
		this.init.apply(this, arguments);
	};
	AjaxConnector.prototype.init = function (){
		this._data = null;
	};
	AjaxConnector.prototype.connect = function (p_url, p_callback, p_dataType, p_isCache, p_method, p_data, p_callName, p_callbackName){
		var _this = this;
		var _headers = {};
		if (typeof p_dataType === "undefined" || p_dataType === null) p_dataType = null;
		if (typeof p_method === "undefined" || p_method === null) p_method = "GET";
		if (typeof p_data === "undefined" || p_data === null) p_data = "";
		if (p_dataType == "jsonp") {
			if (typeof p_callName === "undefined" || p_callName === null) p_callName = "callback";
			if (typeof p_callbackName === "undefined" || p_callbackName === null) p_callbackName = "";
		}
		if (!p_isCache && p_method.toLowerCase() == "post" && p_data) {
			p_data.timeStamp = new Date().getTime();
			_headers.pragma = "no-cache";
			_headers["Cache-Control"] = "no-cache";
		}

		$.ajax({
			type: p_method,
			url: p_url,
			dataType: p_dataType,
			cache: p_isCache,
			data: p_data,
			headers: _headers,
			jsonp: p_callName,
			jsonpCallback: p_callbackName,
			success: function (data){
				_this._data = data;
				p_callback(true);
			},
			error: function (){
				p_callback(false);
			}
		});
	};
	AjaxConnector.prototype.getData = function (){
		return this._data;
	};

	/**************************************************************************************
	 HTML load
	 */
	window.HtmlConnector = function (){
		var _this = this;
		var _data;
		_this.getData = function (){
			return _data
		};

		_this.connect = function (p_url, p_callback){
			var _ac = new AjaxConnector();
			_ac.connect(p_url, function (boo){
				if (!boo) throw new Error("指定URLはつながりませんでした @" + p_url);
				_data = f_setData(_ac.getData());
				if (p_callback) p_callback(_data);
			}, "html");
		};

		function f_setData(data){
			var __data;
			__data = data.split("\n").join("").split("\r").join("");
			//__data = '<div id="htmlResult">'+__data+'</div>';
			return __data;
		};
	};

	//Loaded
	$(function (){

	});
})(jQuery);