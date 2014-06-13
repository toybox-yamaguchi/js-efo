(function(){
	/**************************************************************************************
	EventDispatcher
	*/
	
	window.EventDispatcher = function (){};
	/**
	EventDispatcher.initialize( obj )
	オブジェクトobjに、W3C DOM3互換のイベント通知機能を追加します。
	これによりobjは、onLoad等のイベントを発行することができます。
	オブジェクトobjはこれにより、以下のプロパティと関数を装備します。
	obj.addEventListener(イベント名, リスナーオブジェ);
	obj.removeEventListener(イベント名, リスナーオブジェクト);
	obj.dispatchEvent(Eventオブジェクト);
	@param obj オブジェクト
	*/
	EventDispatcher.initialize = function(obj)
	{
		//MIX IN following property and function int obj
		//be careful about Name Scape Corrision just for incase
		obj._eventContainer = new Object();
		obj.addEventListener = this._addEventListener;
		obj.removeEventListener = this._removeEventListener;
		obj.dispatchEvent = this._dispatchEvent;
	};
	
	/*
	CAUTION INTERNAL OBJECT do not call it directory from EventDispatcher
	refered from targetObject.addEventListener()
	*/
	EventDispatcher._addEventListener = function(eventName, object)
	{
		//CAUTION
		//third param is not implemented yet
		//CAUTION:
		//scope of this object is always "TARGET" OBJECT, not EventDispatcher
		if( this._eventContainer[eventName]==null){
			this._eventContainer[eventName]=new Array();
		};
		this.removeEventListener(eventName, object);
		this._eventContainer[eventName].push(object); //register object
	};
	
	/*
	CAUTION INTERNAL OBJECT do not call it directory from EventDispatcher
	refered from targetObject.removeEventListener()
	*/
	EventDispatcher._removeEventListener = function(eventName, object)
	{
		//CAUTION:
		//scope of this object is always "TARGET" OBJECT, not EventDispatcher
		var listener_ar = this._eventContainer[eventName];
		if(listener_ar == undefined) return;
		
		var imax = listener_ar.length;
		for(var i=0;i<imax;i++)
		{
			var listener = listener_ar[i];
			if(listener==object)
			{
				listener_ar.splice(i,1);
				return;
			};
		};
	};
	
	/*
	CAUTION INTERNAL OBJECT do not call it directory from EventDispatcher
	refered from targetObject.dispatchEvent()
	eventObj : {type:イベント名, target:this}
	*/
	EventDispatcher._dispatchEvent = function(eventObj)
	{
		//CAUTION:
		//scope of this object is always "TARGET" OBJECT,not EventDispatcher
		if(eventObj.target==null) eventObj.target = this;
		
		var eventName = eventObj.type;
		if( this._eventContainer[eventName]==null) return;
		
		var imax = this._eventContainer[eventName].length;
		
		for(var i=0;i<imax;i++)
		{
			var listener = this._eventContainer[eventName][i];
			if(typeof(listener)=="object"){
				listener[eventName].apply(listener, new Array(eventObj));
			}else{
				listener(eventObj);
			};
		};
	};
	
	window.events = function(){};
	EventDispatcher.initialize(window.events);
	
	/**************************************************************************************
	RotateEventer
	IOSとorientationなしの回転イベントの埋め合わせロジック
	*/
	var RotateEventer = function()
	{
		var _this = this;
		var _id;
		var _isAndroid = navigator.userAgent.search(/Android/)!=-1;
		var _isIOS = navigator.userAgent.search(/iPhone/)!=-1 || navigator.userAgent.search(/iPad/)!=-1 || navigator.userAgent.search(/iPod/)!=-1
		if(_isAndroid || _isIOS) f_init();
		function f_init()
		{
			window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', f_onOrientationChange, false);
		};
		
		function f_onOrientationChange(e)
		{
			clearTimeout(_id);
			_id = setTimeout(f_dispatch, _isAndroid ? 1500:100);
		};
		
		function f_dispatch()
		{
			var _e;
			if(document.createEvent) _e = document.createEvent("Events").initEvent("onOrientation", true, true);
			else _e = {type:"onOrientation"};
			window.events.dispatchEvent(_e);
		}
		
		this.dispose = function()
		{
			window.removeEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', f_onOrientationChange, false);
		};
	};
	
	window.events._rotateEventer = new RotateEventer();
})();