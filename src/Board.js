import { useState } from "react"
import { MCTS } from "./Ai/gameTree"
import './Board.css'



class connectFour {
    constructor() {
        this.boardState = {
            board : [[0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0]],
            player : 1,
            tempPlay : 2,
            winner : 0,
            gameOver : false
        }
    }
                                    
    getBoardState() {
        return this.boardState
    }
                                    
    setBoardState(boardState) {
        this.boardState = boardState
    }

    setBoard(board) {
        this.boardState.board = structuredClone(board)
    }

    deepClone() {
        return {
            board : this.boardState.board,
            player : this.boardState.player,
            tempPlay : this.boardState.tempPlay,
            winner : this.boardState.winner,
            gameOver : this.boardState.gameOver       
        }
    }

    getWinner() {
        return this.boardState.winner
    }

    getMoves() {
        let moves = []
        for(let i = 0; i < 7; i++) {
            if(this.boardState.board[0][i] === 0) {
                moves.push(i)
            }
        }
        return moves
    }

    move = (col) => {
        for(let i = 5; i >= 0; i--) {
            if(this.boardState.board[i][col] === 0) {
                let tempBoard = [...this.boardState.board]
                tempBoard[i][col] = this.boardState.player
                this.boardState.board = tempBoard
                let temperplay = this.boardState.player
                this.boardState.player = this.boardState.tempPlay
                this.boardState.tempPlay = temperplay
                break
            }
        }
        
    }

    checkVert = (board) => {
        let tiles = 0
        let check = 0
        let checkHold = 0
        for(let i = 0; i < 7; i++) {
            for(let j = 0;j < 6; j++) {
                check = board[j][i]
                if(check !== 0) {
                    tiles++
                }
                if(check !== checkHold) {
                    tiles = 0
                }
                if(tiles === 3) {
                    return true
                }
                checkHold = board[j][i]
            }
            tiles = 0
            check = 0
            checkHold = 0
        }
        return false
    }

    checkHorz = (boardRow) => {
        let tiles = 0
        let check = 0
        let checkHold = 0
        for(let i = 0; i < 7; i++) {
            check = boardRow[i]
            if(check !== 0) {
                tiles++
            }
            if(check !== checkHold) {
                tiles = 0
            }
            if(tiles === 3) {
                return true
            }
            checkHold = boardRow[i]
        }
        return false
    }

    checkDiag = (board, row, column) => {
        var result = false;

        if(board[row][column] !== 0) {
            // there are four possible directions of a win
            // if the top right contains a possible win
            if(row - 3 > -1 && column + 3 < 7) {
                result = board[row][column] === board[row - 1][column + 1] &&
                         board[row][column] === board[row - 2][column + 2] &&
                         board[row][column] === board[row - 3][column + 3]; 
            }
            // if the bottom right contains possible win
            if(row + 3 < 6 && column + 3 < 7) {
                result = board[row][column] === board[row + 1][column + 1] &&
                         board[row][column] === board[row + 2][column + 2] &&
                         board[row][column] === board[row + 3][column + 3]; 
            }
            // if the bottom left contains possible win
            if(row + 3 < 6 && column - 3 > -1) {
                result = board[row][column] === board[row + 1][column - 1] &&
                         board[row][column] === board[row + 2][column - 2] &&
                         board[row][column] === board[row + 3][column - 3]; 
            }
            // if the top left contains a possible win
            if(row - 3 > -1 && column - 3 > -1) {
                result = board[row][column] === board[row - 1][column - 1] &&
                         board[row][column] === board[row - 2][column - 2] &&
                         board[row][column] === board[row - 3][column - 3]; 
            }
        }
    
        return result;
    }

    checkWin = () => {
        for(let i = 0; i < 6; i++) {
            if(this.checkHorz(this.boardState.board[i])) {
                this.boardState.gameOver = true
                this.boardState.winner  = this.boardState.player
                return true
            }
        }
        if(this.checkVert(this.boardState.board)) {
            this.boardState.gameOver = true
            this.boardState.winner  = this.boardState.player
            return true
        }
        for(let i = 0; i < 6; i++) {
            for(let j = 0; j < 7; j++) {
                if(this.checkDiag(this.boardState.board,i,j)) {
                    this.boardState.gameOver = true
                    this.boardState.winner  = this.boardState.player
                    return true
                }
            }
        }
        return false
    }
    reset = () => {
        this.setBoardState({
            board : [[0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0]],
            player : 1,
            tempPlay : 2,
            winner : 0,
            lastMove : -1,
            gameOver : false
        })
    }
}
var connectGame = new connectFour()
var Player2 = new MCTS(connectGame, 2, 100, 1.41)
const Board = () => {
    
    const [board, setBoard] = useState([[0,0,0,0,0,0,0],
                                        [0,0,0,0,0,0,0],
                                        [0,0,0,0,0,0,0],
                                        [0,0,0,0,0,0,0],
                                        [0,0,0,0,0,0,0],
                                        [0,0,0,0,0,0,0]])
    
    const reactMove = (move) => {
        connectGame.move(move)
        setBoard(connectGame.boardState.board)
        if(!connectGame.checkWin()) {
            let p2Move = Player2.selectMove()
            connectGame.move(p2Move)
            setBoard(connectGame.boardState.board)
        }
    }

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
                    <div className="winScreen">{(connectGame.getBoardState().player === 1) ? "Blue" : "Red"} wins</div>
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