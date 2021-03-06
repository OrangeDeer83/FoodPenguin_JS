var list_json;
var call_order;

window.onload = function(){
	get_deliever_info();
	change_page(1);
}

function change_page(num){
	for (var i = 1; i < 3; i++) {
		if (i == num) {
			document.getElementById("info" + i).setAttribute("style", "default");	
		}
		else{
			document.getElementById("info" + i).setAttribute("style", "display:none");	
		}
	}
	if (num == 2) {
		list_order_d();
		call_order = setInterval(list_order_d,60000);
	}
	else {
		clearInterval(call_order);
	}
}

function logout(){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://114.35.143.250:5000/api/Logout");
	xhr.onload = function(){
		var rsp_json = JSON.parse(xhr.responseText);
		if (rsp_json.rsp_code == "200") {
			alert("登出成功");
			window.location.href="http://114.35.143.250:5000/Food_Penguin/Index";
		}
		else {
			alert("登出失敗");
		}
	}
	xhr.send();
}

function update_onoffline(){
	var status = document.getElementById("status").value;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://114.35.143.250:5000/api/update_onoffline");
	xhr.setRequestHeader('Content-Type', 'application/json');
	if (status == "上線") {
			xhr.send(JSON.stringify({"status": "1"}));
		}
	else if (status == "下線") {
		xhr.send(JSON.stringify({"status": "0"}));
	}
	xhr.onload = function(){
		var rsp_json = JSON.parse(xhr.responseText);
		if (rsp_json.rsp_code == "200") {
			if (status == "上線") {
				alert("已上線");
			}
			else if (status == "下線") {
				alert("已下線");
			}
		}
		else {
			alert("狀態更新失敗，請再試一次");
		}
	}
}

function get_deliever_info(){
	var item = ["firstName", "lastName", "tel"];
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://114.35.143.250:5000/api/get_deliver_info");
	xhr.send();
	xhr.onload = function(){
		var rsp = xhr.responseText;
		var rsp_json = JSON.parse(rsp);
		for (var i = 0; i < 3; i++) {
			document.getElementById(item[i]).setAttribute("value", rsp_json[item[i]]);
			if (i == 2 && rsp_json[item[i]] == "") {
				document.getElementById(item[i]).setAttribute("value", "( )");
			}
		}
	};
}

function update_deliever_info(){
	var item = ["firstName", "lastName", "tel"];
	var correct = false;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://114.35.143.250:5000/api/update_deliver_info");
	xhr.setRequestHeader('Content-Type', 'application/json');
	var reg = /^[0-9\(\)]*$/;
	var firstName = document.getElementById('firstName').value;
	var lastName = document.getElementById('lastName').value;
	var tel = document.getElementById('tel').value;
	if (firstName == "" || lastName == "" || tel == "") {
		alert("所有欄位皆須填寫!!!");
	}
	else if (!reg.test(tel)){
		alert("電話請輸入數字!!!");
	}
	else {
		correct = true;
	}
	if (correct) {
		var json = {"firstName": firstName, "lastName": lastName, "tel": tel};
		xhr.send(JSON.stringify(json));
		xhr.onload = function(){
			var rsp = xhr.responseText;
			var rsp_json = JSON.parse(rsp);
			if (rsp_json.rsp_code == "200") {
				alert("修改成功");
			}
			else {
				alert("修改失敗");
			}
		}
	}
}

function list_order_d(){
	var xhr = new XMLHttpRequest;
	xhr.open("GET", "http://114.35.143.250:5000/api/list_order");
	xhr.onload = function(){
		list_json = JSON.parse(xhr.responseText);
		var add = "";
		for (var i = list_json.order.length - 1; i >= 0; i--) {
			add += "<tr><td><p type='button' data-toggle='modal' data-target='#storeModal' id='store_" + list_json.order[i][0] + "' onclick='get_order_d2s(" + list_json.order[i][0] + ");'>" + list_json.order[i][1] + "</p></td><td><p type='button' data-toggle='modal' data-target='#orderModal' onclick='get_order(" + list_json.order[i][0] + ");'>查看</p></td><td><p type='button' data-toggle='modal' data-target='#customerModal' id='customer_" + list_json.order[i][0] + "' onclick='get_order_d2c(" + list_json.order[i][0] + ");'>" + list_json.order[i][3]+ "</p></td><td><p id='status_" + list_json.order[i][0] + "'>";
			switch(list_json.order[i][4]) {
				case  1:
					add += "餐點製作中</p></td>";
					break;
				case  2:
					add += "餐點製作完成</p></td>";
						break;
				case  3:
					add += "送餐中</p></td>";
					break;
				case  4:
					add += "餐點已送達</p></td>";
					break;
				case  5:
					add += "完成</p></td>";
					break;
				default:
					add += "未知狀態</p></td>";
				}
			if (list_json.order[i][4] == "2") {
				add += "<td id='order_" + list_json.order[i][0] + "'><button class='btn btn-warning' onclick='update_order_status(" + list_json.order[i][0] + ");'>接收餐點</button></td></tr>";
				alert("餐點已完成，請取餐");
			}
			else if (list_json.order[i][4] == "3") {
				add += "<td id='order_" + list_json.order[i][0] + "'><button class='btn btn-warning' onclick='update_order_status(" + list_json.order[i][0] + ");'>餐點送達</button></td></tr>";
			}
			else {
				add += "<td></td></tr>";
			}
		}
		document.getElementById("order_list").innerHTML = add;
	}
	xhr.send();
}

function get_order_d2s(id){
	var xhr = new XMLHttpRequest;
	xhr.open("POST", "http://114.35.143.250:5000/api/get_order");
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({"ID": id}));
	xhr.onload = function(){
		var detail = JSON.parse(xhr.responseText);
		var add = "<p>" + document.getElementById("store_" + id).innerHTML + "</p><p>電話：" + detail.order[0] + "</p><p>地址：" + detail.order[1] + "</p>";
		document.getElementById("store_detail").innerHTML = add;
	}
}

function get_order(id){
	var xhr = new XMLHttpRequest;
	xhr.open("POST", "http://114.35.143.250:5000/api/get_order");
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({"ID": id}));
	xhr.onload = function(){
		var detail = JSON.parse(xhr.responseText);
		var add = "";
		var total = 0;
		for (var i = 0; i < detail.order[5].length; i++) {
			add += "<tr><td>" + detail.order[5][i][0] + "</td><td>" + detail.order[5][i][1] + "</td><td>" + detail.order[5][i][2] + "</td></tr>";
			total += parseInt(detail.order[5][i][1]) * parseInt(detail.order[5][i][2]);
		}
		document.getElementById("order_detail").innerHTML = add;
		document.getElementById("total").innerHTML = "$" + total;
	}
}

function get_order_d2c(id){
	var xhr = new XMLHttpRequest;
	xhr.open("POST", "http://114.35.143.250:5000/api/get_order");
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({"ID": id}));
	xhr.onload = function(){
		var detail = JSON.parse(xhr.responseText);
		var add = "<p>" + document.getElementById("customer_" + id).innerHTML + "</p><p>電話：" + detail.order[3] + "</p><p>地址：" + detail.order[4] + "</p>";
		document.getElementById("customer_detail").innerHTML = add;
	}
}

function update_order_status(id){
	var xhr = new XMLHttpRequest;
	xhr.open("POST", "http://114.35.143.250:5000/api/update_order_status");
	xhr.setRequestHeader('Content-Type', 'application/json');
	var status = 0;
	for (var i = 0; i < list_json.order.length; i++) {
		if (id == list_json.order[i][0]) {
			status = list_json.order[i][4] + 1;
		}
	}
	xhr.send(JSON.stringify({"ID": id, "status": status}));
	xhr.onload = function(){
		var rsp = JSON.parse(xhr.responseText);
		if (rsp.rsp_code == "200") {
			if (status == 3) {
				alert("已接收到餐點，送餐時請注意交通安全");
				list_order_d();
				/*document.getElementById("status_" + id).innerHTML = "送餐中";
				document.getElementById("order_" + id).innerHTML = "<button class='btn btn-warning' 'onclick='update_order_status(" + id + ");'>餐點送達</button>"*/
			}
			else if (status == 4) {
				alert("已通知顧客取餐，請稍後");
				list_order_d();
				/*document.getElementById("status_" + id).innerHTML = "餐點已送達";
				document.getElementById("order_" + id).innerHTML = "";*/
			}		
		}
		else {
			alert("訂單流程錯誤，請聯繫客服人員，謝謝!");
		}
	}
}