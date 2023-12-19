function isprime(n){
	for(var i=2;i<=Math.sqrt(n);i++){
		if(n%i==0){
			return false;break;
		}
	}
	return true;
}
function calc100(){
	document.write("<table border='1'>");
	
	var n=1;
	for(var i=0;i<10;i++){
		document.write("<tr>");
		for(var j=1;j<=10;j++){
			if(isprime(n)==true){
				document.write("<td bgcolor='D4E5EF' height='50px' width='50px'> ");
				document.write(i*10+j);document.write("</td>");
			}
			if(isprime(n)==false){
				document.write("<td bgcolor='E7CAD3' height='50px' width='50px'>");
				document.write(i*10+j);document.write("</td>");
			}
			n++;
		}
		document.write("</tr>");
	}
}