const Discord = require('discord.js')
const requireDir = require('require-dir');
const interactions = require('discord-slash-commands-client')
const bot = new Discord.Client()
var config = require('./conf.json') //keep as var to allow dynamic reloads at some point perhaps
var commands = requireDir('./commands', {noCache:true}) //don't cache to allow dynamic reloads
var registeredCommands = {} //used for tracking commands for reload, don't trust requireDir commands array to be safely writable

bot.interactions = new interactions.Client(config.token, config.uid)

function updateCMD(c) {
  registeredCommands[c.name] = c
  console.log(`[UPD] Added or updated command: ${JSON.stringify(c,null,2)}`)
}

bot.on('ready',_=>{
  console.log('poggers');
  Object.values(commands).forEach(cmd=>{
    bot.interactions
      .createCommand(
        cmd.cmdInfo,
        config.guildID // single-guild commands update instantly
      )
      .then(updateCMD)
      .catch(console.error)
  })
});

bot.on('interactionCreate', cmd => {
  if(commands[cmd.name]){
    commands[cmd.name].call(cmd)
  }
})

bot.on('message', msg=>{
  if(msg.author.id == config.admin && msg.content == '&reloadshit'){
    commands = requireDir('./commands', {noCache:true})
    Object.values(commands).forEach(cmd => {
      if(registeredCommands[cmd.cmdInfo.name]){ // update existing command
        bot.interactions
          .editCommand(
            cmd.cmdInfo,
            registeredCommands[cmd.cmdInfo.name].id,
            config.guildID
          )
          .then(updateCMD)
          .catch(console.error)
      }else{ //adding new command
        bot.interactions
          .createCommand(
            cmd.cmdInfo,
            config.guildID
          )
          .then(updateCMD)
          .catch(console.error)
      }
    })
    Object.values(registeredCommands).forEach(cmd => {
      if(!commands[cmd.name]){
        bot.interactions
          .deleteCommand(
            cmd.id,
            config.guildID
          ).then(c=>{
            console.log(c)
            delete registeredCommands[cmd.name]
            console.log(`[UPD]: Deleted Command ${cmd.name}`)
          })
          .catch(console.error)
      }
    })
  }
})

bot.login(config.token);
