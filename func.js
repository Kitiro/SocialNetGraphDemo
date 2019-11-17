/*
* @Author: kitiro
* @Date:   2019-11-14 10:31:22
* @Last Modified by:   kitiro
* @Last Modified time: 2019-11-14 10:33:48
*/
var nodes = new vis.DataSet();
var edges = new vis.DataSet();

var container = document.getElementById('mynetwork');


var data = {
    nodes:nodes,
    edges:edges
};


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
    shape:'circle',
    color: {
        highlight:'#FF4500',  //选中时为红色
        background:'#00FFFF', //默认为蓝色
    }
  },
  edges:{
      arrows:'to',
      color: '#191970',
      length:250,
  }
}

// 颜色列表用于标记社区
var color_list = ['#00FFFF','#FF83FA', '#B3EE3A', '#CD2626', '#912CEE', '#949494', '#7A378B','#8E8E38','#1F1F1F']

var network = new vis.Network(container, data, options);

function addNode(id, label, size=30, type=0) {
    var node = {
        id: id,
        label: label,
        size: size,
    }
    node.color = color_list[parseInt(type)];
    nodes.add(node); 
    
}

function addEdge(fromId, toId, weight) {
    var edge = {
        from: fromId,
        to: toId,
    }
    edge.label = weight+'';
    
    edges.add(edge);
}


function option0(res){
    //console.log(res);
    //res = JSON.parse(res);  //将被JSON.stringfy转成的字符串转换成JSON对象
    var data = res.data;
    var values = res.values;
    var num = data.pathNum -1;

    //values = values.split(',');
    var value_dict = {}

    for(var i =0; i < values.length; i++ ){
        var row = values[i].split('\t');
        value_dict[row[0]] = row[1];
    }
    nodes.clear();
    edges.clear();
    var paths = data['map']

    for(var i = 0; i < num; i++){ 
        var path = paths[i]
        var c1 = path['c1']
        var c2 = path['c2']

        var value1 = parseFloat(value_dict[c1]);
        var value2 = parseFloat(value_dict[c2]);

        if (!nodes.get(c1)){addNode(c1, c1, 6000*value1);}
        if (!nodes.get(c2)){addNode(c2, c2, 6000*value2);}
        
        addEdge(c1,c2, path['relationship']);

    }
    $("#displayField").html('');
    $("#displayField").append("本网络结构共107个节点，352条有向边，704条无向边");

}

function option1(res){

    //alert(JSON.stringify(data));
    var data = res['data']
    $("#displayField").html('');
    $("#displayField").append("<tr><th style = 'width:30%'>节点度中心性</th></tr>");
    $("#displayField").append("<table><tr><th>角色名</th><th>度中心性</th><th>加权度中心性</th></tr>");
    for(var i = 0; i<10; i++){
        var row = data[i];
        var name = row.name;
        var weight = row.degree;
        var weightedDegree = row.weightedDegree;
        $("#displayField").append("<tr><td>"+name+"</td><td>"+weight+"</td><td>"+weightedDegree+"</td></tr>");
    }
    $("table").css({
        "border-collapse": "collapse"
    });
    $("th").css({"width": "15%",
                "height": "30px",
                "font-size": "105%",
                "font-weight":"bold",
                "border": "1px solid gray",
    });
    $("td").css({"width": "15%",
                "height": "30px",
                "border": "1px solid gray",
                "text-align":"center",
    });
    
}

//打印社区
function option2(res){ 
    var community_info = res['community'];
    //共搜到4种社区划分方法，选择k=5时进行展示
    //console.log(community_info);
    var row = 0;
    var comm_list = []; 
    for(var i = 0; i < 3; i++){
        var comm_dict = {
            'community_nodes_num':[],
            'community_split':[],
            'map':{},
           
        }; //社区节点对应词典
        var community_num = community_info[row]; //该k值找到的社区数
        comm_dict['community_num'] = community_num;
        row += 1
        for(var j = 0; j < community_num; j++){
            var node_num = community_info[row]; //该社区的节点数
            comm_dict['community_nodes_num'][j] = node_num;
            row += 1;
            comm_dict.community_split[j] = ''
            for(var q = 0; q < node_num; q++){
                var character = community_info[row];
                comm_dict.community_split[j] += character+' '
                comm_dict.map[character] = j+1;
                row += 1;
            }
        }
        comm_list[i] = comm_dict;
    }
    var w = 1;
    console.log(comm_list[w]);
    console.log(comm_list[w].map.length);
    // 后续再添加进行多种社区同时展示的功能

    var data = res.data;
    var num = data.pathNum -1;
    var comm_split = comm_list[w].map;
    nodes.clear();
    edges.clear();
    var paths = data['map']

    for(var i = 0; i < num; i++){ 
        var path = paths[i]
        var c1 = path['c1']
        var c2 = path['c2']

        if (!nodes.get(c1)){addNode(c1, c1, 30, comm_split[c1]);}
        if (!nodes.get(c2)){addNode(c2, c2, 30, comm_split[c2]);}
        
        addEdge(c1,c2, path['relationship']);

    }
    
}

function option3(res){
    console.log(res);
    var paths = res.data.path;   //路径节点
    var length = res.data.length;

    nodes.clear();
    edges.clear();
    var start = paths[0];
    addNode(start, start,30,type=1);
    var lastOne = start;  //存储上一个节点
    $("#displayField").html('');
    $("#displayField").append("从",paths[0],'到',paths[length],'的最短路径长度为',length+'<br>');
    for(var i = 1; i < length+1; i++){ 
        var node = paths[i]
        if (i==length){
            addNode(node, node,30,type=1);
        }
        else{
            addNode(node, node,30);
        }
        addEdge(lastOne,node, 'Next');
        lastOne = node;
        $("#displayField").append(i,'&nbsp;&nbsp;',paths[i-1],'->',paths[i]+'<br>');
    }
    
}

function isValid(){
    var option = parseInt($("#option").val());
    var info1 = $("#info1").val();
    var info2 =$("#info2").val();
    if(option == 3){
        if (info1&&info2){
            return true;
        }
        else{
            alert('input value');
            return false;
        }
    }
    else{
        return true;
    }
    
}
$(function(){
        $("#submitButton").click(function(){
            var option = parseInt($("#option").val());
            var res = {};
            if (option == 0){
                var obj = $.ajax({url:"graph_info/pagerank.txt",async:false});
                var result = obj['responseText'];
                var rows = result.split("\n");
                res['values'] = rows;
            }
            if(option == 2){
                var obj = $.ajax({url:"graph_info/community.txt",async:false});
                var result = obj['responseText'];
                var rows = result.split("\n");
                res['community'] = rows;
            }
            
            $.ajax({
                    type:'post',
                    url: '/ppp',
                    dataType: 'json',
                    data:{
                        option: $("#option").val(),
                        info1: $("#info1").val(),
                        info2: $("#info2").val()
                    },
                    success: function(data){
                        res['data'] = data;
                        switch (option){
                            case 0:
                                option0(res);
                                break;
                            case 1:
                                option1(res);
                                break;
                            case 2:
                                option2(res);
                                break;
                            case 3:
                                option3(res);
                                break;
                        }
                        
                        
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        alert('error ' + textStatus + " " + errorThrown);  
                        
                    }
                });

           
            });
    
});

     


