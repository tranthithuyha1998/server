var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server),
users = {};
server.listen(process.env.PORT || 3000);  
app.use(express.static(__dirname + '/public'));
var fs = require("fs");

var message="Self Driving Car";
var deviceConnect;
var image;
var captime;
var androidClients = [];
var nhanDuoc = false;
var car_status;
var img_text;
var poweroff=true;
var nhanDuoc1 = false;
var androidClients = [];
app.get("/", (req, res) => { res.render(__dirname + "/index.ejs", { message:message, image:image, captime:captime }); });

//Thông báo có thiết bị kết nối
io.sockets.on('connection',function(socket){

    socket.on("android-connect", function(mode){
        console.log("There is a new device connected to server !!!");
        console.log("Android connected! ID: "+socket.id);
        androidClients.push(socket.id);
    })

/*
-> event: from-android
-> value: {"request":"start, stop, speed_fast, speed_slow, getpic"}
<- event: car-status
<- value: {"status":"stop, run, lost", "speed":"45312"}
*/
    //Raspberry send status
    socket.on('car-send-stt',function(info){
        stt=info;
        console.log("Server has received stt of car!\n");
        nhanDuoc = true;
        //Gửi tới tất cả device
        io.sockets.emit('car-send-stt-ok',{status : nhanDuoc});
        var string = JSON.stringify(stt);
        var objectValue = JSON.parse(string);
        // goi len android
        io.sockets.emit("car-status", stt)
        /// 
        image=objectValue['Image'];
        captime=objectValue['CapTime'];
        speed =objectValue['speed'];
        Stt = objectValue['status']

        if (Stt=="Run"){
           message ="Status: Car is running,       " + "Speed: "+ speed;
           image =null;
           captime =null;
        }
        if(Stt=="Stop"){
            message="Waring: 危ないよ！！！！　　　　";
        }
        if(Stt =="Lost"){
            message ="Status: Opps! where I am now?";
        }
        // message="Status: "+ Stt+" ---" + "Speed: "+ speed + "  device: " + androidClients;
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
      io.sockets.emit("send-img", img_text)
      //
      speed=null
      message=null
      image=objectValue['Image'];
      captime=objectValue['CapTime'];
    })

    // -> event: from-android
    // -> value: {"request":"start, stop, speed_fast, speed_slow, getpic"}
    socket.on("from-android", function(info){
        console.log("Android device is connected !");
        // EmitAgaint: while(true){
            request = info;
            var string = JSON.stringify(request);
            var objectValue = JSON.parse(string);
            console.log(objectValue);
            // message = "Android device is connected!: "+objectValue;
            var caseRequest = objectValue["request"];
            console.log("receive from Android: "+objectValue)
            switch(objectValue){
                case "start": 
                    io.sockets.emit("from-server", "start")
                    // gởi xuống raspi lệnh start
                    break;
                case "stop":
                    io.sockets.emit("from-server", "stop")
                    socket.on('disconnect',function(){
                        //Remove from the list if disconnected
                        androidClients.splice(androidClients.indexOf(socket.id),1);
                        console.log('\n\nID: '+ socket.id);
                        console.log('Android Client got disconnect');
                    });
                    // gởi xuống raspi lệnh stop
                    break;
                case "speed_fast":
                    io.sockets.emit("from-server", "fast")
                    // gởi xuống raspi lệnh speed_fast
                    break;
                case "speed_slow":
                    io.sockets.emit("from-server", "slow")
                    // gởi xuống raspi lệnh speed_slow
                    break;
                case "getpic":
                    io.sockets.emit("from-server", "getpic")
                    // gởi xuống  request get pic
                    // nhận pic từ raspi
                    // gởi pic đến android, name event: send-img, value: {"Image":"txt_img", "CapTime":"timer"}
                    break;
                default:
                    break;
            }
            let counter = 0;
            const intervalId = setInterval(() => {
            counter += 1;
            if (counter === 2) {
                // console.log('Done');
                clearInterval(intervalId);
            }
            }, 1000);
            if (nhanDuoc1==false){
                console.log("receive from Android Fail: "+objectValue)
                io.sockets.emit('car-disconnect', true)
            }
            else{
                nhanDuoc1 = false
                stt={"status":objectValue,"speed":"..."}
                console.log("receive from Android OK: "+objectValue)
                io.sockets.emit("car-status", stt)
            }
            // await sleep(1000)
        //     if (nhanDuoc1==false)
        //         continue EmitAgaint;
        //     break;
        // }
    })

    socket.on('from-server-ok', function(info){
        nhanDuoc1=true
    })

    // <- event: car-status
    // <- value: {"status":"stop, running, lost", "speed":"45312"}
    socket.on('requestStatus',function(){
        io.sockets.emit("requestStatus")
        // timeout=10s => againt

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

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 