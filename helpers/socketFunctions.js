module.exports.socketResponse = (socket) => {
    socket.on('test-socket', (data)=>{
        console.log("Socket Configured Successfully...");
    })
}