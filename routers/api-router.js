const Framework = require('webex-node-bot-framework');
const webhook = require('webex-node-bot-framework/webhook');
const bodyParser = require('body-parser');
const express = require('express');

const scenarioService = require('../data-services/scenario-service');
const votingService = require('../data-services/voting-service');

const botConfig = {
  webhookUrl: 'http://54.209.227.191/api/gloombot',
  token: 'ZjcwNjMwYjgtMmI1Mi00MmQyLWI4ZmMtMTc2NDI4YWEyNzU1NDNkY2U2Y2ItMTI0_PF84_6326641e-1e35-4da9-a4ba-c1fdb0d661d9',
  port: 80
};

const framework = new Framework(botConfig);
framework.start();

framework.hears('scenarios', async function(bot, trigger) {
  try {
    const scenarios = (await scenarioService.get()).map(scenario => scenario.prettyName);
    bot.say(`Available Scenarios\n-------------------\n${scenarios.join('\n')}`);
  } catch (e) {
    console.error(e);
    bot.say(`Oopsies\n${e}`);
  }
});

const router = express.Router();

function asyncHandler(requestHandler) {
  return (request, response, next) => {
    const handlerResult = requestHandler(request, response, next);
    return Promise.resolve(handlerResult).catch(next);
  };
}

router.post('/gloombot', bodyParser.json(), webhook(framework));
router.use(bodyParser.text());


router.get('/play', asyncHandler(async function(req, res) {
  res.send((await votingService.play()).prettyName);
}));

router.get('/scenarios', asyncHandler(async function(req, res) {
  try {
    const scenarios = (await scenarioService.get()).map(scenario => scenario.prettyName);
    res.send(`Available Scenarios\n-------------------\n${scenarios.join('\n')}`);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}));

router.post('/reset', asyncHandler(async function(req, res) {
  try {
    votingService.reset();
    await scenarioService.reset();
    res.send();
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}));

router.post('/vote', asyncHandler(async function(req, res) {
  const voteResult = await votingService.vote(parseInt(req.body));
  res.send(`Voted for: ${voteResult}`);
}));

router.post('/unvote', asyncHandler(async function(req, res) {
  const unvoteResult = await votingService.vote(parseInt(req.body));
  res.send(`Unvoted for: ${unvoteResult}`);
}));

//initialize cache
scenarioService.get();

module.exports = router;
