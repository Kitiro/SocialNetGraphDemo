#include <stdio.h>
#include <stdlib.h>
#include<iostream>  
#include<fstream>  
#include<string>  

using namespace std;

ifstream in;  
ofstream out1,out2;  

void omit(string &line,string str)
{
	while(line.find(str)!=string::npos)
	{
		int x=line.find(str);
		line.erase(x,str.length());
	}
}

void get_text(string line)
{
	int x,y;
    string temp;
	x=line.find("\"");
	x=line.find("\"",x+1);
	x=line.find("\"",x+1);
	y=line.find("\"",x+1);
	temp=line.substr(x+1,y-x-1);
	omit(temp,"\\n");
    out1<<temp<<endl; 
}

void get_person(string line)
{
	int x,y;
	string temp;
	x=line.find("\"");
	x=line.find("\"",x+1);
	x=line.find("\"",x+1);
	y=line.find("\"",x+1);
	temp=line.substr(x+1,y-x-1);
	out2<<temp<<",";
	while(line.find("]")==string::npos) 
	{
		getline(in, line);
		x=line.find("\"");
		y=line.find("\"",x+1);
		temp=line.substr(x+1,y-x-1);
		out2<<temp<<",";
	}
	out2<<endl;
}

int main() 
{
	string line;  
    in.open("news.txt");  
    out1.open("text.txt");  
    out2.open("person.txt");  
    int flag=0;
    while(getline(in, line))  
    {
    	if(line.find("\"Text\"")!=string::npos)
	    	get_text(line);
		else if(line.find("\"Entity_Person\"")!=string::npos)
			get_person(line);
	} 
	return 0;
}
