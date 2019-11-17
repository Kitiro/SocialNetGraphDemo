# 关系网络分析

## Intro
本demo以热播电视剧《权力的游戏》*(Game of Thrones)*中出现的部分主要人物作为节点，人物之间同时登场的次数作为他们之间的关系边的权重。

通过分析该网络并结合电视剧内容，体会网络分析的实用性和必要性，让我们对网络分析的概念理解更加充分，且能够进行实际运用以加深对社会网络的理解并运用到现实生活中去解决实际问题。

同时提供了豆瓣数据进行更大数据集上的分析。

## Data Description

### GOT Data
* GOT.csv

| Nodes   | Edges  |
|---------|--------|
| 107     | 353    |

#### Data Sample

| Source   | Target  | Weight  |
|----------|---------|---------|
| Tyrion    | Podrick |  28    |

**Note**: 因为该数据集是以同时登场的次数作为边的权重，因此边应为无向边。
Source和Target的设定只是为了方便存入数据库中。

**数据来源：**
> https://www.macalester.edu/~abeverid/thrones.html


### Douban Data

| Dataset     | #user  | #item   | #event     |
|-------------|--------|---------|------------|
| DoubanMovie | 94,890 | 81,906  | 11,742,260 |
| DoubanMusic | 39,742 | 164,223 | 1,792,501  |
| DoubanBook  | 46,548 | 212,995 | 1,908,081  |

|           | #node   | #edge     |
|-----------|---------|-----------|
| SocialNet | 695,800 | 1,758,302 |

#### Data Sample

* book/douban_book.tsv

| UserId     | ItemId  | Rating  | Timestamp    |
|------------|---------|---------|--------------|
| 709669     | 0       | 5       | 1495641600.0 |

* movie/douban_movie.tsv

| UserId     | ItemId  | Rating  | Timestamp    |
|------------|---------|---------|--------------|
| 630157     | 0       | 5       | 1182009600.0 |

* music/douban_music.tsv

| UserId     | ItemId  | Rating  | Timestamp    |
|------------|---------|---------|--------------|
| 454917     | 0       | 5       | 1254844800.0 |

* socialnet/socialnet.tsv

| Follower   | Followee  | Weight  |
|------------|-----------|---------|
| 48899      | 127372    |  1.0    |

**其中部分数据的Rating为-1，代表用户接触过这个item，但没有做出评价。**

**数据来源**：
```
@inproceedings{song2019session,
  title={Session-Based Social Recommendation via Dynamic Graph Attention Networks},
  author={Song, Weiping and Xiao, Zhiping and Wang, Yifan and Charlin, Laurent and Zhang, Ming and Tang, Jian},
  booktitle={Proceedings of the Twelfth ACM International Conference on Web Search and Data Mining},
  pages={555--563},
  year={2019},
  organization={ACM}
}
```

[douban.data下载](https://github.com/DeepGraphLearning/RecommenderSystems/blob/master/socialRec/README.md#douban-data)

## Dependency

neo4j:图数据库

vis: 将节点进行展示的js文件

node.js: 一个框架

**主要流程**:将数据导入图数据库，通过nodejs里的neo4j-driver模块访问数据库执行查询并获得数据，再返回到前端通过vis.js进行图节点的展示。

## Tutorial

### 配置neo4j

以Ubuntu16.04 Server为例

安装java环境:

```{Bash}

sudo apt-get install default-jdk
```

将neo4j添加到repo内

```{Bash}

wget -O - https://debian.neo4j.org/neotechnology.gpg.key | sudo apt-key add -
echo 'deb https://debian.neo4j.org/repo stable/' | sudo tee -a /etc/apt/sources.list.d/neo4j.list
sudo apt-get update
```

安装并运行neo4j

```{Bash}
sudo apt-get install neo4j
sudo service neo4j start
```

先在本地ssh连接到服务器，在本地浏览器通过http访问neo4j\
将本地localhost的7474端口与通过ssh连接的remote的7474端口进行绑定

```{Bash}
ssh -NL 7474:localhost:7474 user@address
```

本地浏览器访问: localhost:7474
默认用户名和密码都是neo4j, 当第一次登陆时会要求改密码。

* 如果遇到改密码的时候报Credential的错误时，可以通过在服务器端改neo4j的配置文件,将neo4j的认证关闭。但这种方法显然不会安全。

```{bash}
    vim /etc/neo4j/neo4j.conf
    set dbms.security.auth_enabled = false
```

使用tansfer.py脚本将原数据更改格式，提取出节点和关系csv文件，并将要读入的csv文件移动到neo4j的安装目录的import文件夹内。e.g.  /var/lib/neo4j/import

#### 两种数据导入方式

1. 通过neo4j的Cypher命令(导入GOT数据)

    ```{Bash}
    LOAD CSV WITH HEADERS FROM "https://www.macalester.edu/~abeverid/data/stormofswords.csv" AS row
    MERGE (src:Character {name: row.Source})
    MERGE (tgt:Character {name: row.Target})
    MERGE (src)-[r:INTERACTS]->(tgt)
    SET r.weight = toInt(row.Weight)
    RETURN count(*) AS paths_written
    ```

2. neo4j-import工具（推荐）（导入豆瓣数据）

    需要在/var/lib/neo4j目录内执行以下命令

    ```{bash}
    sudo neo4j-admin import --database douban_socialnet.db --nodes Douban/socialnet/user.csv --relationships:FOLLOW Douban/socialnet/relation.csv

    sudo neo4j-admin import --database douban_music.db --nodes Douban/music/user.csv --nodes Douban/music/item.csv  --relationships:RATING Douban/music/relation.csv

    sudo neo4j-admin import --database douban_movie.db --nodes Douban/movie/user.csv --nodes Douban/movie/item.csv  --relationships:RATING Douban/movie/relation.csv

    sudo neo4j-admin import --database douban_book.db --nodes Douban/book/user.csv --nodes Douban/book/item.csv  --relationships:RATING Douban/book/relation.csv
    ```
sudo neo4j-admin import --database GOT.db --relationships:WEIGHT GOT.csv

以上方式1会将数据导入到默认的graph.db中，方式2会新建一个指定命名的数据库，同时使用方式2时需要先通过命令```neo4j stop```关闭数据库。通过浏览器访问数据库时默认访问的是graph.db，需要通过修改neo4j的配置文件来更改访问的数据库。

```{bash}
vim /etc/neo4j/neo4j.conf
set dbms.active_database=douban_music.db
neo4j restart
```

现在可以在数据库内通过Cypher语句进行一些简单的查询和计算操作，如计算图的结构洞，最大连通分量,community detection等。

```
#画出整张图
MATCH p=(:Character)-[:INTERACTS]->(:Character)
RETURN p

#查找社区
MATCH (c:Character {name: row.name})
SET c.community = toInteger(row.community),
    c.pagerank  = toFloat(row.pagerank)

#pageRank
CALL algo.pageRank(
  'MATCH (p:Page) RETURN id(p) as id',
  'MATCH (p1:Page)-[:Link]->(p2:Page) RETURN id(p1) as source, id(p2) as target',
  {graph:'cypher', iterations:5, write: true});

```
同时也可通过Python的NetworkX库进行一些计算，部分函数已写好在algo.py中。

### 配置nodejs

```{bash}
sudo apt-get install nodejs
sudo apt-get install npm

#将所需模块下载到本目录下node-modules/
npm install express
npm install neo4j-driver
```

### vis.js

这是一个js文件，用于图形网络的展示。

**基本使用方法**：
```{js}
var nodes = new vis.DataSet();
var edges = new vis.DataSet();
var container = document.getElementById('mynetwork');
var data = {
    nodes:nodes,
    edges:edges
};

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
```
更多细节见:
[vis.js Network Docs](https://visjs.github.io/vis-network/docs/network/)

---
接下来就可以通过nodejs启动服务端，进行demo的展示了。
**注意**:neo4j的bolt访问，端口为7687，http为7474，在server文件指明neo4j-driver的访问端口时务必注意。

### 本demo启动流程

```{bash}
#启动neo4j
sudo neo4j start

#启动服务端
node server.js

#网页访问
open localhost:8888
```

### Example

* 计算图的度中心性，以每个点所存在的关联边作为它的度遍历所有节点，按度中心性值降序排列出前十的节点。同时得到以边的weight值作为权值的加权度中心性。

    | Character   | Centrality  | WeightedCentrality  |
    |------------|-----------|---------|
    |Tyrion     |36 |551|
    |Jon      |26 |442|
    |Sansa      |26 |383|
    |Jaime      |24 |372|
    |Bran     |14 |344|
    |Robb     |25 |342|
    |Samwell  |15 |282|
    |Arya     |19 |269|
    |Joffrey  |18 |255|
    |Daenerys |14 |232|

从该结果可以看出，排在前列的都是剧集中我们最为熟知的几个主要角色。且每个点的度中心性与其加权度中心性的排列基本一致。因此我们可以认为，加权度中心性确实能在一定程度上反映网络结构中节点的重要性。

* 计算节点PageRank值

    | Character   | Value  | 
    |------------|-----------|
    |Tyrion|0.055447591710774874|
    |Jon|0.044848169497765177|
    |Daenerys|0.041097955400774516|
    |Jaime|0.03660472005662751|
    |Sansa|0.03635984896765583|
    |Robb|0.03412784643493466|
    |Bran|0.029003406623936624|
    |Samwell|0.028272354636001702|
    |Arya|0.02553359919537514|
    |Joffrey|0.024235897079257794|

在PageRank的结果中能够发现，度中心性中排在前列的Tyrion和Jon仍然保持着自己一二名的地位，但原本只能排在第十位的Daenerys跃居到了第三名的位置，且仅与第二的Jon相差8%。

参考原剧中的剧情，Daenerys和Jon是两位绝对主角，只是由于剧情安排的原因，Daenerys在剧中大部分时间所处的环境都与主线剧情发展的地域分离很远，只有在故事发展接近后期的时候才与其他主要人物汇合继续剧情。因此她在该数据集中**接触到的角色数量并不多**，就导致了这一人物节点的度中心性并不是很高。但由于她**接触到的都是主要角色**，这就使得在计算PageRank值时，与其有关联边的节点重要性的上升，就导致这一节点随之“水涨船高”，获得了较高的PageRank值。

因此我们可以认为PageRank值在一个社会网络中更能体现节点的重要程度，在对社会网络进行分析时更具参考性。

将该网络的所有节点和节点间关联边通过visJs插件进行可视化：

![avatar](https://github.com/Kitiro/SocialNetGraphDemo/blob/master/img/all_nodes.png)

通过NetworkX的k_clique_communities函数进行该网络的社区发现。

![avatar](https://github.com/Kitiro/SocialNetGraphDemo/blob/master/img/community_k%3D3.png)

clique_size为4时，该网络中共找到8个社区，通过不同颜色的节点标识出其属于的社区。对于不属于社区的节点标蓝色。
**Note**:存在部分共享节点无法表示，所以导致网络图显示不太符合预期。

从社区中我们可以发现，该图的几个社区中心主要还是集中于几个在度中心性表上排前列的节点周围，这一点从社区发现的计算方法不难得到。因为社区是通过k-size的clique来不断渗透，融合得到。这也就意味着那种度较大的节点在这一过程中更具优势，它可以作为中间桥梁汇聚起多个clique从而形成一个社区。


**因为该数据集中关系为无向边，且人物之间都存在关联边，则该图的最大连通子图即为该图本身。**

* 查询最短路径

 ![avatar](https://github.com/Kitiro/SocialNetGraphDemo/blob/master/img/shortest_path.png)
