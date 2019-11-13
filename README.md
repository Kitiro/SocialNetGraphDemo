# 社交网络可视化demo

该demo是用于将社会网络可视化以进行更进一步的社会网络分析的研究，以豆瓣用户的社交数据为节点，用户对书籍、音乐、电影的评分为边建立的网络图。

## Data Description

| Dataset     | #user  | #item   | #event     |
|-------------|--------|---------|------------|
| DoubanMovie | 94,890 | 81,906  | 11,742,260 |
| DoubanMusic | 39,742 | 164,223 | 1,792,501  |
| DoubanBook  | 46,548 | 212,995 | 1,908,081  |

|           | #node   | #edge     |
|-----------|---------|-----------|
| SocialNet | 695,800 | 1,758,302 |

### Data Sample

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

### Data Source

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

[douban.data](https://github.com/DeepGraphLearning/RecommenderSystems/blob/master/socialRec/README.md#douban-data)

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

1. 通过neo4j的Cypher命令

    ```{Bash}
    LOAD CSV WITH HEADERS from "file:///socialnet.csv" as line
    match (from:person{id:line.follower}),(to:person{id:line.followee})
    merge (from)-[r:follow{weight:line.weight}]->(to)
    ```

2. neo4j-import工具（推荐）

    * 需要在/var/lib/neo4j目录内执行以下命令

    ```{bash}
    sudo neo4j-admin import --database douban_socialnet.db --nodes Douban/socialnet/user.csv --relationships:FOLLOW Douban/socialnet/relation.csv

    sudo neo4j-admin import --database douban_music.db --nodes Douban/music/user.csv --nodes Douban/music/item.csv  --relationships:RATING Douban/music/relation.csv

    sudo neo4j-admin import --database douban_movie.db --nodes Douban/movie/user.csv --nodes Douban/movie/item.csv  --relationships:RATING Douban/movie/relation.csv

    sudo neo4j-admin import --database douban_book.db --nodes Douban/book/user.csv --nodes Douban/book/item.csv  --relationships:RATING Douban/book/relation.csv
    ```

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

```

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

### 本示例启动流程

```{bash}
#启动neo4j
neo4j start

#启动服务端
node server.js

#网页访问
open localhost:8888
