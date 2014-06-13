(function($){
	var _Calcs = {};
	window.Calcs = _Calcs;

	/**************************************************************************************
	 random
	 */
	/**
	 * 平方根ランダム：0に近づくにつれ、出現度が減る。「／」のように直線状。(0<=n<1)
	 */
	_Calcs.randomSqrt = function()
	{
		return Math.sqrt(Math.random());
	};

	/**
	 * 4平方根ランダム：0に近づくにつれ、出現度が減る。「ノ」のように坂状になる。(0<=n<1)
	 * @return
	 */
	_Calcs.randomSqrt4 = function()
	{
		return Math.sqrt(Math.sqrt(Math.random()));
	};

	/**
	 * 変形4平方ランダム：任意の偏りを実現。(0<=n<1)
	 */
	_Calcs.randomTrans4 = function(p_balance, p_velvet)
	{
		var __ans;
		var __sqrtFunctionY;
		var __reBalance;
		var __x;
		__x = Math.random();
		if (__x < p_balance)
		{
			__sqrtFunctionY = Math.sqrt(Math.sqrt(__x / p_balance)) * p_balance;
		}else{
			__reBalance = 1 - p_balance;
			__sqrtFunctionY = - Math.sqrt(Math.sqrt((1 - __x) / __reBalance)) * __reBalance + 1;
		}
		__ans = __sqrtFunctionY * (1 - p_velvet) + __x * p_velvet;
		return __ans;
	};

	/**
	 * 指定範囲のランダムな数値を吐く(min<=n<max)
	 * @param	p_min		最小値
	 * @param	p_max		最大値
	 * @return	int
	 */
	_Calcs.randomRange = function(p_min, p_max)
	{
		var randomNum = Math.random() * (p_max - p_min) + p_min;
		return randomNum;
	};

	/**
	 * 指定範囲／変形4平方ランダム：ある範囲内での偏った数値を吐く(min<=n<max)
	 * @param	p_min		最小値
	 * @param	p_max		最大値
	 * @param	p_balance
	 * @param	p_velvet
	 * @return
	 */
	_Calcs.randomRangeBias = function(p_min, p_max, p_balance, p_velvet)
	{
		return Utils.randomTrans4(p_balance, p_velvet) * (p_max - p_min) + p_min;
	};

	/**
	 * 指定範囲のランダムなintを吐く(min<=n<=max)
	 * @param	p_min
	 * @param	p_max
	 * @return
	 */
	_Calcs.randomRangeInt = function(p_min, p_max)
	{
		if (p_max >= 0) return Math.floor(Utils.randomRange(p_min, p_max + 1));
		return Math.floor(Utils.randomRange(p_min, p_max));
	};

	/**
	 * 2次元円分布：ある円形の範囲内での等しい分布(0<=n<radius)
	 * @param	p_x			中心点(x)
	 * @param	p_y			中心点(y)
	 * @param	p_radius	半径
	 * @return	Point[x座標,y座標]
	 */
	_Calcs.randomCircle = function(p_x, p_y, p_radius)
	{
		var v_radius = Math.sqrt(Math.random()) * p_radius;
		var v_angle = Math.random() * (Math.PI * 2);
		return new Point(p_x + Math.cos(v_angle) * v_radius, p_y + Math.sin(v_angle) * v_radius);
	};

	/**
	 * 2次元偏向円分布／変形4平方ランダム：ある範囲内での偏った数値を吐く(0<=n<radius)
	 * @param	p_x
	 * @param	p_y
	 * @param	p_radius
	 * @param	p_balance
	 * @param	p_velvet
	 * @return
	 */
	_Calcs.randomCircleBias = function(p_x, p_y, p_radius, p_balance, p_velvet)
	{
		var v_radius = Math.sqrt(Utils.randomTrans4(p_balance, p_velvet)) * p_radius;
		var v_angle = Math.random() * (Math.PI * 2);
		return new Point(p_x + Math.cos(v_angle) * v_radius, p_y + Math.sin(v_angle) * v_radius);
	};

	/**
	 * Fibonacci number：フィボナッチ数
	 * @param	p_uint
	 * @return
	 */
	_Calcs.fibonacciInt = function(p_uint)
	{
		var __root5 = Math.sqrt(5);
		var __gold = (1 + __root5) / 2;
		return Math.floor(Math.pow(__gold, p_uint) / __root5 + 0.5);
	};


	/**************************************************************************************
	 Array
	 */

	/**
	 * 指定数ランダムに格納されたナンバー(0<=n<length)
	 * @param	p_length
	 * @return
	 */
	_Calcs.randomNumberArray = function(p_length)
	{
		var o_arr = [];
		for (var i = 0; i < p_length; i++)
		{
			o_arr.push(i);
		}
		Utils.arraySortRandom(o_arr);
		return o_arr;
	};

	/**
	 * 指定配列をランダムにかき混ぜる
	 * @param	p_arr
	 * @return
	 */
	_Calcs.arraySortRandom = function(p_arr)
	{
		var leng = p_arr.length;
		var a;
		var b;
		var randomNum;
		var o_arr = p_arr;
		for (var i = 0; i < leng; i++)
		{
			randomNum = Math.floor(Math.random() * leng);
			a = o_arr[randomNum];
			b = o_arr[i];
			o_arr[i] = a;
			o_arr[randomNum] = b;
		}
	};

	//Loaded
	$(function()
	{

	});
})(jQuery);
