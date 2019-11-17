'''
@Author: Kitiro
@Date: 2019-11-16 15:49:40
@LastEditors: Kitiro
@LastEditTime: 2019-11-17 21:00:19
@Description: some network algorithm realization
'''
import os
import networkx as nx
import pandas as pd
import time 

from networkx.algorithms.community.kclique import k_clique_communities

cent_func = {
        'vec':nx.eigenvector_centrality,  #特征向量中心性
        'pg':nx.pagerank, 
        'bet':nx.betweenness_centrality, #中介中心性
        'dg':nx.degree_centrality,   #度中心性
        'close':nx.closeness_centrality,
    }
cent_dict = {
    'vec': 'eigenvector',
    'pg': 'pagerank',
    'bet': 'betweenness',
    'dg': 'degree',
    'close': 'closeness',
}
cent_name = ['vec', 'pg', 'bet', 'dg','close']

#返回带权图or无权图
def graph(G, df, isWeighted):
    for row in df[['Source', 'Target', 'Weight']].values:
        if isWeighted:
            G.add_edge(row[0], row[1], weight=int(row[2]))
        else:
            G.add_edge(row[0], row[1])
            
    return G

def stdout(g):
    top10 = g[:10]
    print('|Character|Value|')
    print('|---|---|')   #方便markdown写成表格形式
    for tuple in top10:
        print('|'+tuple[0]+'|'+str(tuple[1])+'|')

def out_file(name, g):
    with open('graph_info/'+name+'.txt','w') as w:
        for tuple in g:
            w.write(tuple[0]+'\t'+str(tuple[1])+'\n')
        

def centrality(cent_type, G):
    
    g = cent_func[cent_type](G)
    g = sorted(g.items(), key=lambda x: x[1], reverse=True)

    #stdout(g)
    out_file(cent_dict[cent_type], g)
    
def out_pageRank(G):
    g = nx.pagerank(G)  #alpha：阻尼参数，默认值是0.85，取值范围为 0 到 1, 代表从图中某一特定点指向其他任意点的概率；
    g = sorted(g.items(), key=lambda x: x[1], reverse=True)

    stdout(g)

def out_degree(G):
    g = (G) 
    g = sorted(g.items(), key=lambda x: x[1], reverse=True)
    stdout(g)

def out_betweeness(G):
    g = (G)
    g = sorted(g.items(), key=lambda x: x[1], reverse=True)
    stdout(g)

def find_once(graph,k):
    return list(k_clique_communities(graph,k))

def find_community(network):
    #num = len(network.nodes())
    record = []
    for k in range(3,6):
        print ("############# k值: %d ################" % k)
        start_time = time.clock()
        rst_com = find_once(network,k)
        end_time = time.clock()
        print ("计算耗时(秒)：%.3f" % (end_time-start_time))
        print ("生成的社区数：%d" % len(rst_com))
        if len(rst_com) > 1:
            record.append(rst_com)
        print(rst_com)
    with open('graph_info/community.txt', 'w') as w:
        for i in record:  
            #print(len(i))  #社区数
            w.write(str(len(i))+'\n')
            for j in i:   #社区j
                #print(len(j))   #社区内节点数
                w.write(str(len(j))+'\n')
                for z in j:
                    #print(z)
                    w.write(z+'\n')
            
def max_subgraph(G):
    #key : 返回长度最大的子图，即最大连通子图
    largest_components = max(nx.connected_components(G),key=len)
    
    #print(largest_components)
    with open('graph_info/max_subgraph.txt', 'w') as w:
        w.write(str(len(largest_components))+'\n')
        for i in largest_components:
            w.write(i+'\n')
if  __name__ == "__main__":
    
    df = pd.read_csv('GOT.csv')
    G1=nx.Graph()
    G2=nx.Graph()

    G1 = graph(G1, df, False)
    G2 = graph(G2, df, True)

    # for i in cent_name:
    #     g = graph(nx.Graph(), df, True)
    #     centrality(i, g)
    
    #find_community(G1)
    max_subgraph(G1)

    
    
   

    
    

