import { useState } from "react"
import { MCTS } from "./Ai/gameTree"
import './Board.css'



class connectFour {
    constructor() {
        this.boardState = {
            board : [[0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0]],
            player: 1,
            tempPlay: 2,
            winner: 0,
            gameOver: false
        };
    }

    // Return the current board state
    getBoardState() {
        return this.boardState;
    }

    // Set a new board state
    setBoardState(boardState) {
        this.boardState = boardState;
    }

    // Clone the board state to prevent mutation
    setBoard(board) {
        this.boardState.board = structuredClone(board);
    }

    // Deep clone the board state
    deepClone() {
        return {
            board: this.boardState.board,
            player: this.boardState.player,
            tempPlay: this.boardState.tempPlay,
            winner: this.boardState.winner,
            gameOver: this.boardState.gameOver
        };
    }

    // Return the winner of the game
    getWinner() {
        return this.boardState.winner;
    }

    // Get all available moves (columns that are not full)
    getMoves() {
        let moves = [];
        for (let i = 0; i < 7; i++) {
            if (this.boardState.board[0][i] === 0) {
                moves.push(i);
            }
        }
        return moves;
    }

    // Perform a move (drop a disc in a column)
    move(col) {
        for (let i = 5; i >= 0; i--) {
            if (this.boardState.board[i][col] === 0) {
                let tempBoard = [...this.boardState.board];
                tempBoard[i][col] = this.boardState.player;
                this.boardState.board = tempBoard;
                let tempPlayer = this.boardState.player;
                this.boardState.player = this.boardState.tempPlay;
                this.boardState.tempPlay = tempPlayer;
                break;
            }
        }
    }

    // Check for a vertical win
    checkVert(board) {
        let tiles = 0;
        let check = 0;
        let checkHold = 0;
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 6; j++) {
                check = board[j][i];
                if (check !== 0) {
                    tiles++;
                }
                if (check !== checkHold) {
                    tiles = 0;
                }
                if (tiles === 3) {
                    return true;
                }
                checkHold = board[j][i];
            }
            tiles = 0;
            check = 0;
            checkHold = 0;
        }
        return false;
    }

    // Check for a horizontal win
    checkHorz(boardRow) {
        let tiles = 0;
        let check = 0;
        let checkHold = 0;
        for (let i = 0; i < 7; i++) {
            check = boardRow[i];
            if (check !== 0) {
                tiles++;
            }
            if (check !== checkHold) {
                tiles = 0;
            }
            if (tiles === 3) {
                return true;
            }
            checkHold = boardRow[i];
        }
        return false;
    }

    // Check for a diagonal win
    checkDiag(board, row, column) {
        let result = false;
        if (board[row][column] !== 0) {
            // Check top-right diagonal
            if (row - 3 >= 0 && column + 3 < 7) {
                result = board[row][column] === board[row - 1][column + 1] &&
                         board[row][column] === board[row - 2][column + 2] &&
                         board[row][column] === board[row - 3][column + 3];
            }
            // Check bottom-right diagonal
            if (row + 3 < 6 && column + 3 < 7) {
                result = board[row][column] === board[row + 1][column + 1] &&
                         board[row][column] === board[row + 2][column + 2] &&
                         board[row][column] === board[row + 3][column + 3];
            }
            // Check bottom-left diagonal
            if (row + 3 < 6 && column - 3 >= 0) {
                result = board[row][column] === board[row + 1][column - 1] &&
                         board[row][column] === board[row + 2][column - 2] &&
                         board[row][column] === board[row + 3][column - 3];
            }
            // Check top-left diagonal
            if (row - 3 >= 0 && column - 3 >= 0) {
                result = board[row][column] === board[row - 1][column - 1] &&
                         board[row][column] === board[row - 2][column - 2] &&
                         board[row][column] === board[row - 3][column - 3];
            }
        }
        return result;
    }

    // Check for a win condition in the game (horizontal, vertical, or diagonal)
    checkWin() {
        for (let i = 0; i < 6; i++) {
            if (this.checkHorz(this.boardState.board[i])) {
                this.boardState.gameOver = true;
                this.boardState.winner = this.boardState.player;
                return true;
            }
        }
        if (this.checkVert(this.boardState.board)) {
            this.boardState.gameOver = true;
            this.boardState.winner = this.boardState.player;
            return true;
        }
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                if (this.checkDiag(this.boardState.board, i, j)) {
                    this.boardState.gameOver = true;
                    this.boardState.winner = this.boardState.player;
                    return true;
                }
            }
        }
        return false;
    }

    // Reset the game to the initial state
    reset() {
        this.setBoardState({
            board: [[0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0]],
            player: 1,
            tempPlay: 2,
            winner: 0,
            lastMove: -1,
            gameOver: false
        });
    }
}
var connectGame = new connectFour()
var Player2 = new MCTS(connectGame, 2, 1000, 1.41)
const Board = () => {
    
    const [board, setBoard] = useState([[0,0,0,0,0,0,0],
                                        [0,0,0,0,0,0,0],
                                        [0,0,0,0,0,0,0],
                                        [0,0,0,0,0,0,0],
                                        [0,0,0,0,0,0,0],
                                        [0,0,0,0,0,0,0]])
    
    const reactMove = (move) => {
        connectGame.move(move);
        setBoard(connectGame.boardState.board);
        if (!connectGame.checkWin()) {
            // AI makes its move after Player 1
            let p2Move = Player2.selectMove();
            connectGame.move(p2Move);
            setBoard(connectGame.boardState.board);
        }
    };

    const reactReset = () => {
        setBoard([[0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0]])
        connectGame.reset()
    }


    let rows = [0,1,2,3,4,5,6]
    
    

    if(connectGame.checkWin()) {
        return ( 
            <div>
                <div className="fourBoard">
                    {
                        
                        board.map((row, rowIndex) => {
                            return (
                                row.map((tile,tileIndex) => {
                                    let color = "white"
                                    if(tile === 1) {
                                        color = "blue"
                                    }
                                    else if(tile===2) {
                                        color = "red"
                                    }
                                    return <div className="circle" style={{backgroundColor:color}} key={tileIndex}></div>
                                })    
                            )      
                        })        
                    }
                </div>
                <div className="controller">
                    <div className="winScreen">{(connectGame.getBoardState().player === 1) ? "Red" : "Blue"} wins</div>
                    <button className="playAgain" onClick={reactReset}>Play Again</button>
                </div>
            </div> 
        );
    }
    else {
        return ( 
            <div>
                <div className="fourBoard">
                    {
                        
                        board.map((row, rowIndex) => {
                            return (
                                row.map((tile,tileIndex) => {
                                    let color = "white"
                                    if(tile === 1) {
                                        color = "blue"
                                    }
                                    else if(tile===2) {
                                        color = "red"
                                    }
                                    return <div className="circle" style={{backgroundColor:color}} key={tileIndex}></div>
                                })    
                            )      
                        })        
                    }
                </div>
                <div className="controller">
                    {rows.map((row, rowIndex)=> {
                        return(
                            <button className="rowPick" onClick={()=>reactMove(row)}>{row + 1}</button>
                        )
                    })}
                </div>
            </div> 
        );
    }
    
}
 
export default Board;
