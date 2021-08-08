import { Component, OnInit, } from '@angular/core';
import { interval } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  //SIZE OF THE BOARD
  boardSize = 20;

  //CURRENT SCORE
  score = 0;

  //CURRENT DIRECTION (STARTING AT RIGHT)
  currentDir = "RIGHT";

  //LAST DIRECTION DONE BY THE SNAKE
  lastDir = "RIGHT";

  //SNAKE (ALL POSITIONS)
  snake = [[0,0], [0,1], [0,2]]  

  //FRUIT POS
  fruit = [-1, -1]

  //REFERENCE BOARD
  cleanBoard : string[][] = [];

  //CURRENT BOARD (10x10)
  board : string[][] = [];

  //TO CONFIRM IF THE GAME STARTED
  hasStarted = false;

  //TO CONFIRM IF THE GAME IS OVER
  isGameOver = false;

  //KEYS ON THE SCREEN (DEFAULT IS FALSE)
  isKeysScreen = false;

  //DARK MODE (DEFAULT IS OFF)
  isDarkMode = false;

  hasWon = false;

  //INIT METHOD
  ngOnInit(): void {

    //START BOARD
    for(let i = 0; i < this.boardSize; ++i){
      let line = []
      for(let y = 0; y < this.boardSize; ++y) {
        line.push("N");
      }
      this.cleanBoard.push(line);
    }

    //COPY START BOARD TO BOARD
    for (var i = 0; i < this.cleanBoard.length; i++)
        this.board.push(this.cleanBoard[i].slice());

    //SPAWN A FRUIT
    this.nextFruit();

    //CREATE THE BOARD WITH ALL ELEMENTS
    this.refreshBoard();

    //EVERY 0.4s CALL MOVE SNAKE (EXECUTE A MOVE)
    interval(400).subscribe(x => { this.moveSnake(); });

  }

  //WHEN USER INPUTS A KEY, CHANGES THE DIRECTION OF THE SNAKE
  //CLICK OPOSITE KEY, WILL BLOCK THE PLAYER MOVE
  onKeyDown(e: KeyboardEvent) : void {
    if(this.hasStarted) {
      switch (e.keyCode) {
        case 37: //LEFT ARROW
          if(this.lastDir != "RIGHT")
            this.currentDir = "LEFT";
          break;
        case 38: //UP ARROW
          if(this.lastDir != "DOWN")
            this.currentDir = "UP";
          break;
        case 39: //RIGHT ARROW
          if(this.lastDir != "LEFT")
            this.currentDir = "RIGHT";
          break;
        case 40: //DOWN ARROW
          if(this.lastDir != "UP")
            this.currentDir = "DOWN";
          break;
      }
    }
   
  }

  buttonUpPressed() : void {
    if(this.hasStarted && this.lastDir != "DOWN")
      this.currentDir = "UP";
  }

  buttonDownPressed() : void {
    if(this.hasStarted && this.lastDir != "UP")
      this.currentDir = "DOWN";
  }

  buttonLeftPressed() : void {
    if(this.hasStarted && this.lastDir != "RIGHT")
      this.currentDir = "LEFT";
  }

  buttonRightPressed() : void {
    if(this.hasStarted && this.lastDir != "LEFT")
      this.currentDir = "RIGHT";
  }

  moveSnake(): void {

    if(!this.isGameOver && this.hasStarted){
      this.snakePosition();

      this.refreshBoard();

      this.lastDir = this.currentDir;
    }
    
  }

  refreshBoard() : void {
    if(!this.isGameOver){

      //CLEAN BOARD
      let grid = []
      for (var i = 0; i < this.cleanBoard.length; i++)
        grid.push(this.cleanBoard[i].slice());

      //ADD FRUIT TO BOARD
      if(this.fruit[0] == -1 || this.fruit[1] == -1) {
        //NOTHING
      } else {
        grid[this.fruit[1]][this.fruit[0]] = "F";
      }

      //ADD SNAKE TO BOARD
      for(let i = 0; i < this.snake.length; ++i) {
        //tail
        if(i == 0) {
          //grid[this.snake[i][0]][this.snake[i][1]] = "D";
          let difY = this.snake[i][0] - this.snake[i+1][0];
          let difX = this.snake[i][1] - this.snake[i+1][1];
          if(difY == 0) {
            if(difX == -1) {
              grid[this.snake[i][0]][this.snake[i][1]] = "LEFT";
            } else {
              grid[this.snake[i][0]][this.snake[i][1]] = "RIGHT";
            }
          } else {
            if(difY == -1) {
              grid[this.snake[i][0]][this.snake[i][1]] = "UP";
            } else {
              grid[this.snake[i][0]][this.snake[i][1]] = "DOWN";
            }
          }


        } else if (i == this.snake.length-1) {  //HEAD
          grid[this.snake[i][0]][this.snake[i][1]] = this.currentDir;

        } else {
          grid[this.snake[i][0]][this.snake[i][1]] = "P";
        }
        
      }

      this.board = grid;
    }
    
  }

  snakePosition() : void {

    switch(this.currentDir) {
      case "UP":
        this.snake.push([this.snake[this.snake.length-1][0]-1, this.snake[this.snake.length-1][1]]);
        break;
      case "RIGHT":
        this.snake.push([this.snake[this.snake.length-1][0], this.snake[this.snake.length-1][1]+1]);
        break;
      case "DOWN":
        this.snake.push([this.snake[this.snake.length-1][0]+1, this.snake[this.snake.length-1][1]]);
        break;
      case "LEFT":
        this.snake.push([this.snake[this.snake.length-1][0], this.snake[this.snake.length-1][1]-1]);
        break;
    }

    if(this.isSnakeOver()
      || this.snake[this.snake.length-1][0] < 0
      || this.snake[this.snake.length-1][1] < 0
      || this.snake[this.snake.length-1][0] >= this.boardSize 
      || this.snake[this.snake.length-1][1] >= this.boardSize) {
      this.gameOver();
    } else if(this.snake[this.snake.length-1][0] == this.fruit[1] && this.snake[this.snake.length-1][1] == this.fruit[0]) {
      this.fruitEat();
    } else {
      this.snake = this.snake.slice(1);
    }

  }

  isSnakeOver() : boolean {

    let previousSnake = this.snake.slice(0, this.snake.length-2);
    let nextMove = this.snake[this.snake.length-1]

    for(let i = 0; i < previousSnake.length; ++i) {
      if(previousSnake[i][0] == nextMove[0] && previousSnake[i][1] == nextMove[1]){
        return true;
      }
    }
    return false;

  }

  fruitEat() : void {
    this.score += 1;
    this.nextFruit();
  }

  //GENERATE THE POSITION FOR THE NEXT FRUIT
  //NOTE: MUST BE A FREE SPACE
  nextFruit() : void {
    
    //INIT POSITIONS FOR THE FRUIT
    let posX = -1;
    let posY = -1;

    //DETECTS IF EXIST FREE SPACE IN THE GRID
    let indexsY = [];
    for(let i = 0; i < this.board.length; ++i) {
      if(this.board[i].includes("N")){
        indexsY.push(i);
      }
    }

    //IF NOT, RETURN -1
    if(indexsY.length <= 0) {
      this.fruit = [-1, -1];
      return;
    }

    //GET A RANDOM Y POSITION
    posY = indexsY[Math.floor(Math.random() * indexsY.length)];

    //DETECTS ALL FREE POSITIONS IN Y AXIS (ALL X)
    let indexsX = [];
    for(let i = 0; i < this.board[posY].length; ++i){
      if(this.board[posY][i] == "N") {
        indexsX.push(i);
      }
    }

    //JUST FOR SAFETY, IF NO X INDEXS RETURN -1
    if(indexsX.length <= 0){
      this.fruit = [-1, -1];
      return;
    }

    //GET A RANDOM X POSITION
    posX = indexsX[Math.floor(Math.random() * indexsX.length)];

    //RETURN THE NEW FRUIT POSITION
    this.fruit = [posX, posY];

  }

  startGame() : void  {
    this.hasStarted = true;
  }

  gameOver() : void {

    let checker = true;
    for(let i = 0; i < this.board.length; ++i) {
      if(this.board[i].includes("N")) {
        checker = false;
        break;
      }
    }

    if(checker){
      this.hasWon = true;
    }

    this.isGameOver = true;
  }

  restartGame() : void {

    this.hasStarted = false;
    this.isGameOver = false;

    this.board = [];
    this.currentDir = "RIGHT";
    this.lastDir = "RIGHT";
    this.snake = [[0,0], [0,1], [0,2]];

    //COPY START BOARD TO BOARD
    for (var i = 0; i < this.cleanBoard.length; i++)
        this.board.push(this.cleanBoard[i].slice());

    //SPAWN A FRUIT
    this.nextFruit();

    //CREATE THE BOARD WITH ALL ELEMENTS
    this.refreshBoard();
    
    this.score = 0;
    this.hasStarted = true;
    this.hasWon = false;

  }

  //*************** */

  turnOnOffDarkMode() : void {
    this.isDarkMode = !this.isDarkMode;
    if(this.isDarkMode){
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");

      document.getElementsByClassName("main-game")[0].classList.remove("light");
      document.getElementsByClassName("main-game")[0].classList.add("dark");
    } else {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");

      document.getElementsByClassName("main-game")[0].classList.remove("dark");
      document.getElementsByClassName("main-game")[0].classList.add("light");
    }
    
  }

  turnOnOffKeys() : void {
    this.isKeysScreen = !this.isKeysScreen;
  }

}
