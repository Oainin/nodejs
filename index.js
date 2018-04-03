var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var localtunnel = require('localtunnel');
var port = 8888;
app.use(cookieParser());
/*session配置*/
app.use(session({
	resave: false, //添加 resave 选项  
	saveUninitialized: true, //添加 saveUninitialized 选项  
	secret: '12121212', //secret的值建议使用随机字符串
	cookie: {
		maxAge: 60 * 1000 * 30
	} // 过期时间（毫秒）
}));

/*post配置*/
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({
	extended: false
})
/*静态文件访问*/
app.use(express.static('public'));
/*跨域设置*/
//allow custom header and CORS
app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
	res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', true);
	if(req.method == 'OPTIONS') {
		res.send(200);
		/让options请求快速返回/
	} else {
		next();
	}
});


app.get('/upvideo',urlencodedParser, function(req, res) {
  console.log(req.files);
  //console.log(req.files);
  res.send(req.query.ad);
});
/*网页请求根目录*/
app.get('/', function(req, res) {
	res.send(req.session);
});
/*用户登录*/
app.get('/loginDo', function(req, res) {
	if(req.session.sign) { //检查用户是否已经登录
		console.log(req.session); //打印session的值
		res.send(req.session.user);
	} else {
		var promise = exports.selectByUsername(req.query.username);
		promise.then(function(value) {
			req.session.sign = true;
			req.session.user = value;
			//req.session.save();
			res.send(value);
			console.log(req.session.user + "loginDo");
			res.end();
		});
	}
});
/*判断登录*/
app.get('/loginOver', function(req, res) {
	console.log(req.session.user + "loginOver");
	if(req.session.sign) {
		res.send(req.session.sign);
	} else {
		req.session.sign = false;
		res.send(req.session.sign);
	}
	res.end();
});
/*备用音乐接口*/
app.post('/musiclist', urlencodedParser, function(req, res) {
	// 输出 JSON 格式
	res.end('');
});
/*用户信息*/
app.post('/user', urlencodedParser, function(req, res) {
	// 输出 JSON 格式
	var response = {
		"username": req.body.username,
		"password": req.body.password
	};
	//console.log(response);
	res.end(JSON.stringify(response));
});
/*上传音乐*/
app.post('/upmusic', urlencodedParser, function(req, res) {
	// 输出 JSON 格式
	var promise = exports.insertmusic(req.body.musicname);;
	console.log(req.body.musicname);
	promise.then(function(value) {
		// console.log(value);
		res.end(value);
	});

});
/*查询音乐列表*/
app.post('/seachmusic', urlencodedParser, function(req, res) {
	// 输出 JSON 格式
	var promise = exports.seachmusic();
	promise.then(function(value) {
		//console.log(value);
		res.end(value);
	});

});

/*nodejs开启*/
var server = app.listen(port, function() {

	var host = server.address().address
	var port = server.address().port

	console.log('当前端口号' + port)

});
/*内网穿透localtunnel*/
var opt = {
	subdomain: 'oaininamosoaininamos'
};
var tunnel = localtunnel(port, opt, function(err, tunnel) {
	if(err) {
		console.log(err + 'localtunnel报错！');
	}
	console.log(tunnel.url);
});

tunnel.on('close', function(s) {
	// tunnels are closed
	console.log('警报localtunnel停止！' + s);
});
/*数据库启动！*/
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'aimi12138',
	database: 'oainin'
});


var db;
function connect () {  
  db = connection;  
  db.connect(handleError);  
  db.on('error', handleError);  
}  
connect();
function handleError (err) {  
  if (err) {  
    // 如果是连接断开，自动重新连接  
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {  
      connect();  
    } else {  
      console.error(err.stack || err);  
    }  
  }  
}
/*用户登录*/
exports.selectByUsername = selectByUsername;

function selectByUsername(username) {

	var promise = new Promise(function(resolve) {
		var sql = "SELECT *  FROM user WHERE username = ?";
		var sqlParams = [username];
		connection.query(sql, sqlParams, function(err, result) {
			if(err) {
				return console.log(err.message);
			}
			console.log("------------------------开始查询---------------------");
			console.log(result);
			var str = JSON.stringify(result);
			var json = JSON.parse(str);
			//count = json[0].count;
			console.log("------------------------查询结束---------------------");
			resolve(str);
		});
		// connection.end();
	});
	promise.then(function(value) {
		//console.log(value);
		return value;
	});
	return promise;
}
/*音乐添加*/
exports.insertmusic = insertMusics;

function insertMusics(musicpath) {

	var promise = new Promise(function(resolve) {
		var sql = "insert into musiclist (id,musicname,musicuptime) values(0,?,now())";
		var sqlParams = [musicpath];
		connection.query(sql, sqlParams, function(err, result) {
			if(err) {
				return console.log(err.message);
			}
			console.log("------------------------开始查询---------------------");
			console.log(result);
			var str = JSON.stringify(result);
			var json = JSON.parse(str);
			//count = json[0].count;
			console.log("------------------------查询结束---------------------");
			resolve(str);
		});
		//connection.end();
	});
	promise.then(function(value) {
		// console.log(value);
		return value;
	});
	return promise;
};

/*查询音乐库音乐表*/
exports.seachmusic = seachMusic;

function seachMusic() {

	var promise = new Promise(function(resolve) {
		var sql = "SELECT *  FROM musiclist";
		connection.query(sql, function(err, result) {
			if(err) {
				return console.log(err.message);
			}
			console.log("------------------------开始查询---------------------");
			console.log(result);
			var str = JSON.stringify(result);
			var json = JSON.parse(str);
			//count = json[0].count;
			console.log("------------------------查询结束---------------------");
			resolve(str);
		});

	});
	promise.then(function(value) {
		//console.log(value);
		return value;
	});
	return promise;
};