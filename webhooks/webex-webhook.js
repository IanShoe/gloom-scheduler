const Framework = require('webex-node-bot-framework');
const webhook = require('webex-node-bot-framework/webhook');

const scenarioService = require('../data-services/scenario-service');
const votingService = require('../data-services/voting-service');

const framework = new Framework({
  webhookUrl: 'http://54.209.227.191/api/gloombot',
  token: 'ZjcwNjMwYjgtMmI1Mi00MmQyLWI4ZmMtMTc2NDI4YWEyNzU1NDNkY2U2Y2ItMTI0_PF84_6326641e-1e35-4da9-a4ba-c1fdb0d661d9',
  port: 80
});

framework.start();

framework.hears('scenarios', async function(bot, trigger) {
  try {
    const scenarios = (await scenarioService.get()).map(scenario => scenario.prettyName);
    bot.say(`Available Scenarios\n-------------------\n${scenarios.join('\n')}`);
  } catch (e) {
    console.error(e);
    bot.say(`Oopsies: ${e}`);
  }
});

framework.hears('help', async function(bot, trigger) {
  const res = `Help
-------------------
@gloombot scenarios
@gloombot votes
@gloombot vote #
@gloombot unvote #
@gloombot play
@gloombot reset`;
  bot.say(res);
});

framework.hears('play', async function(bot, trigger) {
  bot.say((await votingService.play()));
});

framework.hears('reset', async function(bot, trigger) {
  try {
    votingService.reset();
    await scenarioService.reset();
    bot.say('Voting Reset');
  } catch (e) {
    console.error(e);
    bot.say(`Oopsies: ${e}`);
  }
});

framework.hears('vote', async function(bot, trigger) {
  const parts = trigger.message.text.split(' ');
  const voteResult = await votingService.vote(parseInt(parts[parts.length -1]));
  bot.say(`Voted for: ${voteResult}`);
});

framework.hears('vote', async function(bot, trigger) {
  const votes = await votingService.votes();
  bot.say(`Current Votes\n${votes}`);
});

framework.hears('unvote', async function(bot, trigger) {
  const parts = trigger.message.text.split(' ');
  const unvoteResult = await votingService.unvote(parseInt(parts[parts.length -1]));
  bot.say(`Unvoted for: ${unvoteResult}`);
});

process.on('SIGINT', function() {
  framework.stop().then(function() {
    process.exit();
  });
});

module.exports = webhook(framework);
