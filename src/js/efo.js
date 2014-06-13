/*! Japanese input change plugin for jQuery.
 https://github.com/hnakamur/jquery.japanese-input-change
 (c) 2014 Hiroaki Nakamura
 MIT License
 */
(function($, undefined) {
  $.fn.japaneseInputChange = function(selector, delay, handler) {
    var readyToSetTimer = true,
      isFirefox = navigator.userAgent.indexOf('Firefox') != -1,
      oldVal,
      timer,
      callHandler = function(e) {
        var $el = $(e.target), val = $el.val();
        if (val != oldVal) {
          handler.call($el, e);
          oldVal = val;
        }
      },
      clearTimer = function() {
        if (timer !== undefined) {
          clearTimeout(timer);
          timer = undefined;
        }
      };

    if (handler === undefined) {
      handler = delay;
      delay = selector;
      selector = null;
    }

    return this.on('focus', selector, function(e) {
      oldVal = $(e.target).val();
      readyToSetTimer = true;
    })
      .on('blur', selector, function(e) {
        clearTimer();
        callHandler(e);
      })
      .on('keyup', selector, function(e) {
        clearTimer();

        // When Enter is pressed, IME commits text.
        if (e.which == 13 || isFirefox) {
          readyToSetTimer = true;
        }

        // Set timer only when IME does not have uncommitted text.
        if (readyToSetTimer) {
          timer = setTimeout(function() {
            // Check readyToSetTimer again here for the scenario below.
            // 1. The user change the text.
            // 2. The timer is set.
            // 3. The user presses keys and IME has some uncommitted text.
            //    before timer fires.
            if (readyToSetTimer) {
              callHandler(e);
            }
          }, delay);
        }
      })
      .on('keydown', selector, function(e) {
        if (isFirefox) {
          // Firefox fires keydown for the first key, does not fire
          // keydown nor keyup event during IME has uncommitted text,
          // fires keyup when IME commits or deletes all uncommitted text.
          readyToSetTimer = false;
        } else {
          // IE, Chrome and Safari fires events with e.which = 229 for
          // every keydown during IME has uncommitted text.
          // Note:
          // For IE, Chrome and Safari, I cannot detect the moment when
          // you delete all uncommitted text with pressing ESC or Backspace
          // appropriate times, so readyToSetTimer remains false at the moment.
          //
          // However, it is not a problem. Because the text becomes same
          // as oldVal at the moment, we does not invoke handler anyway.
          //
          // Next time key is pressed and if it causes text to change,
          // keydown with e.which != 229 occurs, readyToSetTimer becomes
          // true and handler will be invoked.
          readyToSetTimer = (e.which != 229);
        }
      });
  };
}(jQuery));

(function ($, undefined){
  /*
   *EFO 1.0.2
   * */
  window.Efo = function (){
    this.init.apply(this, arguments);
  };
  Efo.events = {
    EFO_AUTOADD_COMPLETE : "EFO_AUTOADD_COMPLETE",
    EFO_NODE_FOCUS : "EFO_NODE_FOCUS",
    EFO_NODE_BLUR : "EFO_NODE_BLUR",
    EFO_NODE_ANALYSIS_COMPLETE : "EFO_NODE_ANALYSIS_COMPLETE",
    EFO_ANALYSIS_COMPLETE : "EFO_ANALYSIS_COMPLETE"
  };
  Efo.attrNames = {
    EFO_ATTR_KEY : "data-efokey",
    EFO_ATTR_FUNCS : "data-efofuncs"
  };
  Efo.classNames = {
    EFO_ATTR_SERVER_ERROR:"efo-serverError",//サーバー側でエラーが有った場合、bodyにefo-serverErrorがつく想定
    EFO_ATTR_ICON : "efo-icon",
    EFO_ATTR_ERROR : "efo-error"
  };
  Efo.options = {
    EFO_IS_DEPEND_DISPLAY:"data-isDependDisplay",
    EFO_IS_AUTO_ADD:"data-isAutoAdd"
  };
  Efo.prototype.init = function (){
    var _this = this;
    var _inputs = $("input ,select, textarea");
    var _count = 0;
    var _isAllcrawl = true;
    var _ui = Utils.getUserInfo();
    var _time = _ui.isAndroid ? 1000 : 500;//項目自動入力されるまでの待機時間

    _this.nodes = [];
    _this.efofuncs = new EfoAnalysis();
    _this.isBodyEfoError;
    _this.analysis = analysis;
    _this.addNode = addNode;
    _this.crawlAnalysis = crawlAnalysis;
    _this.removeNodeByNum = removeNodeByNum;
    _this.removeNodeByKey = removeNodeByKey;
    _this.dispose = dispose;
    _this.autoAddNode = autoAddNode;

    EventDispatcher.initialize(_this);//イベント機能実装
    init();

    function init(){
      var regexp = new RegExp(Efo.classNames.EFO_ATTR_SERVER_ERROR);
      _this.isBodyEfoError = !!(($("body").attr("class") + "").search(regexp) >= 0);
      setTimeout(function (){
        autoAddNode();
      }, _time);
    }

    //ノード解析終了コールバック
    function onAnalyzeCallback(efonode){
      _this.dispatchEvent({type: Efo.events.EFO_NODE_ANALYSIS_COMPLETE, isClear: efonode.isClear, errorStrs: efonode.errorStrs, node: efonode});
      //クロールしてからanalysisする
      if (_isAllcrawl) {
        _count++;
        if (_count >= _this.nodes.length) {
          _count = 0;
          _this.analysis();
          _isAllcrawl = false;
        }
      }
      else {
        _this.analysis();
      }
    }

    //追加
    function addNode(efokey){
      _inputs = $("input ,select, textarea");
      var _node;
      var _keys = _inputs.filter('['+Efo.attrNames.EFO_ATTR_KEY+'="' + efokey + '"]['+Efo.attrNames.EFO_ATTR_FUNCS+']');
      _keys.each(function (i, value){
        _node = _addNode(value);
      });
      return _node;
    }

    //自動追加
    function autoAddNode(){
      _inputs = $("input ,select, textarea");
      var _keys = _inputs.filter("["+Efo.attrNames.EFO_ATTR_KEY+"]["+Efo.attrNames.EFO_ATTR_FUNCS+"]:not(["+Efo.options.EFO_IS_AUTO_ADD+"='false'])");
      var _node;
      _keys.each(function (i, value){
        _node = _addNode(value);
      });
      _this.dispatchEvent({type: Efo.events.EFO_AUTOADD_COMPLETE});
    }

    function _addNode(value, is){
      var _funcsStr = $(value).attr(Efo.attrNames.EFO_ATTR_FUNCS);
      var _funcs = _funcsStr.split(" ");
      var _key = $(value).attr(Efo.attrNames.EFO_ATTR_KEY);
      var _nodeInputs = _inputs.filter('['+Efo.attrNames.EFO_ATTR_KEY+'="' + _key + '"]');
      var _isDependDisplay = $(value).attr(Efo.options.EFO_IS_DEPEND_DISPLAY);//非表示で走査しないかどうか：表示で走査に影響を与えるかどうか

      if(_isDependDisplay == undefined){
        _isDependDisplay = true;
      }
      else{
        _isDependDisplay = !!_isDependDisplay;
      }

      var _nodeInfo = {key: _key, funcs: _funcs, inputs: _nodeInputs, isDependDisplay: _isDependDisplay};
      var _is = !!is;//初期状態
      var _node;
      if (!_funcs[0] == "") {
        Utils.trace("add @" + _key);
        _node = new EfoNode(_nodeInfo, _is, onAnalyzeCallback);
        _this.nodes.push(_node);
        return _node;
      }
      else return new Error("no funcs");
    }

    function analysis(){
      var _isClear = true;
      var _nodeData = [];
      var _falseNum = 0;
      $.each(_this.nodes, function (i, value){
        //表示の可否
        var _isDisplay = true;
        var _tgt = value.inputs.filter("["+Efo.attrNames.EFO_ATTR_FUNCS+"]");
        if (value.isDependDisplay) {
          _tgt.parents().each(function (i, value){
            _isDisplay = !!!($(value).css("display") == "none");
            if (!_isDisplay) return false;
          });
        }
        if (_isDisplay) _nodeData.push(value);
        if (!value.isClear && _isDisplay) {
          _isClear = false;
          _falseNum++;
        }
      });

      //イベント発信
      _this.dispatchEvent({type: Efo.events.EFO_ANALYSIS_COMPLETE, isClear: _isClear, data: {nodes: _nodeData, total: _nodeData.length, failed: _falseNum}});
    }

    /*
     手動全解析
     isErrorOutput		エラー出力するかどうか
     */
    function crawlAnalysis(isErrorOutput){
      isErrorOutput = !!isErrorOutput;
      _isAllcrawl = true;
      $.each(_this.nodes, function (i, value){
        value.analysis(isErrorOutput);
      });
    }

    /*
     消去：番号
     */
    function removeNodeByNum(num){
      _this.nodes[num].dispose();
      //_this.views[num].removeEventListener("onHaveSubQChange", _this.f_onHaveSubQChange);
      _this.nodes.splice(num, 1);
    }

    /*
     消去：key
     */
    function removeNodeByKey(key){
      var _this = this;
      $.each(_this.nodes, function (i, value){
        if (nodes.key == key) {
          _this.nodes[i].dispose();
          _this.nodes.splice(i, 1);
          return false;
        }
      });
    }

    /*
     */
    function dispose(){
      $.each(_this.nodes, function (i, value){
        value.dispose();
      });
    }
  };

  var EfoNode = function (){
    this.init.apply(this, arguments);
  };
  /*
   * nodeInfo      node情報
   * is            初期状態
   * callback      コールバックファンクション
   * */
  EfoNode.prototype.init = function (nodeInfo, is, callback){
    var _this = this;
    var _count = 0;
    var _ana = window.efo.efofuncs;
    var _errorStrNode;
    _this.funcs = nodeInfo.funcs;
    _this.inputs = nodeInfo.inputs;
    _this.key = nodeInfo.key;
    _this.isDependDisplay = nodeInfo.isDependDisplay;
    _this.options = nodeInfo.options;
    _this.errorStrs = [];
    _this.errorNode = $("."+Efo.classNames.EFO_ATTR_ERROR+'['+Efo.attrNames.EFO_ATTR_KEY+'="' + _this.key + '"]');
    if (_this.errorNode) _errorStrNode = _this.errorNode.find(".efo-errorString");
    _this.iconNode = $("."+Efo.classNames.EFO_ATTR_ICON+'['+Efo.attrNames.EFO_ATTR_KEY+'="' + _this.key + '"]');
    _this.analysis = analysis;
    _this.dispose = dispose;

    EventDispatcher.initialize(_this);
    window.efo.addEventListener(Efo.events.EFO_AUTOADD_COMPLETE, onAutoAddComplete);
    setTrigger();

    function onAutoAddComplete(){
      if(!window.efo.isBodyEfoError){
        _this.analysis(false);
      }
      else{
        //サーバーエラーの場合走査しない。Viewの状態もままにする。
      }
    }

    /*
     イベントトリガー
     */
    function setTrigger(){
      var _tgt;
      var _tagName;
      var _type;
      var _interval = 500;
      _this.inputs.each(function (){
        _tgt = $(this);
        _type = "";
        _tagName = _tgt.get(0).tagName.toLowerCase();
        if (_tagName == "input") {
          _type = _tgt.attr("type");
          if (_type == "text" || _type == "password") {
            _tgt.unbind("blur", onInputComplete).blur(onInputComplete);
            _tgt.unbind().japaneseInputChange(_interval, onInputComplete);
            //_tgt.unbind("keyup", onkey).bind("keyup", onkey);
            _tgt.unbind("click", onInputComplete).click(onInputComplete);
          }
          else if (_type == "checkbox" || _type == "radio") {
            _tgt.unbind("change", onInputComplete).change(onInputComplete);
          }
        }
        else if (_tagName == "select") {
          _tgt.unbind("change", onInputComplete).change(onInputComplete);
        }
        else if (_tagName == "textarea") {
          _tgt.unbind("blur", onInputComplete).blur(onInputComplete);
          //_tgt.unbind("keyup", onkey).bind("keyup", onkey);
          _tgt.unbind().japaneseInputChange(_interval, onInputComplete);
          _tgt.unbind("click", onInputComplete).click(onInputComplete);
        }

        _tgt.unbind("focus", onFocus).focus(onFocus);
        _tgt.unbind("blur", onBlur).blur(onBlur);
      });
    }
    /*
    * 変換系かどうか
    * */
    function hasTransleteFunc(){
      var _isTranslate = false;
      $.each(_this.funcs, function(i, value){
        if(value === "toZenkakuKK" || value === "toHankakuEisu"){
          _isTranslate = true;
          return false;
        }
      });
      return _isTranslate;
    }

    //入力終わり
    function onInputComplete(e){
      analysis(true);
    }

    function onFocus(e){
      _this.inputs.removeClass("efo-inputError").removeClass("efo-inputFocus").addClass("efo-inputFocus");
      //_this.dispatchEvent({type:Efo.events.EFO_NODE_FOCUS, node:_this});
    }

    function onBlur(e){
      _this.inputs.removeClass("efo-inputFocus");
      //_this.dispatchEvent({type:Efo.events.EFO_NODE_BLUR, node:_this});
    }

    /*
     解析
     isErrorOutput		エラー出力するかどうか
     */
    function analysis(isErrorOutput){
      if(isErrorOutput == undefined) isErrorOutput = true;
      isErrorOutput = !!isErrorOutput;
      _count = 0;
      _this.errorStrs = [];
      _this.isClear = true;
      var _num;
      $.each(_this.funcs, function (i, value){
        //funcの振り分け
        var _funcName;
        var _num;
        if (value.search(/[0-9]+$/) > 0) {
          _funcName = value.replace(/[0-9]+$/, "");
          _num = value.match(/[0-9]+$/) * 1;
          _ana[_funcName](_this.inputs, anaComplete, _num);
        }
        else if (value.length) _ana[value](_this.inputs, anaComplete);
        else anaComplete();
      });

      //解析終了
      function anaComplete(is, errs){
        _count++;
        if (!is) {
          _this.isClear = false;
          if (errs.length > 0 && isErrorOutput) {
            $.each(errs, function (i, value){
              _this.errorStrs.push(value);
            });
          }
        }
        if (_count >= _this.funcs.length) {
          changeIconProperty();
          changeInputsProperty(isErrorOutput);
          if (isErrorOutput){
            repetitionAna();
            changeErrorProperty();
            setErrorString();
          }
          if (callback) callback(_this);
        }
      }
    }

    //Input要素の変化
    function changeInputsProperty(isErrorOutput){
      isErrorOutput = !!isErrorOutput;
      _this.inputs.removeClass("efo-inputError");
      if (!_this.isClear && isErrorOutput) _this.inputs.addClass("efo-inputError");
    }

    //アイコン要素の変化
    function changeIconProperty(){
      if (!_this.iconNode.length) return;
      _this.iconNode.removeClass("efo-iconTrue").removeClass("efo-iconFalse");
      if (_this.isClear) {
        _this.iconNode.addClass("efo-iconTrue");
      }
      else {
        _this.iconNode.addClass("efo-iconFalse");
      }
    }

    //エラー要素の変化
    function changeErrorProperty(){
      if (!_this.errorNode.length) return;
      _this.errorNode.removeClass("efo-error");
      if (!_this.isClear) {
        _this.errorNode.addClass("efo-error");
      }
    }

    //エラー文言の変化
    function setErrorString(){
      if (!_errorStrNode) return;
      var _errtext = "";
      if (!_this.isClear) {
        $.each(_this.errorStrs, function (i, value){
          if (i == 0) _errtext += value;
          else _errtext += "</br>" + value;
        });
      }
      _errorStrNode.html(_errtext);
    }

    //再帰：エラー文言の被りを修正
    function repetitionAna(){
      var _leng = _this.errorStrs.length;
      var _is = false;
      $.each(_this.errorStrs, function (i, value){
        for (var j = 0; j < _leng; j++) {
          if (i == j) continue;
          if (value == _this.errorStrs[j]) {
            _this.errorStrs.splice(j, 1);
            _is = true;
            return false;
          }
        }
      });
      if (_is) repetitionAna();
    }

    /*
     消
     */
    function dispose(){
      var _this = this;
      _this.inputs.unbind("change", onInputComplete).unbind("blur", onInputComplete);
      window.efo.removeEventListener(Efo.events.EFO_AUTOADD_COMPLETE, onAutoAddComplete);
    }
  };

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   EfoAnalysis
   入力解析
   */
  var EfoAnalysis = function (){
    this.init.apply(this, arguments);
  };
  EfoAnalysis.prototype.init = function (){
    var _this = this;
    _this.errmsg = new EfoErrorMessage();
  };

  /*
   必須チェック
   */
  EfoAnalysis.prototype.isInput = function (input, callback){
    var _this = this;
    var _tgt;
    var _tagName;
    var _type;
    var _is = false;

    input.each(function (i){
      _tgt = $(this);
      _tagName = _tgt.get(0).tagName.toLowerCase();
      if (_tagName == "input") {
        _type = _tgt.attr("type");
        if (_type == "text" || _type == "password") {
          _is = !!(_tgt.val().length > 0);
          if (_is) return false;
        }
        else if (_type == "checkbox" || _type == "radio") {
          _is = _tgt.is(":checked");
          if (_is) return false;
        }
      }
      //selectbox
      else if (_tagName == "select") {
        _is = !!(_tgt.find("option:selected").val().length);
        if (_is) return false;
      }
    });

    if (_type == "text" || _type == "password") callback(_is, [_this.errmsg.noInput]);
    else callback(_is, [_this.errmsg.noSelect]);
  };
  /*
   メールアドレス
   */
  EfoAnalysis.prototype.mailAddress = function (input, callback){
    var _this = this;
    var _errs = [];
    var _value = input.eq(0).val();
    //if(_value.length == 0) _errs.push(_this.errmsg.noInput);
    var _is1 = !!(_value.search(/^[\.a-zA-Z0-9_\-]+@([a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9][a-zA-Z0-9\-][a-zA-Z0-9]*$/) != -1);
    if (!_is1) _errs.push(_this.errmsg.noMailAddress);
    if (_value.length == 0) _is1 = true;
    callback(_is1, _errs);
  };
  /*
   メールアドレス2項目共通
   */
  EfoAnalysis.prototype.mailAddressTwo = function (input, callback){
    var _this = this;
    _this.mailAddress(input.eq(0), function (is, errs){
      if (!is) callback(false, errs);
      else if (input.eq(0).val() !== input.eq(1).val()) callback(false, [_this.errmsg.noMatchMailAddress2]);
      else callback(true, errs);
    });
  };
  /*
   パスワード
   */
  EfoAnalysis.prototype.password = function (input, callback){
    var _this = this;
    var _value = input.eq(0).val();
    var _errs = [];
    var _leng = _value.length;
    var _is2 = !!(_value.match(/[^0-9A-Za-z@_\-]+/) == null);
    var _is3 = !!(_leng >= 6 && _leng <= 15);
    if (_leng == 0) _is3 = true;//何も入っていなければ通す
    if (!_is2) _errs.push(_this.errmsg.noUseCodePassword);
    if (!_is3) _errs.push(_this.errmsg.noCountInPassword);
    callback(!!(_is2 && _is3), _errs);
  };
  /*
   パスワード：2項目見る
   */
  EfoAnalysis.prototype.passwordTwo = function (input, callback){
    var _this = this;
    var _value = input.eq(0).val();
    var _errs = [];
    var _leng = _value.length;
    var _leng2 = input.eq(1).val().length;
    var _is1 = !!(_value == input.eq(1).val());
    var _is2 = !!(_value.match(/[^0-9A-Za-z@_\-]+/) == null);
    var _is3 = !!(_leng >= 6 && _leng <= 15 && _leng2 >= 6 && _leng2 <= 15);
    if (_leng == 0 && _leng2 == 0) {
      //何も入っていなければ通す
      callback(true);
      return;
    }
    if (!_is1) _errs.push(_this.errmsg.noMatchPassword2);
    if (!_is2) _errs.push(_this.errmsg.noUseCodePassword);
    if (!_is3) _errs.push(_this.errmsg.noCountInPassword);

    callback(!!(_is1 && _is2 && _is3), _errs);
  };
  /*
   チェックボックス上限
   */
  EfoAnalysis.prototype.checkboxLess = function (input, callback, num){
    var _this = this;
    var _is = true;
    var _co = 0;
    input.each(function (i, value){
      if ($(this).is(":checked")) _co++;
    });
    if (_co > num) _is = false;
    callback(_is, [num + _this.errmsg.checkboxLessNum]);
  };
  /*
   チェックボックス下限
   */
  EfoAnalysis.prototype.checkboxOver = function (input, callback, num){
    var _this = this;
    var _is = true;
    var _co = 0;
    input.each(function (i, value){
      if ($(this).is(":checked")) _co++;
    });
    if (_co < num) _is = false;
    if (_co == 0) _is = true;
    callback(_is, [num + _this.errmsg.checkboxOverNum]);
  };
  /*
   X文字以内入力
   */
  EfoAnalysis.prototype.countLess = function (input, callback, num){
    var _this = this;
    var _is = true;
    var _erStr = (num + "") + _this.errmsg.noCountLessNum;
    input.each(function (){
      var _leng = $(this).val().length;
      _is = !!(_leng <= num * 1);
      if (!_is) {
        _erStr = _leng - num * 1 + "文字オーバーしています。" + _erStr;
        return false;
      }
    });
    callback(_is, [_erStr]);
  };
  /*
   X文字以上入力
   */
  EfoAnalysis.prototype.countOver = function (input, callback, num){
    var _this = this;
    var _is = true;
    var _erStr = (num + "") + _this.errmsg.noCountOverNum;
    input.each(function (){
      var _leng = $(this).val().length;
      _is = !!!(_leng < num * 1 && _leng > 0);
      if (!_is) {
        _erStr = num * 1 - _leng + "文字不足しています。" + _erStr;
        return false;
      }
    });
    callback(_is, [_erStr]);
  };
  /*
   整数下限
   */
  EfoAnalysis.prototype.checkIntOver = function (input, callback, num){
    var _this = this;
    var _value = input.eq(0).val();
    if (_value.length == 0) callback(true);
    else if (_value.match(/[^0-9]/) !== null) callback(false, [_this.errmsg.noNumber]);
    else {
      if (_value * 1 < num) callback(false, [num + _this.errmsg.checkOverInt]);
      else callback(true);
    }
  };
  /*
   整数上限
   */
  EfoAnalysis.prototype.checkIntLess = function (input, callback, num){
    var _this = this;
    var _value = input.eq(0).val();
    if (_value.length == 0) callback(true);
    else if (_value.match(/[^0-9]/) !== null) callback(false, [_this.errmsg.noNumber]);
    else {
      if (_value * 1 > num) callback(false, [num + _this.errmsg.checkLessInt]);
      else callback(true);
    }
  };
  /*
   小数点第X位で切り捨て
   */
  EfoAnalysis.prototype._decimalRev = function (num, point){

  };
  /*
   数字下限
   */
  EfoAnalysis.prototype.checkNumOver = function (input, callback, num){
    var _this = this;
    var _value = input.eq(0).val();
    if (_value.length == 0) callback(true);
    else if (_value.match(/[^0-9.]/) !== null) callback(false, [_this.errmsg.noNumber]);
    else {
      if (_value * 1 < num) callback(false, [num + _this.errmsg.checkOverNum]);
      else callback(true);
    }
  };
  /*
   数字上限
   */
  EfoAnalysis.prototype.checkNumLess = function (input, callback, num){
    var _this = this;
    var _value = input.eq(0).val();
    if (_value.length == 0) callback(true);
    else if (_value.match(/[^0-9.]/) !== null) callback(false, [_this.errmsg.noNumber]);
    else {
      if (_value * 1 > num) callback(false, [num + _this.errmsg.checkLessNum]);
      else callback(true);
    }
  };
  /*
   生年月日
   */
  EfoAnalysis.prototype.birthday = function (input, callback){
    var _this = this;
    var _year = input.eq(0).val();
    var _err = [];
    var _dateObj = new Date().getObject();
    var _date = (_dateObj.year + "" + _dateObj.month + "" + _dateObj.day + "") * 1;
    var _inputDate = (_year + "" + Utils.numAlignment(input.eq(1).val(), 2) + "" + Utils.numAlignment(input.eq(2).val(), 2)) * 1;
    var _isY1 = !!(_year.match(/[^0-9]/) == null && _date >= _inputDate);//西暦
    var _isY2 = !!(_year * 1 >= 1900);//年数下限
    var _month = input.eq(1).find("option:selected").val() * 1;
    var _day = input.eq(2).find("option:selected").val() * 1;
    var _is = !!(_isY1 && _isY2 && _month > 0 && _day > 0);

    //30日で終わる月
    if (_day > 30 && (_month == 4 || _month == 6 || _month == 9 || _month == 11)) _is = false;
    //うるう年
    if (_month == 2 && _day == 29 && _year % 4 == 0) {
    }
    else if (_month == 2 && _day > 28) _is = false;
    if (_year.length == 0 && _month == 0 && _day == 0) _is = true;
    //error
    if (_isY1 && !_isY2) _err.push(_this.errmsg.noBirthDay_before);
    else if (!_is) _err.push(_this.errmsg.noBirthDay);

    callback(_is, _err);
  };
  /*
   住所
   3桁-4桁
   */
  EfoAnalysis.prototype.zip = function (input, callback){
    var _this = this;
    var _val1 = input.eq(0).val();
    var _val2 = input.eq(1).val();
    var _is1 = !!(_val1.length == 3 && _val1.match(/[^0-9]/) == null);
    var _is2 = !!(_val2.length == 4 && _val2.match(/[^0-9]/) == null);
    var _is = !!(_is1 && _is2);
    if (_val1.length == 0 && _val2.length == 0) _is = true;
    callback(_is, [_this.errmsg.noZip]);
  };
  /*
   電話番号
   合計10桁以上11桁以内
   */
  EfoAnalysis.prototype.telephone = function (input, callback){
    var _this = this;
    var _value = input.eq(0).val() + input.eq(1).val() + input.eq(2).val();
    var _is = !!(_value.length >= 10 && _value.length <= 11 && _value.match(/[^0-9]/) == null);
    if (_value.length == 0) _is = true;
    callback(_is, [_this.errmsg.noTelephone]);
  };
  /*
   携帯電話番号
   合計11桁
   */
  EfoAnalysis.prototype.mobilephone = function (input, callback){
    var _this = this;
    var _value = input.eq(0).val() + input.eq(1).val() + input.eq(2).val();
    var _is = !!(_value.length == 11 && _value.match(/[^0-9]/) == null);
    if (_value.length == 0) _is = true;
    callback(_is, [_this.errmsg.noTelephone]);
  };
  /*
   氏名欄
   合計9文字以下
   */
  EfoAnalysis.prototype.name = function (input, callback){
    var _this = this;
    var _errs = [];
    var _val1 = input.eq(0).val();
    var _val2 = input.eq(1).val();
    var _is = !!((_val1.length + _val2.length) <= 9);
    if (!_is) _errs.push(_this.errmsg.noNameCountIn);
    callback(!!_is, _errs);
  };
  /*
   規約の同意
   */
  EfoAnalysis.prototype.isKiyaku = function (input, callback){
    var _this = this;
    var _is = false;
    _is = input.is(":checked");
    callback(_is, [_this.errmsg.noKiyakuAgree]);
  };
  /*
   半角英数
   */
  EfoAnalysis.prototype.isHankakuEisu = function (input, callback){
    var _this = this;
    var _val;
    var _is = true;
    input.each(function (i, value){
      _val = $(this).val();
      if (_val !== "" && !_val.match(/^[a-zA-Z0-9 ]+$/)) _is = false;
      if (!_is) return false;
    });
    callback(_is, [_this.errmsg.noHankakuEisu]);
  };
  /*
   半角英数記号
   */
  EfoAnalysis.prototype.isHankakuEisuKigou = function (input, callback){
    var _this = this;
    var _val;
    var _is = true;
    input.each(function (i, value){
      _val = $(this).val();
      if (_val !== "" && !_val.match(/^[a-zA-Z0-9 -\/:-@\[-\`\{-\~]+$/)) _is = false;
      if (!_is) return false;
    });
    callback(_is, [_this.errmsg.noHankakuEisuKigou]);
  };
  /*
   半角→全角：fhconvert.js使用：unicode前提

   EfoAnalysis.prototype.hankakuToZenkaku = function(input, callback)
   {
   input.val(FHConvert.htof(input.val(),{jaCode:true}));
   callback(true);
   };*/
  /*
   半角英数変換：fhconvert.js使用：unicode前提
   */
  EfoAnalysis.prototype.toHankakuEisu = function (input, callback){
    var _this = this;
    input.each(function (i, value){
      input.val(FHConvert.ftoh(input.val(), {jaCode: true, space: true}));
    });
    callback(true);
  };
  /*
   全角カタカナ変換：fhconvert.js使用：unicode前提
   */
  EfoAnalysis.prototype.toZenkakuKK = function (input, callback){
    var _this = this;
    input.each(function (i, value){
      input.val(FHConvert.hkktofkk(FHConvert.hgtokk(input.val())));
    });
    callback(true);
  };
  /*
   test
   */
  EfoAnalysis.prototype.test = function (input, callback){
    var _this = this;
    var _is = true;
    callback(_is);
  };

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   EfoErrorMessage
   エラー文言
   */
  var EfoErrorMessage = function (){
    this.init.apply(this, arguments);
  };
  EfoErrorMessage.prototype.init = function (){
    var _this = this;

    _this.noInput = "項目に入力してください。";
    _this.noSelect = "項目から選択してください。";
    _this.noMailAddress = "正しいメールアドレスを入力してください。";
    _this.noMatchMailAddress2 = "確認メールアドレスと不一致です。";
    _this.noMatchPassword2 = "確認パスワードと不一致です。";
    _this.noUseCodePassword = "半角英数字、@ _ - 以外の文字が入力されています。";
    _this.noCountInPassword = "半角英数字6〜15文字で入力してください。";
    _this.noUseCode = "< > ; の記号は半角/全角ともに使用できません。";
    _this.noBirthDay = "生年月日を正しく入力してください。";
    _this.noBirthDay_before = "西暦1900年以降の日付を入力してください。";
    _this.checkboxLessNum = "個以内で選択してください。";
    _this.checkboxOverNum = "個以上で選択してください。";
    _this.noNumber = "半角数字を入力してください。";
    _this.checkLessInt = "以下の整数を入力してください。";
    _this.checkOverInt = "以上の整数を入力してください。";
    _this.checkLessNum = "以下を入力してください。";
    _this.checkOverNum = "以上を入力してください。";
    _this.noCountOverNum = "文字以上で入力してください。";
    _this.noCountLessNum = "文字以内で入力してください。";
    _this.noNameCountIn = "姓名合わせて9文字以内で入力してください。";
    _this.noZip = "正しい郵便番号を入力してください。";
    _this.noTelephone = "正しい電話番号を入力してください。";
    _this.noKiyakuAgree = "規約への同意が必要です。";
    _this.noHankakuEisu = "半角英数字を入力してください。";
    _this.noHankakuEisuKigou = "半角英数字、半角記号を入力してください。";
  };

  //Loaded
  $(function (){
    window.efo = new Efo();

    window.efo.addEventListener(Efo.events.EFO_AUTOADD_COMPLETE, onEfoAutoAddComplete);
    window.efo.addEventListener(Efo.events.EFO_NODE_ANALYSIS_COMPLETE, onEfoNodeAnalysisComplete);
    window.efo.addEventListener(Efo.events.EFO_ANALYSIS_COMPLETE, onEfoAnalysisComplete);

    //EnterKey無効
    $('input').keypress(function (e){
      if((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
        return false;
      } else {
        return true;
      }
    });

    //EFO自動追加終了イベント
    function onEfoAutoAddComplete(e){
      //Utils.trace("EFO_AUTOADD_COMPLETE");
    }

    //EFOノード別終了イベント
    function onEfoNodeAnalysisComplete(e){
      //Utils.trace("EFO_NODE_ANALYSIS_COMPLETE");
      //Utils.trace(e, false, false, 1);
      changeIconProperty(e.node.iconNode, e.isClear);
    }

    //EFOノード終了イベント
    function onEfoAnalysisComplete(e){
      //Utils.trace("EFO_ANALYSIS_COMPLETE ->" + e.isClear);
      //Utils.trace(e, false, false, 2);

      //決定ボタン
      var _submit = $('input[type="submit"]');
      _submit.removeAttr("disabled");
      if (!e.isClear) _submit.attr("disabled", "");
    }

    //アイコン変化
    function changeIconProperty(icon, isClear){
      if (!icon.length) return;
      if (isClear) {
        icon.text("OK");
      }
      else {
        icon.text("必須");
      }
    }

    /*
     カスタム解析ファンクション
     window.efo.efofuncsにファンクションをぶら下げる。
     ファンクション名がそのままefofuncsの名前になる。

     efofuncsにtest200と数字がおしりにいる場合
     200がnumで入り、定義すべきファンクション名はtestになる

     inputs			入力要素群
     callback		解析終了結果を伝えるコールバックファンクション
     */

    window.efo.efofuncs.test = function (inputs, callback, num){
      var _is = true;
      var _errArr = [];
      inputs.each(function (){
        //$(this).val();
      });

      //callback(Boolean,Array);
      //成功かどうかのBoolean、エラー文言の配列
      callback(_is, _arrArr);
    };
  });
})(jQuery);