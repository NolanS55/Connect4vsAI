class treeNode {
    constructor(moves, parent){
        this.parent = parent;
        this.visits = 0; 
        this.wins = 0; 
        this.unExpanMoves = moves.length;
        this.children = new Array(this.unExpanMoves).fill(null);
    }   
}


class MCTS {
    constructor(game, player, iterations, explore){
        this.game = game;
        this.player = player;
        this.iterations = iterations;
        this.explore = explore;
    }

    selectMove(){
        const startState = this.game.getBoardState();
        const startingBoard = structuredClone(this.game.getBoardState().board)
        const moves = this.game.getMoves();
        const root = new treeNode(moves, null);

        for (let i = 0; i < this.iterations; i++){
            this.game.setBoardState(startState);
            let clonedState = this.game.deepClone();
            this.game.setBoardState(clonedState);
            let curNode = this.selectNode(root);

            if (this.game.checkWin()){
                if (this.game.getWinner() !== this.player && this.game.getWinner() !== 0){
                    curNode.parent.wins = -1000
                }
            }
            let expandedCurNode = this.expandNode(curNode);
            this.playOut();
            
            let reward = 0 ;
            if (this.game.getWinner() === 0){
                reward = 0; 
            }
            else if (this.game.getWinner() === this.player) {
                reward = 1; 
            }
            else                                        {
                reward = -1;
            }
            this.backPropagate(expandedCurNode, reward);
        }

        let maxWins = 0;
        let maxIndex = 0;
        for (let i in root.children){
            const child = root.children[i];
            if (child == null) {
                continue
            }
            if (child.wins > maxWins){
                maxWins = child.wins;
                maxIndex = i;
            }
        }

        this.game.setBoardState(startState);
        this.game.setBoard(startingBoard)
        return moves[maxIndex]
    }

    selectNode(root){
        const c = this.explore;
        while (root.unExpanMoves === 0){
            let maxUBC = -10000;
            let maxIndex = -1;
            let sp = root.visits;
            for (let i in root.children){
                const child = root.children[i];
                const si = child.visits;
                const wi = child.wins;
                const ubc = this.UCB(wi,si,c,sp);
                if (ubc > maxUBC){
                    maxUBC = ubc;
                    maxIndex = i;
                }
            }
            const moves = this.game.getMoves();
            this.game.move(moves[maxIndex]);
           
            root = root.children[maxIndex];
            if (this.game.checkWin()){
                return root
            }
        }
        return root
    }

    expandNode(node){
        if (this.game.checkWin()){
            return node
        }
        let moves = this.game.getMoves(); 
        const index = this.selectUnexpanChild(node);
        this.game.move(moves[index]);

        moves = this.game.getMoves();
        const newNode = new treeNode(moves, node);
        node.children[index] = newNode;
        node.unExpanMoves -= 1;
       
        return newNode
    }

    playOut(){
        while (!this.game.checkWin()){
            const moves = this.game.getMoves();
            const randomChoice = Math.floor(Math.random() * moves.length);
            this.game.move(moves[randomChoice]);
        }
        return this.game.getWinner()
    }

    backPropagate(node, reward){  
        while (node !== null){
            node.visits += 1;
            node.wins += reward; 
            node = node.parent;  
        }
    }

    selectUnexpanChild(node){
        const choice = Math.floor(Math.random() * node.unExpanMoves);
        let counter = -1;
        for (let i in node.children){
            const child = node.children[i];
            if (child == null){
                counter += 1;
            }
            if (counter === choice){
                return i
            }
        }
    }

    UCB(wi, si, c, sp){
        return (wi/si) + c * Math.sqrt(Math.log(sp)/si)
    }
}

exports.MCTS = MCTS;

Object.defineProperty(exports, '__esModule', { value: true });