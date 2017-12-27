var game;

var gameOptions = {

  maxSumLen: 5,

  localStorageName: "oneplustwo",

  timeToAnswer: 3000,

  nextLevel: 400
}

window.onload = function() {
  game = new Phaser.Game(500, 500, Phaser.CANVAS);
  game.state.add("PlayGame", playGame, true);
}

var playGame = function(game) {}
playGame.prototype = {

  preload: function() {

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.stage.disableVisibilityChange = true;

    game.stage.backgroundColor = 0x66c6cc;

    game.load.image("timebar", "img/timebar.png");

    game.load.spritesheet("buttons", "img/buttons.png", 400, 50);

  },

  create: function() {

    this.isGameOver = false;

    this.score = 0;

    this.correctAnswers = 0;

    this.topScore = localStorage.getItem(gameOptions.localStorageName) == null ? 0 : localStorage.getItem(gameOptions.localStorageName);

    this.sumsArray = [];

    for (var i = 1; i < gameOptions.maxSumLen; i++) {

      this.sumsArray[i] = [
        [],
        [],
        []
      ];

      for (var j = 1; j <= 3; j++) {

        this.buildThrees(j, 1, i, j);
      }
    }

    console.log(this.sumsArray);

    this.questionText = game.add.text(250, 160, "-", {
      font: "bold 72px Arial"
    });

    this.questionText.anchor.set(0.5);

    this.scoreText = game.add.text(10, 10, "-", {
      font: "bold 24px Arial"
    });

    for (i = 0; i < 3; i++) {

      var numberButton = game.add.button(50, 250 + i * 75, "buttons", this.checkAnswer, this).frame = i;
    }

    var numberTimer = game.add.sprite(50, 250, "timebar");

    this.buttonMask = game.add.graphics(50, 250);
    this.buttonMask.beginFill(0xffffff);
    this.buttonMask.drawRect(0, 0, 400, 200);
    this.buttonMask.endFill();
    numberTimer.mask = this.buttonMask;

    this.nextNumber();
  },

  buildThrees: function(initialNummber, currentIndex, limit, currentString) {

    var numbersArray = [-3, -2, -1, 1, 2, 3];

    for (var i = 0; i < numbersArray.length; i++) {

      var sum = initialNummber + numbersArray[i];
      var outputString = currentString + (numbersArray[i] < 0 ? "" : "+") + numbersArray[i];
      if (sum > 0 && sum < 4 && currentIndex == limit) {

        this.sumsArray[limit][sum - 1].push(outputString);
      }
      if (currentIndex < limit) {

        this.buildThrees(sum, currentIndex + 1, limit, outputString);
      }
    }
  },

  nextNumber: function() {

    this.scoreText.text = "Score: " + this.score.toString() + "\nBest Score: " + this.topScore.toString();

    if (this.correctAnswers > 1) {

      this.timeTween.stop();

      this.buttonMask.x = 50;
    }

    if (this.correctAnswers > 0) {

      this.timeTween = game.add.tween(this.buttonMask).to({
        x: -350
      }, gameOptions.timeToAnswer, Phaser.Easing.Linear.None, true);

      this.timeTween.onComplete.add(function() {

        this.gameOver("?");
      }, this);
    }

    this.randomSum = game.rnd.between(0, 2);

    var questionLength = Math.min(Math.floor(this.score / gameOptions.nextLevel) + 1, 4)

    this.questionText.text = this.sumsArray[questionLength][this.randomSum][game.rnd.between(0, this.sumsArray[questionLength][this.randomSum].length - 1)];
  },

  checkAnswer: function(button) {

    if (!this.isGameOver) {

      if (button.frame == this.randomSum) {

        this.score += Math.floor((this.buttonMask.x + 350) / 4);

        this.correctAnswers++;


        this.nextNumber();
      } else {


        if (this.correctAnswers > 1) {

          this.timeTween.stop();
        }

        this.gameOver(button.frame + 1);
      }
    }
  },

  gameOver: function(gameOverString) {

    game.stage.backgroundColor = "#FFDF00";

    this.questionText.text = this.questionText.text + " = " + gameOverString;

    this.isGameOver = true;

    localStorage.setItem(gameOptions.localStorageName, Math.max(this.score, this.topScore));

    game.time.events.add(Phaser.Timer.SECOND * 2, function() {
      game.state.start("PlayGame");
    }, this);
  }
}
