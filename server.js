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
var uri = "http://localhost:7474";
var user = "neo4j";
var password = "123";
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

var save={
    'map':[],
    'total_num',
};

var flag = 1;

//cypher查询语句
cypher_all_map = "MATCH (n:User)-[r]->(m:User) RETURN n,m,r"


// cypher_find_relation = "MATCH (p:Person {User:$name})-[r:Relation]-(friend) RETURN friend.UserId ORDER BY r.weight DESC LIMIT 10",{name:personNum}



app.use(express.static(path.join(__dirname, '')));
app.use(bodyParser());
 
app.post('/ppp',function(req,res){
    var now = new Date();
    console.log('Now:'+ now);
    console.log('a new request '+JSON.stringify(req.body));
    console.log('from'+ req.connection.remoteAddress);
    console.log('--------------------------------------');

    //输出图的基本信息
    if(parseInt(req.body.options) == 0){
        // var personName = req.body.info1;
        var count = 1;
        var resultPromise = session
            .run(
                cypher_all_map
                )
            .subscribe({
                onNext:function(response){
                    
                   if(response.get()){
                        
                       console.log(record.get('n.UserId') +"  " + record.get('r.Weight')+ record.get('m.ItemId'));
                        var temp = 'p'+ count;
                        var temp2 = 'w' + count;
                        count++;
                        save['map'][count] = [record.get('n.UserId'), record.get('r.Weight'), record.get('m.ItemId')]

                       // console.log('-----------------------------------');
                        
                   }
                    
                },
                onCompleted: function () {
                    save['total_num'] = count;
                    session.close();
                },
                onError: function (error) {
                     console.log(error);
                }
            })
        
       
    }
    else if(parseInt(req.body.options) == 2){  //查找最短路径
        
        var personName = req.body.info1;
        var personName2 = req.body.info2;
        var pathCount = 0;
        var resultPromise = session
            .run(
                 //'MATCH (a:Person {person: $name}) RETURN a',
                // {name: personName}
                //'MATCH (p1:Person {person: $name}) MATCH (p2:Person{person: $name2}) MATCH p = allShortestPaths((p1)-[*..]-(p2))RETURN relationships(p),length(p),nodes(p)',
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
                    
                    session.close();
                },
                onError: function (error) {
                     console.log(error);
                }
            })
       
    }
    setTimeout(function(){

            console.log(save);
            res.send(save);
            count = 0;
            res.end();
            save = {};
            
        },1000);
   

})

app.post('/ggg',function(req,res){
   
    if(req){
        var data = {

        };
        var person = req.body.person;
        
        var filepath1 = path.join(__dirname, "/info/pagerank.txt")
        var input1 = fs.createReadStream(filepath1)
        input1.setEncoding('utf8');
        var rl1 = readline.createInterface({
            input: input1
        });
        rl1.on('line', (line) => {
            if(line.match(person)){

                var arr = line.split(',');
                
                data['pagerank'] = arr[2];
                data['pagerankNum'] = arr[3];
                rl1.close();
            }

        });
        // rl.on('close', (line) => {
        //     console.log("pagerank读取完毕！");
        // });
        var filepath2 = path.join(__dirname, "/info/cluster.txt")
        var input2 = fs.createReadStream(filepath2)
        input2.setEncoding('utf8');
        rl2 = readline.createInterface({
            input: input2
        });
        rl2.on('line', (line) => {
            if(line.match(person)){

                var arr = line.split(',');
                
                data['cluster'] = arr[2];
                data['clusterNum'] = arr[3];
                rl2.close();
            }

        });
        
        var filepath3 = path.join(__dirname, "/info/centrality.txt")
        var  input3 = fs.createReadStream(filepath3);
        
        input3.setEncoding('utf8');
        rl3 = readline.createInterface({
            input: input3
        });
        
        rl3.on('line', (line) => {
            
            if(line.match(person)){

                var arr = line.split(',');
                
                data['centrality'] = arr[2];
                data['centralityNum'] = arr[3];
                rl3.close();
            }
        });

        setTimeout(function(){

            res.send(data);
             res.end();
        },600);
        

    }
    // fs.readFile(url+'pagerank.txt',function(err,data){
    //      if(err){
    //         console.log("failed")
    //      }else{
    //         console.log("ok");
    //         console.log(data.readLine);
            
    //     }
    // })
})

app.listen(8888,function(){

    console.log("server is running..."); 
})

