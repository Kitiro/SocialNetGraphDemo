var nodes = new vis.DataSet();
var edges = new vis.DataSet();

var container = document.getElementById('mynetwork');


var data = {
    nodes:nodes,
    edges:edges
};

// var options = {
    
//     edges:{
//         arrows: {
//              to: {enabled: false, scaleFactor: 1},
//         }
//     }
    
// }

var locales = {
  en: {
    edit: 'Edit',
    del: 'Delete selected',
    back: 'Back',
    addNode: 'Add Node',
    addEdge: 'Add Edge',
    editNode: 'Edit Node',
    editEdge: 'Edit Edge',
    addDescription: 'Click in an empty space to place a new node.',
    edgeDescription: 'Click on a node and drag the edge to another node to connect them.',
    editEdgeDescription: 'Click on the control points and drag them to a node to connect to it.',
    createEdgeError: 'Cannot link edges to a cluster.',
    deleteClusterError: 'Clusters cannot be deleted.',
    editClusterError: 'Clusters cannot be edited.'
  }
}

var options = {
  autoResize: true,
  height: '100%',
  width: '100%',
  locale: 'en',
  locales: locales,
  clickToUse: false,
  nodes:{
    color: {
        highlight:'red',
    }
  }
}

var network = new vis.Network(container, data, options);

function addNode(id, label, type) {
    var node = {
        id: id,
        label: label,
    }
    if (type == 'to'){
        node['color'] = '#7FFFAA';
    }
    nodes.add(node)
}

function addEdge(fromId, toId, weight) {
    var edge = {
        from: fromId,
        to: toId,
    }
   
    edge['label'] = weight;
    edge.length = 250;
    edge.arrows = 'to';
        
    edges.add(edge);
}



function option0(data){
    var num = data.pathNum -1;
    //alert(JSON.stringify(data));
    nodes.clear();
    edges.clear();
    var paths = data['map']

    for(var i = 0; i < num; i++){ 
        var path = paths[i]
        var user = path['user']
        var item = path['item']
        if (!nodes.get(user)){addNode(user, user, 'from');}
        if (!nodes.get(item)){addNode(item, item, 'to');}
        
        addEdge(path['user'],path['item'], path['relationship']);
        
    }
    $("#search_display").html('');
    $("#search_display").append("<br>&nbsp;&nbsp;&nbsp;-1代表该user接触过该item但未做出评价");
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
                    
                    if(parseInt($("#options").val()) ==0){
                        option0(data);
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

     


