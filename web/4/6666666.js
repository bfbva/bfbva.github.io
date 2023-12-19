var income = 
{
	fre: 3500,
	free: [
		{low: 0, high: 1500, rate: 0.03, sub: 0},
		{low: 1500,high:4500, rate: 0.10, sub:105},
		{low: 4500,high:9000, rate: 0.20, sub:555},
		{low: 9000, high: 35000, rate: 0.25, sub:1005},
		{low: 35000, high: 55000, rate: 0.30, sub:2755},
		{low: 55000, high: 80000, rate: 0.35, sub: 5505},
		{low: 80000, high: 1000000000000, rate:0.45, sub:13505}
	],
};

function Month(month){
	var m=month-income.fre;
	var tax=0;
	for(i in income.free){
		if(m>income.free[i].low&&m<=income.free[i].high){
			tax+=m*income.free[i].rate-income.free[i].sub;
		}
	}
	return Math.round(tax);  
}

function Year(month, bonus)
{
	var m=month-income.fre;
	var t;
	var Tax = 0;
	if(m >= 0) t = bonus/12;
	else t = (bonus+m)/12;
	for(i in income.free){
		if(t>income.free[i].low&&t<=income.free[i].high){
			Tax+=t*income.free[i].rate-income.free[i].sub;
		}
	}
	return Math.round(Tax);
}

function Prints()
{
	var x=document.getElementById("month").value;
	var y=Math.random()*x*15;
	document.getElementById("bonus").value=Math.round(y);
	
	document.getElementById("monthmoney").value=Month(x);
	document.getElementById("bonusmoney").value=Year(x,y);
	document.getElementById("sum").value=Month(x)*12+Year(x,y);
}

	var ex=new Array(3500,7000,10000,15000,50000,80000,100000);
				
	document.write("<table border=2 cellspacing=0 align='center'> ")
	    document.write("<tr align='center'>");
	    document.write("<th width='100'> 月工资</th>");document.write("<th width='100'> 奖金</th>");document.write("<th width='100'> 每月所得税</th>");
	    document.write("<th width='100'> 一次性所得税</th>");document.write("<th width='100'> 全年所得税 </th>");
	    document.write("</tr>");
    for(var i in ex){
		var j1=ex[i];var j2=(ex[i]*12*Math.random()).toFixed(0);
	    var j3=Month(j1);var j4=Year(j1,j2);var j5=Month(j1)*12+Year(j1,j2);
	    document.write("<tr align='center'>");
	    document.write("<td>"+j1+"</td>");document.write("<td>"+j2+"</td>");document.write("<td>"+j3+"</td>");
	    document.write("<td>"+j4+"</td>");document.write("<td>"+j5+"</td>");
	    document.write("</tr>");		
	}
	    				
    document.write("</table>");	



