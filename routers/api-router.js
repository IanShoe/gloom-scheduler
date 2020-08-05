const bodyParser = require('body-parser');
const express = require('express');

const scenarioService = require('../data-services/scenario-service');
const votingService = require('../data-services/voting-service');
const webexWebhook = require('../webhooks/webex-webhook');

const router = express.Router();

function asyncHandler(requestHandler) {
  return (request, response, next) => {
    const handlerResult = requestHandler(request, response, next);
    return Promise.resolve(handlerResult).catch(next);
  };
}

router.post('/gloombot', bodyParser.json(), webexWebhook);
router.use(bodyParser.text());

router.get('/play', asyncHandler(async function(req, res) {
  res.send((await votingService.play()));
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
