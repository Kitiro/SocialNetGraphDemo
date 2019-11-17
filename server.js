/*
* @Author: Kitiro
* @Date:   2019-11-12 18:16:45
* @Last Modified by:   Kitiro
* @Last Modified time: 2019-11-12 23:27:20
*/
//模块调用
var qs = require('querystring');
var http = require("http"); 
var fs = require('fs'); 
var url = require('url');
var util = require('util'); 
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var readline = require('readline');

//数据库设置
var neo4j = require('neo4j-driver').v1;
var uri = "bolt://localhost:7687";
var user = "neo4j";
var password = "123";
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();


var flag = 1;

//cypher查询语句
all_relation = "MATCH p = ()-[r]->() RETURN p"
count_node = "MATCH (c:Character) RETURN count(c)"

centrality = "MATCH p = (c:Character)-[r:INTERACTS]-() RETURN c.name AS character, count(*) AS degree, sum(r.weight) AS weightedDegree ORDER BY weightedDegree DESC LIMIT 10"
shortest_path = "MATCH path=shortestPath((start:Character {name:$start})-[INTERACTS*]-(end:Character {name:$end}))  RETURN path"
// MATCH (catelyn:Character {name: "Catelyn"}), (drogo:Character {name: "Drogo"})
// MATCH p=shortestPath((catelyn)-[INTERACTS*]-(drogo))
// RETURN p



app.use(express.static(path.join(__dirname, '')));
app.use(bodyParser());
 
app.post('/ppp',function(req,res){
    var now = new Date();
    console.log('Now:'+ now);
    console.log('a new request '+ JSON.stringify(req.body));
    console.log('from'+ req.connection.remoteAddress);
    console.log('--------------------------------------');

    //输出图的基本信息
    var option = parseInt(req.body.option)
    if(option == 0 || option == 2){
        
        var count = 0;
        var data={
            'map':[],
        };

        var resultPromise = session
            .run(
                all_relation,
                )
            .subscribe({
                onNext:function(response){            
                   if(response){

                        path = response['_fields'][0].segments[0]
                        name1 = path['start'].properties.name
                        relationship = path['relationship'].properties.weight.low
                        console.log(path['end'])
                        name2 = path['end'].properties.name
                        data['map'][count] = {
                            'c1':name1,
                            'relationship':relationship,
                            'c2':name2,
                        }
                        count++;
                   }
                    
                },
                onCompleted: function () {
                    data['pathNum'] = count;
                    console.log(count + ' path found');
                    console.log('search succeed');
                    res.send(JSON.stringify(data));
                    count = 0;
                    res.end();
                    session.close();
                },
                onError: function (error) {
                     console.log(error);
                }
            })
        
    }
    else if(option == 1){   //中心度
        var count = 0;
        var data=[];
        var resultPromise = session
            .run(
                centrality,
                )
            .subscribe({
                onNext:function(response){            
                   if(response){
                        //console.log(response);
                        name = response['_fields'][0]
                        degree = response['_fields'][1].low
                        weightedDegree = response['_fields'][2].low

                        data[count] = {
                            'name':name,
                            'degree':degree,
                            'weightedDegree':weightedDegree,
                        }
                        count++;
                   }
                    
                },
                onCompleted: function () {

                    res.send(JSON.stringify(data));

                    count = 0;
                    res.end();
                    session.close();
                },
                onError: function (error) {
                     console.log(error);
                }
            })
    }
    //最短路径
    else if(option == 3){
        var data={
            'path':[]
        };
        var name1 = req.body.info1;
        var name2 = req.body.info2;

        var resultPromise = session
            .run(
                shortest_path,{start:name1, end:name2}
                )
                .subscribe({
                    onNext:function(response){            
                       if(response){
                            
                            paths = response['_fields'][0].segments;
                            length = response['_fields'][0].length;
                            data['length'] = length;
                            data['path'][0] = name1;
                            for(var i = 0; i < length; i++){
                                data['path'][i+1] = paths[i].end.properties.name;
                            }
                       }
                        
                    },
                    onCompleted: function () {
                        
                        console.log('shortest path :',length,'. from',name1,'to',name2);
                        console.log('search succeed');
                        res.send(data);
                        res.end();
                        session.close();
                    },
                    onError: function (error) {
                         console.log(error);
                    }
                })
        
    }
    //查找最短路径
    else if(option == 4){  
        
        var personName = req.body.info1;
        var personName2 = req.body.info2;
        var pathCount = 0;
        var resultPromise = session
            .run(
                 'Match (n:Person {person: $name}), (m:Person {person: $name2}), p =allShortestPaths((n)-[r*1..20]-(m)) with reduce(weight = 0, rel in rels(p) | weight + rel.weight) AS weight, n, m,p return relationships(p),length(p),nodes(p) order by weight desc limit 10',
                {name: personName,name2:personName2}
                )
            .subscribe({
                onNext:function(record){
                   var length = parseInt(record.get(1));
                    save['pathLength'] = length;
                    save['path'+ pathCount + '-' + 0] = record.get(2)[0].properties.person;
                    console.log(record.get(0));
                    console.log(record.get(1));
                    console.log(record.get(2));
                        for(var i = 1; i <= length ;i++){
                            save['path'+ pathCount + '-' + i] = record.get(2)[i].properties.person;
                            save['path'+ pathCount + '-' + i + 'weight'] = parseInt(record.get(0)[i-1].properties.weight);
                        }
                        pathCount++;
                    
                },
                onCompleted: function () {
                    save['pathNum'] = pathCount;
                    console.log(data);
                    res.send(data);
                    count = 0;
                    res.end();
                    session.close();
                },
                onError: function (error) {
                     console.log(error);
                }
            })
       
    }
   
})

app.listen(8888,function(){

    console.log("server is running..."); 
})

