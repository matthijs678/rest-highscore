const express = require('express');
const router = express.Router();
const conn = require("../conn");

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", { title: 'Express' });
  // console.log(__dirname);
  // res.sendFile(__dirname + "index.html");
});

router.post("/", async (req, res, next) => {
  const game = req.body.game?.toLowerCase();
  const naam = req.body.naam;
  const score = Number(req.body.score);

  if (!(
    typeof game === "string" &&
    typeof naam === "string" &&
    Number.isFinite(score)
  )) {
      res.writeHead(400, {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify("Invalid score"));

      return;
  }
    
  const db = conn.getDB();
  const collec = db.collection("highscores");
  
  const highScore = await collec.findOne({
    game: game,
    highscore: true
  });

  if (highScore && highScore.score >= score) {
    const thisScore = {
      game: game,
      naam: naam,
      score: score,
      highscore: false,
    };

    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify(thisScore));

    return;
  }

  if (highScore) {
    const filter = {
      _id: highScore._id.valueOf(),
    };

    const update = {
      $set: {
        highscore: false,
      },
    };

    const updateResult = await collec.updateOne(filter, update);

    if (updateResult?.modifiedCount !== 1) {
      res.writeHead(500, {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify("Score failed to post"));

      throw new Error("failed to update document, result: " + JSON.stringify(updateResult) + "; document id: " + JSON.stringify(filter._id));
    }
  }

  const newScore = {
    game: game,
    naam: naam,
    score: score,
    highscore: true,
  };

  const insertResult = await collec.insertOne(newScore);

  if (!insertResult.acknowledged) {
    res.writeHead(500, {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify("Score failed to post"));

    throw new Error("failed to insert document, result: " + JSON.stringify(insertResult));
  }

  const scoreToReturn = { // newScore was modified by insertOne()
    game: game,
    naam: naam,
    score: score,
    highscore: true,
  };

  res.writeHead(200, {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(scoreToReturn));
});

router.get("/:game", async (req, res, next) => {
  const db = conn.getDB();
  const collec = db.collection("highscores");

  const game = (req.params.game ?? "").toLowerCase();

  const highScore = await collec.findOne({
    game: game,
    highscore: true
  });

  const naam = highScore?.naam ?? "";
  const score = highScore?.score ?? -1;

  const toReturn = {
    game: game,
    naam: naam,
    score: score,
  };

  res.writeHead(200, {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(toReturn));
});

module.exports = router;
