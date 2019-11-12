/*
convert co-apperance to relation&weight
tips:
	map<struct,vaule>
	UTF8toGB2312
2017.12.08 
*/ 

#include<iostream>
#include<fstream>
#include<string>
#include<map>
#include<vector>
#include<windows.h>
#include<algorithm>
using namespace std;

#define MAX 10010 //maximum chars each line

struct friends{
	string per1,per2;
	friends(string a, string b): per1(a), per2(b) {}  
	//实现map中结构体作为key的关键 ：重载小于号 
	bool operator < (const friends &other) const
	{
		if(per1<other.per1)
			return true;
		else if(per1==other.per1&&per2<other.per2)//不可取等 
			return true;
		else
			return false;
	};  
};

string min_string(string x,string y)
{
	if(x<=y)
		return x;
	return y;
}

string max_string(string x,string y)
{
	if(x>y)
		return x;
	return y;
}

vector<string> split_by_char(string str,char ch)
{
	vector<string> strspt;
	while(str.find(ch)!=string::npos)
	{
		int x=str.find(ch);
		string temp=str.substr(0,x);
		strspt.push_back(temp);
		str.erase(0,x+1);
	}
	return strspt;
}

// 解决utf-8中文字符读入问题  
//读入后用该函数转换，可正常显示、输出 
string UTF8ToGB(const char* str)
{
     string result;
     WCHAR *strSrc;
     LPSTR szRes;

     //获得临时变量的大小
     int i = MultiByteToWideChar(CP_UTF8, 0, str, -1, NULL, 0);
     strSrc = new WCHAR[i+1];
     MultiByteToWideChar(CP_UTF8, 0, str, -1, strSrc, i);

     //获得临时变量的大小
     i = WideCharToMultiByte(CP_ACP, 0, strSrc, -1, NULL, 0, NULL, NULL);
     szRes = new CHAR[i+1];
     WideCharToMultiByte(CP_ACP, 0, strSrc, -1, szRes, i, NULL, NULL);

     result = szRes;
     delete []strSrc;
     delete []szRes;

     return result;
}

int main()
{
	ifstream in("entity_person.txt");
	ofstream outr("relation.txt");
	ofstream outp("person_dictionary.txt");
	map<friends,int> relation;
	map<string,int> personlist;
    char line_utf8[MAX+2];
    string line;
    
    int cnt=0;
    printf("current lines :\n");
    
    //统计节点间关系（边） 
	while(!in.eof())
	{
		cnt++;
		in.getline(line_utf8,MAX);
		line=UTF8ToGB(line_utf8);
		vector<string> temp_person = split_by_char(line,',');
		
		//check personlist
		for(int i=0;i<temp_person.size();i++)
			if(personlist.find(temp_person[i])==personlist.end())
				personlist.insert(make_pair(temp_person[i],1));
		
		//count relations
		for(int i=0;i<temp_person.size()-1;i++)
		{
			for(int j=i+1;j<temp_person.size();j++)
			{
				string x=min(temp_person[i],temp_person[j]);
				string y=max(temp_person[i],temp_person[j]); 
				friends temp(x,y);
				if(relation.find(temp)!=relation.end())
				{
					relation[temp]++;
				}
				else
				{
					relation.insert(make_pair(temp,1));
				}
			}
		}
		
		if(cnt%500==0)
			printf("%d\n",cnt);
			
	}
	in.close();
	printf("count fin\n");
	
	//文件输出 
	printf("writing files...\n");
	int k=0;
	for(map<string,int>::iterator p=personlist.begin();p!=personlist.end();p++)
	{
		k++;
		p->second=k;
		outp<<p->first<<','<<k<<endl;
	}
	outp.close();
	printf("write person file fin\n");
	
	for(map<friends,int>::iterator p=relation.begin();p!=relation.end();p++)
	{
		outr<<personlist[p->first.per1]<<','<<personlist[p->first.per2]<<','<<p->second<<endl;
	}
	outr.close();
	printf("write relation file fin\n");
	
	return 0;
}












