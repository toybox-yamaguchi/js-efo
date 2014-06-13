/*＠jQuery
 */
(function($){
  //Loaded
  $(function(){
    $("#selectNode").change(function(){
      var _val = $(this).find("option:selected").val();
      $("#efoNode").append($("#" + _val).html());

      setTimeout(function(){
        //efokeyの手動追加
        var _key = $("input ,select, textarea").filter('[data-efokey][data-efofuncs]').attr("data-efokey");
        var _node = window.efo.addNode(_key);
        _node.analysis(false);//追加後に解析をかける。エラーは表示しない。
        //window.efo.crawlAnalysis(true);//追加終了時に全解析をかける。エラーは表示しない。
        $("#selectNode").hide();
      }, 100);
    });
  });
})(jQuery);