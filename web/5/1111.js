//删除
function delerow(butdele){
	var r=confirm("是否删除该条记录？");
	if(r==true){
		var index=butdele.parentNode.parentNode.rowIndex;
		var table=document.getElementById("tele");
		table.deleteRow(index);
	}
}

//add
function add(){
    var fix = document.getElementById("fix");
    var bick= document.getElementById("bick")
    fix.style.display = "block";
	bick.style.display = "block";
}
function clos(){
   fix.style.display = "none";
}
//海报上传
var fileInput = document.getElementById('testfile');
var preview = document.getElementById('preview');

//信息上传
function change(){
	var name=document.getElementById("name").value;
	var sort=document.getElementById("sort").value;
	var act=document.getElementById("actor").value;
	var introduction=document.getElementById("inter").value;
	if(name==""||sort==""||act==""||introduction==""){
		alert("请正确输入！");return;
	}
	var newtable=document.createElement("tr");
	newtable.innerHTML="<td align='center'>"+fileInput+"</td>"+"<td align='center'>"+name+"</td>"+
		"<td align='center'>"+sort+"</td>"+"<td align='center'>"+act+"</td>"+
		"<td align='center'>"+introduction+"</td>"+
		"<td align='center'><input type='button' name='replace' value='修改'/>"+
		"<br /><br />"+"<input type='button' onclick='delerow(this)' value='删除'/>"+
		"</td>"+"</tr>";
	document.getElementsByTagName("tbody")[0].appendChild(newtable);
	//清空
	document.getElementById("name").value=null;
	document.getElementById("sort").value=null;
	document.getElementById("actor").value=null;
	document.getElementById("inter").value=null;
	
	fix.style.display = "none";
}
//修改
var index;
function modify1(obj){
	index=obj.parentNode.parentNode.rowIndex;
	var table=document.getElementById("tele");	
	var name,sort,act,intor;	
	for(var i=1;i<5;i++){
		var tr=table.rows[index].cells[i];
		if(i==1){name =tr.innerHTML;}
		if(i==2){sort =tr.innerHTML;} 
		if(i==3){act=tr.innerHTML;} 
		if(i==4){intor=tr.innerHTML;} 
	}
	document.getElementById("name").value=name;
	document.getElementById("sort").value=sort;
	document.getElementById("actor").value=act;
	document.getElementById("inter").value=intor;
	
	var fix = document.getElementById("fix");
	var bick= document.getElementById("bick")
	fix.style.display = "block";
	bick.style.display = "block";	
	
}
function modify2(){
	var name=document.getElementById("name").value;
	var sort=document.getElementById("sort").value;
	var act=document.getElementById("actor").value;
	var intor=document.getElementById("inter").value;
	if(name==""||sort==""||act==""||intor==""){
		alert("请正确输入！");return;
	}
	var table=document.getElementById("tele");
	for(var i=1;i<5;i++){
		var tr=table.rows[index].cells[i];
		if(i==1){tr.innerHTML = name}
		if(i==2){tr.innerHTML = sort} 
		if(i==3){tr.innerHTML = act} 
		if(i==4){tr.innerHTML = intor} 
	}
	 
	fix.style.display = "none";
	//清空
	document.getElementById("name").value=null;
	document.getElementById("sort").value=null;
	document.getElementById("actor").value=null;
	document.getElementById("inter").value=null;
}