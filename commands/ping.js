module.exports = {
  call: function(c){
    c.channel.send('pong!')
  },
  cmdInfo: {
    name: 'ping',
    description: 'pong ping!'
  }
}
