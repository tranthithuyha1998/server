//==== awesomechat.js ====

var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server),
users = {};
server.listen(process.env.PORT || 3000);  
app.use(express.static(__dirname + '/public'));
var fs = require("fs");
/*
app.get('/', function(req, res){
res.status(200).send('OK')
});
*/
var message="Self Driving Car";
var image;
var captime;
var androidClients = [];
var nhanDuoc = false;
var car_status;
var img_text;
var poweroff=true;

app.get("/", (req, res) => { res.render(__dirname + "/index.ejs", { message:message, image:image, captime:captime }); });

//Thông báo có thiết bị kết nối
io.sockets.on('connection',function(socket){
    console.log("There is a new device connected to server !!!");

/*

-> event: from-android
-> value: {"request":"start, stop, speed_fast, speed_slow, getpic"}

<- event: car-status
<- value: {"status":"stop, running, lost", "speed":"45312"}

*/

/*
    socket.on('car-isTracking',function(mode){
      console.log("CAR is connected !");
      message = "CAR is connected !"
      socket.emit('car-off',{status: poweroff});
      //Add Android ID to an array
      androidClients.push(socket.id);
      socket.on('disconnect',function(){
          //Remove from the list if disconnected
          androidClients.splice(androidClients.indexOf(socket.id),1);
          console.log('\n\nID: '+ socket.id);
          console.log('Android Client got disconnect');
      });
    })
*/

/*
    socket.on('car-on',function(mode){
      console.log("CAR is connected !")
      message="CAR is tracking !";
      poweroff=false;
      androidClients.forEach(function(entry){
          console.log("inform android car on");
          io.sockets.connected[entry].emit('car-off',{status: poweroff});
       });

      socket.on('disconnect',function(){
        poweroff=true;
        car_status=null;
        img_text=null;
        socket.emit("reconnect",true);
        androidClients.forEach(function(entry){
            io.sockets.connected[entry].emit('car-off',{status: poweroff});
            console.log("inform android car off");
         });
      })
    })
*/
    //Raspberry send status
    socket.on('car-speed',function(info){
        speed=info;
        console.log("Server has received speed of car!\n");
        nhanDuoc = true;
        //Gửi tới tất cả device
        io.sockets.emit('car-send-speed-ok',{status : nhanDuoc});
        var string = JSON.stringify(speed);
        var objectValue = JSON.parse(string);
        // goi len android

        /// 
        image=null
        captime=null
        speed =objectValue['Speed'];
        message="Speed: "+ speed;
        // else{message="Lost "+objectValue['lostTime']+"s"}
    })
    nhanDuoc=false;

    //Raspberry send image information
    socket.on("car-send-img", function(img_info) {
      img_text=img_info;
      console.log("Server has received image!\n");
      nhanDuoc = true;
      io.sockets.emit('car-send-img-ok',{status : nhanDuoc});
      var string = JSON.stringify(img_text);
      var objectValue = JSON.parse(string);
      // goi len android

      //
      speed=null
      message=null
      image=objectValue['Image'];
      captime=objectValue['CapTime'];
    })

    // -> event: from-android
    // -> value: {"request":"start, stop, speed_fast, speed_slow, getpic"}
    socket.on("from-android", function(info){
        console.log("Android device is connected !")
        
        request = info;
        var string = JSON.stringify(request);
        var objectValue = JSON.parse(string);
        console.log(objectValue);
        message = "Android device is connected!: "+objectValue;
        var caseRequest = objectValue["request"];
        switch(caseRequest){
            case "start": 
                // gởi xuống raspi lệnh start
                break;
            case "stop":
                // gởi xuống raspi lệnh stop
                break;
            case "speed_fast":
                // gởi xuống raspi lệnh speed_fast
                break;
            case "speed_slow":
                // gởi xuống raspi lệnh speed_slow
                break;
            case "getpic":
                // gởi xuống  request get pic
                // nhận pic từ raspi
                // gởi pic đến android, name event: send-img, value: {"Image":"txt_img", "CapTime":"timer"}
                break;
            default:
                break;
        }
    })

    // <- event: car-status
    // <- value: {"status":"stop, running, lost", "speed":"45312"}
    socket.on('requestStatus',function(){

    	// console.log("Sending car status to Android");
    	// socket.emit('car-status', car_status);
    })

    //Android client request img
    socket.on('client-request-img',function(){
      console.log("Sending image information to Android");
      //console.log(img_text)
      socket.emit('server-send-img', img_text);
    })
});
/*
io.sockets.on('connection', function(socket){
socket.on('new user', function(name, data){
        if (name in users){
            data(false);
        }else{
            data(true);
        socket.nickname = name;
        users[socket.nickname] = socket;
        console.log('add nickName');
        updateNickNames();
    }

});

function updateNickNames(){
    io.sockets.emit('usernames', Object.keys(users));
}
socket.on('open-chatbox', function(data){
    users[data].emit('openbox', {nick: socket.nickname});
});
socket.on('send message',function(data, sendto){
    users[sendto].emit('new message',{msg: data, nick: socket.nickname, sendto: sendto});
    users[socket.nickname].emit('new message',{msg: data, nick: socket.nickname, sendto: sendto});

    console.log(data);
});
socket.on('disconnect', function(data){
    if (!socket.nickname) return;
    delete users[socket.nickname];
    updateNickNames();
});
});
*/