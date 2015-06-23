var app = require("express")();
var mysql = require("mysql");
var server_handler = function(req, res) {
    // res.writeHead(404);
    //res.end();
};
var http = require("http").Server(server_handler);
var io = require("socket.io")(http);
var async = require("async");

app.get("/", function(req, res) {
//    res.sendFile(__dirname + '/mainmessage.html');
});
var allusers = {};
var userBag = {};
var cons = [];
var allUsersId = [];
var newUserNotify = [];


//app.get("/", function (req, res) {
//    res.sendFile(__dirname + '/mainmessage.html');
//});

io.on('connection', function(socket) {
    var session_name;
//    
    console.log("user connected");

    socket.on('login', function(cred) {
        mi = cred;
        session_name = mi.name;
        if (userExist(session_name) === false) {
            //add to list of sockets for broadcast;
            cons.push(socket);
            //add to map  for individual messaging
            allusers[session_name] = socket;
            // add user information to an array for info sharing
            userBag[session_name] = mi;
            userList = Object.keys(allusers);
            console.log(session_name + " jst logged on");
            allUsersId = userList;
            socket.emit("login_success", userBag);
            async.each(cons, function(user) {
                if (user !== allusers[session_name]) {
                    user.emit("user_in", mi);
                }
            }, function(err) {
            });
//            socket.emit("note","should login")
        } else {
//            socket.emit("note", "user already exist");
        }
    });


    socket.on("resume", function(data) {
        mi = data;
        session_name = mi.name;
//        console.log(data.name);
        cons.push(socket);

        //add to map  for individual messaging
        allusers[session_name] = socket;
        // add user information to an array for info sharing
        userBag[session_name] = mi;
        userList = Object.keys(allusers);
        console.log(session_name + " jst came on");
        allUsersId = userList;

        socket.emit("login_success", userBag);
        console.log(session_name + " jus resumed");
        async.each(cons, function(user) {
            if (user !== allusers[session_name]) {
                user.emit("user_in", mi);
            }
//                user.emit("user_in", mi);
        }, function(err) {
        });
    });

    socket.on("call_finished", function(data) {
        socket.emit("login_success", userBag);
        console.log(session_name + " finished a call");
//        async.each(cons, function(user) {
////               if(user!==allusers[session_name]){
//            user.emit("user_in", mi);
////                }   
////                user.emit("user_in", mi);
//        }, function(err) {
//        });
    });

    socket.on("videoRequest", function(data) {
        console.log(data);
        from = data.from;
        to = data.to;
        msg = data.msg;
//        console.log(data);
        if (getMap(to) == -1) {
            console.log("user not online");
            socket.emit("videoRequestFailed", "failed");
//            
            return;
        } else {
            console.log("trying to send video request from " + from)
            getMap(to).emit("videoRequest", from);
        }
    });

    socket.on("note", function(note) {
        console.log(note);
    });

    socket.on("audio_accept", function(user) {
//        console.log(user);
        rcvr = userExist(user);
        if (rcvr === false) {
            socket.emit("callFailed", {val: "Sorry User's not reachable"});
        } else {
            rcvr.emit("start_audio_call", session_name);
            socket.emit("start_audio_call", user);
//            rcvr.emit("incomingAudio",Qaudio);
        }
    });

    socket.on("video_accept", function(user) {
        console.log("vid call accepted");
        rcvr = userExist(user);
        if (rcvr === false) {
            socket.emit("callFailed", {val: "Sorry User's not reachable"});
        } else {
            rcvr.emit("start_video_call", session_name);
            socket.emit("start_video_call", user);
//            rcvr.emit("incomingAudio",Qaudio);
        }
    });

    socket.on("call_aborted", function(user) {
        console.log(session_name + " aborted call to " + user);
        rcvr = userExist(user);
        if (rcvr === false) {
            socket.emit("callFailed", {val: "Sorry User's not reachable"});
        } else {
            rcvr.emit("missed_call", session_name);
            socket.emit("call_ended", user);
//            rcvr.emit("incomingAudio",Qaudio);
        }//to=user;
    });

    socket.on("audio_rejected", function(user) {
        console.log(session_name + " rejected call from " + user);
        rcvr = userExist(user);
        if (rcvr === false) {
            socket.emit("callFailed", {val: "Sorry User's not reachable"});
        } else {
            rcvr.emit("audio_call_rejected", session_name);

            socket.emit("login_success", userBag);
            console.log(session_name + " finished a call");
        }
//to=user;

    });



    socket.on("audioCall", function(who) {
        Qaudio = {
            from: session_name
        };
        rcvr = userExist(who);
        if (rcvr === false) {
            socket.emit("callFailed", {val: "Sorry User's not reachable"});
        } else {
            rcvr.emit("incomingAudio", Qaudio);
        }

//        console.log(note);
    });
    socket.on("videoCall", function(who) {
        Qvideo = {
            from: session_name
        };
        rcvr = userExist(who);
        if (rcvr === false) {
            socket.emit("callFailed", {val: "Sorry User's not reachable"});
        } else {
            rcvr.emit("incomingVideo", Qvideo);
        }

//        console.log(note);
    });

    socket.on("vid_accepted", function(data) {
        from = data.from;
        to = data.to;
        msg = data.msg;
//        console.log(data);
        if (getMap(to) == -1) {
            console.log("user not online");
            return;
        } else {
            getMap(to).emit("vid_accepted", msg);
        }
    });


    socket.on("vid_rejected", function(data) {
        console.log("video call rejected");
        console.log("here" + data);
        getMap(data).emit("video_rej", data);
    });

    //    vid_accepted
    socket.on('pm', function(info) {
//        sender = info.sender;
//        reciever = info.reciever;
//        message = info.message;
//        
//        $.post("http://192.168.1.2/dash/uname2id")



//    console.log(sender + reciever + message);
        // allusers[reciever].emit("pm", info);

        add_status(info, function(res) {
            if (res) {


                console.log("sending message to " + info.user2id);
//            console.log(status);
                if (getMap(info.user2id) == -1) {
                    console.log("user not online");
                    if (getMap(info.user1id) == -1) {
                        console.log("u self no dey  online");
                    } else {
                        getMap(info.user1id).emit("status_sent", info);
//                        return;
                    }
                }
                else {
                    getMap(info.user2id).emit("message", info);
                    if (getMap(info.user1id) == -1) {
                        console.log("u self no dey  online");
                    } else {
                        getMap(info.user1id).emit("status_sent", info);
//                    return;
                    }
//                    getMap(info.user1id).emit("status_sent", info);
//                    getMap(info.user2id).emit("status_added", info);
//                    getMap(info.user2id).emit("pm", info);
                }

//                console.log("info    " +info);
//                io.emit('status_added', info);

//                if (getMap(info.user2id) == -1) {
//                    console.log("user not online");
//                    return;
//
//                } else {
//                    getMap(info.user2id).emit("status_added", info);
//                    getMap(info.user2id).emit("pm", info);
//                }
// getMap(info.user1id).emit("status_sent", info);
            } else {
                io.emit('error');
            }
        });
    });

    socket.on('disconnect', function() {
        console.log(session_name + " went Offline");
//        delete allusers[uid];
//        allUsersId.splice(allUsersId.indexOf(uid), 1);
//       delete allUsersId[];
//        console.log("some one went off " + allUsersId);
//        userList = Object.keys(allusers);
        async.each(cons, function(user) {
            user.emit("wentOffline", session_name);
//            console.log("Update Sent to ");
        }, function(err) {
        });
    });

    socket.on("video", function(data) {
//        console.log(data);
        from = data.from;
        to = data.to;
        msg = data.msg;
//        console.log(data);
        if (getMap(to) == -1) {
            console.log("user not online!!!! " + to + "!!! from " + from);
            return;
        } else {
            console.log("emiting video " + from);
            getMap(to).emit("video", msg);
        }

// getMap(info.user2id).emit("pm", info);

    });

});

// to check of a user is in the userlist (returns a value)
function userExist(k) {
//    console.log(allusers[k]);
//allusers[k];
    if (!allusers[k]) {
        console.log("user doesnt exist");
        return false;
    } else {
        return allusers[k];
    }

}

//http.listen(8000);
http.listen(8000, function() {
    console.log("QtAlk on: 8832");
});
