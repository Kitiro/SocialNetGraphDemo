# -*- coding: utf-8 -*-

import os
import networkx as nx
import time;  

#DATA_DIR="D:/workspace/network/code"
DATA_DIR=""
PERSON_PATH=os.path.join(DATA_DIR,"person.txt")
RELATION_PATH=os.path.join(DATA_DIR,"relation.txt")
PAGERANK_PATH=os.path.join(DATA_DIR,"pagerank.txt")
PAGERANK_SORTED_PATH=os.path.join(DATA_DIR,"pagerank_sorted.txt")
#CENTRALITY_PATH=os.path.join(DATA_DIR,"centrality.txt")
#CENTRALITY_SORTED_PATH=os.path.join(DATA_DIR,"centrality_sorted.txt")
CLUSTER_PATH=os.path.join(DATA_DIR,"cluster.txt")
CLUSTER_SORTED_PATH=os.path.join(DATA_DIR,"cluster_sorted.txt")
personfile=open(PERSON_PATH,"r")
relation=open(RELATION_PATH,"r")
pagerank=open(PAGERANK_PATH,"w")
pagerank_sorted=open(PAGERANK_SORTED_PATH,"w")
#centrality=open(CENTRALITY_PATH,"w")
#centrality_sorted=open(CENTRALITY_SORTED_PATH,"w")
cluster=open(CLUSTER_PATH,"w")
cluster_sorted=open(CLUSTER_SORTED_PATH,"w")

G = nx.Graph()
name=[]

persons=personfile.readlines()
for person in persons:
    node=person.split(',') 
    n=int(node[1])
    G.add_node(n) 
personfile.close()
    
edges=relation.readlines()
for edge in edges:
    edge=edge.split(',')
    n1=int(edge[0])                                    
    n2=int(edge[1])
    w=int(edge[2])
    G.add_edge(n1,n2,size=w)
relation.close()
del edges

#nx.draw(G)  

#点数、边数
print "number_of_nodes: %d" %(G.number_of_nodes())   
print "number_of_edges: %d" %(G.number_of_edges())   
#print G.edges() 
#print G.nodes() 

#连通分量
print "number_of_connected_components: %d" %(nx.number_connected_components(G))
print "size_of_largest_connected_component: %d" %(len(list(nx.connected_components(G))[0]))

#PageRank
pranklist = []
prank=nx.pagerank(G)
for person in persons:
    node=person.split(',') 
    print >> pagerank, "%d,%s,%f" % (int(node[1]),node[0],prank[int(node[1])])
    pranklist.append([int(node[1]),node[0],prank[int(node[1])]])
pranklist = sorted(pranklist, key=lambda x : x[2], reverse = True)
print "max pagerank %f" % (pranklist[0][2])
i=0
rank=0
temp=0.0
for node in pranklist:
    i+=1
    if temp != node[2]:
        rank=i
    temp=node[2]
    print >> pagerank_sorted, "%d,%s,%f,%d" % (node[0],node[1],node[2],rank)
pagerank.close()
pagerank_sorted.close()
del prank
del pranklist

#聚集系数
time_start=time.time();#time.time()为1970.1.1到当前时间的毫秒数  

clulist = []
clu=nx.clustering(G)
print len(clu)

time_end=time.time();#time.time()为1970.1.1到当前时间的毫秒数  
print time_end-time_start

for person in persons:
    node=person.split(',') 
    print >> cluster, "%d,%s,%f" % (int(node[1]),node[0],clu[int(node[1])])
    clulist.append([int(node[1]),node[0],clu[int(node[1])]])
clulist = sorted(clulist, key=lambda x : x[2], reverse = True)
print "max cluster %f" % (clulist[0][2])
i=0
rank=0
temp=0.0
for node in clulist:
    i+=1
    if temp != node[2]:
        rank=i
    temp=node[2]
    print >> cluster_sorted, "%d,%s,%f,%d" % (node[0],node[1],node[2],rank)


cluster.close()
cluster_sorted.close()
del clu
del clulist


##中心性
#cenlist = []
#time_start=time.time();#time.time()为1970.1.1到当前时间的毫秒数 
#cen=nx.betweenness_centrality(G)
#time_end=time.time();#time.time()为1970.1.1到当前时间的毫秒数  
#print time_end-time_start, 
#for person in persons:
#    node=person.split(',') 
#    print >> centrality, "%d,%s,%f" % (int(node[1]),node[0],cen[int(node[1])])
#    cenlist.append([int(node[1]),node[0],cen[int(node[1])]])
#cenlist = sorted(cenlist, key=lambda x : x[2], reverse = True)
#print "max centrality %f" % (cenlist[0][2])
#i=0
#for node in cenlist:
#    i+=1
#    print >> centrality_sorted, "%d,%s,%f,%d" % (node[0],node[1],node[2],i)
#centrality.close()
#centrality_sorted.close()
#del cen
#del cenlist

##a,b间最短路
#a=1
#b=20000
#try:
#    length=nx.shortest_path_length(G,a,b)
#    path=nx.shortest_path(G,a,b)
#    print "shortest_path from %d to %d (length=%d): %s" %(a,b,length,path)
#except nx.NetworkXNoPath:
#    print 'No path from %d  to %d' %(a,b)

#H = list(nx.connected_component_subgraphs(G))[0]
#print "find H"
#print "average_shortest_path_length: %d" %(nx.average_shortest_path_length(H))

