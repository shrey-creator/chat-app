const express =require('express');
const socketio=require('socket.io');
const http = require('http');
const PORT=process.env.PORT || 5000;
const router = require('./router');
const {addUser,removeUser,getUsers,getUsersInRoom}=require('./users');


const app=express();
const server=http.createServer(app);
const io=socketio(server);

io.on('connection',(socket)=>
     {
         console.log("we have a connection");
         socket.on('join',({name,room},callback)=>{
             const {error,user}=addUser({id:socket.id,name,room});

             if(error) return callback(error);
             socket.emit('message',{user:'admin',text:`${user.name} welcome to the room ${user.room}`});
             socket.broadcast.to(user.name).emit('message',{user:'admin' , text:`${user.name} has joined`});
             socket.join(user.room);

             io.to(user.room).emit('roomData',{room : user.room ,users :getUsersInRoom(user.room)});

             callback();
         });

        socket.on('sendMessage',(message,callback)=>{
            const user=getUsers(socket.id);
            console.log(message);
            io.to(user.room).emit('message',{user:user.name,text:message})
            io.to(user.room).emit('roomData',{room : user.room ,users :getUsersInRoom(user.room)});
            callback();

        });
        socket.on('disconnect', ()=>{const user=removeUser(socket.id);
        });
     });


app.use(router);
server.listen(PORT,()=>console.log(`Server has started on port ${PORT}`));