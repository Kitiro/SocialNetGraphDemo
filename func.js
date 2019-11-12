
var nodes = new vis.DataSet();
var edges = new vis.DataSet();

var container = document.getElementById('mynetwork');

var data = {
    nodes:nodes,
    edges:edges
};

var options = {
    
    edges:{
        arrows: {
             to: {enabled: false, scaleFactor: 1},
        }
    }
    
}

var network = new vis.Network(container, data, options);

function addNode(id, label, title) {
   
    nodes.add({
        id: id,
        label: label,

    })
    
}

function addEdge(fromId, toId, weight) {
    var edge = {
        from: fromId,
        to: toId,
    }
   
        edge['label'] = weight+"";
         edge.length = 200;
        edge.arrows = {
            to: {
                type: 'circle'
            }
        }
    edges.add(edge);
}



function addHisLog(message) {
    $('#hisLog').prepend('<div>' + message + '</div>')
   // $('#hisLog div').remove('div:gt(13)')
}

function queryTop10(data){
    
    $("#hisLog").html('');
    nodes.clear();
    edges.clear();
    
    var num = data['friendNum'];
    if(num == 1){
        alert('抱歉，暂时没有收集到这个人的数据，请重新输入');
        return ;
    }
    else if( num < 11){
        alert('抱歉，这人的朋友不足10个');
        
    }
    var centerNode = 0;
    nodes.add({
        id: 0,
        label: $('#info1').val(),
        font:{
            size:30,
        }
    });
    for(var i= num-1;i > 0; i--){
        var person = data['p'+i];
        var weight = data['w'+i];
        
        addNode(i,person,null);
        addEdge(centerNode,i,weight);
        addHisLog(i + '.Name:' + person + ".  Weight:" + weight);
    }
    queryIndividual();
    

}

function queryShortestPath(data){
    var length = data.pathLength;
    var num = data.pathNum -1;

    //alert(JSON.stringify(data));
    nodes.clear();
    edges.clear();
    nodes.add({
        id: 0,
        label: data['path0-0'],
        font:{
            size:30,
        }
    });
    nodes.add({
        id: length,
        label:data['path'+ num + '-' + length],
        font:{
            size:30,
        }
    });
    var weightArray = new Array(num+1);
    for(var i = 0; i <= num; i++){
        
        addNode(""+i+1,data['path'+ i + '-' + 1],null);
        addEdge(0,""+i+1,data['path'+ i + '-' + 1+'weight']);
        weightArray[i] =  data['path'+ i + '-' + 1+'weight'];
        for(var j = 2; j < length;j++){
            var jj = j-1;
            
            addNode(""+i+j,data['path'+ i + '-' + j],null);
            addEdge(""+i+jj,""+i+j,data['path'+ i + '-' + j+'weight']);
            weightArray[i] += data['path'+ i + '-' + j+'weight'];
        }
        var jj = length -1;
        
        addEdge(""+i+(length-1),length,data['path'+ i + '-' + length+'weight']);
        weightArray[i] += data['path'+ i + '-' + length+'weight'];
    }
    
    var nn = num+1;
    $("#hisLog").html('');
    $("#hisLog").html('最短路径长度:'+length+'.<br>');
    $("#hisLog").append('最短路径共:'+nn +'条.'+'<br>');
    for(var i=0; i <= num;i++){
        
        $("#hisLog").append(i+'.路径总权重:' + weightArray[i] +'.<br>');
        $("#hisLog").append(data['path'+ i + '-' + 0]);

        for(var j = 1; j <= length;j++){
            $("#hisLog").append(" ---------------" + data['path'+ i + '-' + j + 'weight']+"--------> " 
            + data['path'+ i + '-' + j] + '<br>') ;
        }
    }
    

}

function qButton2(){
    
    $("#hisLog").html('');
    $("#hisLog").append("<tr><th style = 'width:30%'>Pagerank影响力排行榜</th></tr>");
    $("#hisLog").append("<table><tr><th>排名</th><th>名称</th><th>数值</th></tr>");
    $("#hisLog").append("<tr><td>1</td><td>习近平</td><td>0.004594</td></tr>");
    $("#hisLog").append("<tr><td>2</td><td>胡锦涛</td><td>0.002610</td></tr>");
    $("#hisLog").append("<tr><td>3</td><td>温家宝</td><td>0.001643</td></tr>");
    $("#hisLog").append("<tr><td>4</td><td>李克强</td><td>0.001519</td></tr>");
    $("#hisLog").append("<tr><td>5</td><td>徐建平</td><td>0.001062</td></tr>");
    $("#hisLog").append("<tr><td>6</td><td>邱小琪</td><td>0.001034</td></tr>");
    $("#hisLog").append("<tr><td>7</td><td>程永华</td><td>0.000997</td></tr>");
    $("#hisLog").append("<tr><td>8</td><td>杨厚兰</td><td>0.000996</td></tr>");
    $("#hisLog").append("<tr><td>9</td><td>伍江</td><td>0.000906</td></tr>");
    $("#hisLog").append("<tr><td>10</td><td>罗林泉</td><td>0.000902</td></tr>");
     $("#hisLog").append("<button style = 'width:70px;height:30px; position:absolute;right:86%;top:450px;'id = 'qButton1' onClick = 'qButton1()'>图信息</button>  ");
    $("th").css({"width": "9%",
                "height": "40px",
                "font-size": "140%",
                "border": "1px solid black"});
    $("td").css({"width": "15%",
                "height": "30px",
                "border": "1px solid gray"});

}
function qButton1(){
    
    $("#hisLog").html('');
    $("#hisLog").append("<table ><tr><th>图属性</th><th>数据</th></tr>");
    $("#hisLog").append("<tr><td><big>结点数:</big></td><td> 80786</td></tr>");
    $("#hisLog").append("<tr><td><big>边数: </big></td><td> 1733953</td></tr>");
    $("#hisLog").append("<tr><td><big>连通分量数:</big></td><td> 1690</td></tr>");
    $("#hisLog").append('<tr><td><big>最大连通分量:</big></td><td> 78006</td></tr>');
    $("#hisLog").append("<button style = 'width:70px;height:30px; position:absolute;right: 0;top:450px;'id = 'qButton2' onClick = 'qButton2()'>Pagerank</button>  ");   
    
    $("th").css({"width": "15%",
                "height": "40px",
                "font-size": "140%",
                "border": "1px solid black"});
    $("td").css({"width": "15%",
                "height": "30px",
                "border": "1px solid gray"});
}




function isVaildInput(){
    var info = $('#info1').val();
    
    if(!info){
       
        return false;
    }
    else {
        return true;
    }

}
function changeSel() {
    
    switch(parseInt($('#options').val()) ){
        case 0:
            //$('#queryButton').css('display','inline');
            $('#info1').css('display','none');
            $('#info2').css('display','none');
            //$('#submit').css('display','none');
            break;
        case 1:
            //$('#queryButton').css('display','none');
            $('#info1').css('display','inline');
            $('#info2').css('display','none');
            //$('#submit').css('display','inline');
            break;
        case 2:
            //$('#queryButton').css('display','none');
            $('#info1').css('display','inline');
            $('#info2').css('display','inline');
            //$('#submit').css('display','inline');
            break;
    }
    
}

function  queryIndividual(){
    
    $.ajax({
        type:'post',
        url:'/ggg',
        dataType:'json',
        data: {
            person:$("#info1").val()
        },
        success: function(data){
            printIndividual(data);
        },
        error: function(jqXHR, textStatus, errorThrown){
             alert('error ' + textStatus + " " + errorThrown);  
        }
    });  
}

function printIndividual(data){
    addHisLog("--------------------------------------------");
    addHisLog("点度中心性：" +data.centrality + ".名次:" +data.centralityNum);
    addHisLog("Pagerank：" +data.pagerank + ".名次:" +data.pagerankNum);
    addHisLog("聚集系数：" +data.cluster + ".名次:" +data.clusterNum);
    
}
$(function(){
        $("#submit").click(function(){

         $.ajax({
                type:'post',
                url: '/ppp',
                dataType: 'json',
                data:{
                    options: $("#options").val(),
                    info1: $("#info1").val(),
                    info2: $("#info2").val()
                },
                success: function(data){
                    alert(1);
                    if(parseInt($("#options").val()) ==0){
                        alert('get!')
                        //queryTop10(data);
                        
                    }
                    else{
                       queryShortestPath(data);
                    }
                    
                },
                error: function(jqXHR, textStatus, errorThrown){
                    alert('error ' + textStatus + " " + errorThrown);  
                    
                }
            });

           
        });
});

     


