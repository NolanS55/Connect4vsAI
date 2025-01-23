class MCTSNode {
    constructor(boardState, parent = null, move = null) {
        this.boardState = boardState; // ConnectFour board state
        this.parent = parent;         // Parent node
        this.move = move;             // Move that leads to this node
        this.children = [];           // List of child nodes
        this.wins = 0;                // Number of wins for Player 2
        this.visits = 0;              // Number of times this node has been visited
        this.untriedMoves = this.getAvailableMoves(boardState); // Possible moves
    }

    // Get available moves from the current board state
    getAvailableMoves(boardState) {
        const moves = [];
        for (let col = 0; col < 7; col++) {
            if (boardState[0][col] === 0) {
                moves.push(col);
            }
        }
        return moves;
    }

    // Check if the node is a leaf (no untried moves and game not over)
    isLeaf() {
        return this.untriedMoves.length === 0 && !this.boardState.gameOver;
    }

    // Expand the node by trying one of the untried moves
    expand() {
        if (this.isLeaf()) return null;

        // Pick a random move to expand
        const move = this.untriedMoves.pop();
        const newBoardState = this.simulateMove(this.boardState, move);
        const childNode = new MCTSNode(newBoardState, this, move);
        this.children.push(childNode);
        return childNode;
    }

    // Simulate a move on the board state
    simulateMove(boardState, move) {
        const newBoardState = structuredClone(boardState);
        newBoardState.board[5][move] = 2; // Assume Player 2 is AI and uses 2
        // Adjust the board state after the move (may include checking for win)
        return newBoardState;
    }
}

class MCTS {
    constructor(game, player, iterations, explorationConstant) {
        this.game = game;            // Game instance
        this.player = player;        // Player (in this case, Player 2)
        this.iterations = iterations;  // Number of MCTS iterations to run
        this.explorationConstant = explorationConstant;  // UCB1 exploration constant
    }

    // UCB1 selection: picks the child node with the highest UCB1 value
    ucb1(node) {
        if (node.visits === 0) {
            return Infinity; // If unvisited, give it infinite priority
        }
        return node.wins / node.visits + this.explorationConstant * Math.sqrt(Math.log(node.parent.visits) / node.visits);
    }

    // Selection step of MCTS: Selects the most promising node
    selectNode(root) {
        let currentNode = root;
        while (currentNode.untriedMoves.length === 0 && currentNode.children.length > 0) {
            currentNode = this.bestChild(currentNode);
        }
        return currentNode;
    }

    // Find the child node with the highest UCB1 value
    bestChild(node) {
        return node.children.reduce((best, child) => {
            return this.ucb1(child) > this.ucb1(best) ? child : best;
        });
    }

    // Simulation step: Simulate a random game from the current node to a terminal state
    simulateGame(node) {
        let boardState = node.boardState;
        let currentPlayer = 2; // Player 2 (AI)

        while (!this.game.checkWin()) {
            let availableMoves = this.game.getMoves();
            let randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            boardState = this.game.simulateMove(boardState, randomMove);
            currentPlayer = currentPlayer === 1 ? 2 : 1;
        }

        return this.game.getWinner();  // Return the winner (1 or 2)
    }

    // Backpropagation step: Update the stats of each node along the path to the root
    backpropagate(node, result) {
        let currentNode = node;
        while (currentNode !== null) {
            currentNode.visits++;
            if (result === this.player) {
                currentNode.wins++;
            }
            currentNode = currentNode.parent;
        }
    }

    // The main function that runs the MCTS to find the best move
    selectMove() {
        const rootNode = new MCTSNode(this.game.getBoardState(), null, null);
        
        // Perform MCTS iterations
        for (let i = 0; i < this.iterations; i++) {
            let node = this.selectNode(rootNode);  // Selection
            let expandedNode = node.expand();      // Expansion
            let simulationResult = this.simulateGame(expandedNode || node);  // Simulation
            this.backpropagate(expandedNode || node, simulationResult);  // Backpropagation
        }

        // Pick the child with the highest win rate after all iterations
        const bestMoveNode = this.bestChild(rootNode);
        return bestMoveNode.move;
    }
}
