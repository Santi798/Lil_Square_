/*
Fecha de entrega: 12 mayo 2025, 11:59 pm
Desarrollar un agente que juegue cuadrito. Tiene límite de tiempo:
 1. Aquí encuentran el código del ambiente
 2. Su agente debe heredar de la clase Agent y debe sobreescribir el método compute
 3. El método de iniciar el agente recibe tres argumentos: 
    - El color con que está jugando
    - El tablero inicial del cual puede obtener el tamaño (siempre cuadrado)
    - El tiempo total de juego en milisegundos
 4. El método compute recibe dos argumentos:
    - El tablero como va 
    - El tiempo que le queda a su agente en milisegundos
 5. El método compute debe retornar una lista con tres argumentos [fila, columna, lado]. El valor del lado
 es un número 0: arriba, 1: derecha, 2.abajo, 3:izquierda 
*/

/**
 * Abstract agent class
 */
class Agent{
    /**
     * Creates an agent
     */
    constructor(){}
    
    /**
     * Initializes the agent
     * @param color Color of the agent pieces ('R':red or 'Y':yellow)
     * @param board Initial state of the board (empty, useful for obtaaining the size (nxn))
     * @param time Total amount of time the agent has for playing all the game (milliseconds)
     */
    init(color, board, time=20000){
        this.color = color
        this.time = time
        this.size = board.length
    }

    /**
     * Determines the next play of the agent
     * @param board Current square configuration
     * @param time Remaining time the agent has for playing all the game (milliseconds)
     * @return A list with three values [row, column, side]. Parameter side can take one of the following values: 
               0 is up, 1 is right, 2 is bottom, 3 is left  
     */
    compute( board, time ){ return [0,0,0]; }
}

/*
 * A class for board operations (it is not the board but a set of operations over it)
 */
class Board{
    constructor(){}

    // Initializes a board of the given size. A board is a matrix of size*size of integers 0, .., 15, -1, or -2
    init(size){
    	var m = size-1
        var board = []
        board[0] = []
        board[0][0] = 9
        for(var j=1; j<m; j++){
	    board[0][j] = 1
	}
	board[0][m] = 3
	
        for(var i=1; i<m; i++){
            board[i] = []
            board[i][0] = 8
            for(var j=1; j<m; j++){
		board[i][j] = 0
	    }
	    board[i][m] = 2
        }
        
        board[m] = []
        board[m][0] = 12
        for(var j=1; j<m; j++){
	    board[m][j] = 4
	}
	board[m][m] = 6

        return board
    }

    // Deep clone of a board the reduce risk of damaging the real board
    clone(board){
        var size = board.length
        var b = []
        for(var i=0; i<size; i++){
            b[i] = []
            for(var j=0; j<size; j++)
                b[i][j] = board[i][j]
        }
        return b
    }

    // Determines if a line can be drawn at row r, column c, side s 
    check(board, r, c, s){
        if(board[r][c] < 0) return false
        s = 1<<s
        return ((board[r][c] & s)!=s)
    }

    // Computes all the valid moves for the given 'color'
    valid_moves(board){
        var moves = []
        var size = board.length
        for( var i=0; i<size; i++)
            for( var j=0; j<size; j++)
                for( var s=0; s<4; s++)
                    if(this.check(board, i, j, s)) moves.push([i,j,s])
        return moves
    }
    
    fill(board, i, j, color){
        if(i<0 || i==board.length || j<0 || j==board.length) return board
    	
        if(board[i][j]==15 || board[i][j] == 14){
            board[i][j] = color
            if(i>0 && board[i-1][j]>=0){
                board[i-1][j] += 4
                this.fill(board,i-1,j,color)
            }    
        }
        
        if(board[i][j]==15 || board[i][j] == 13){
            board[i][j] = color
            if(j<board.length-1 && board[i][j+1]>=0){
                board[i][j+1] += 8
                this.fill(board,i,j+1,color)
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==11){
            board[i][j] = color
            if(i<board.length-1 && board[i+1][j]>=0){
                board[i+1][j] += 1
                this.fill(board,i+1,j,color)
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==7){
            board[i][j] = color
            if(j>0 && board[i][j-1]>=0){
                board[i][j-1] += 2
                this.fill(board,i,j-1,color)
            }    
        }
        return board
    }

    // Computes the new board when a piece of 'color' is set at row i, column j, side s. 
    // If it is an invalid movement stops the game and declares the other 'color' as winner
    move(board, i, j, s, color){
    	if(this.check(board, i, j, s)){
    	    var ocolor = (color==-2)?-1:-2
    	    board[i][j] |= 1<<s
    	    board = this.fill(board, i, j, ocolor)
    	    if(i>0 && s==0){
      	        board[i-1][j] |= 4
    	        board = this.fill(board, i-1, j, ocolor)
    	    }
    	    if(i<board.length-1 && s==2){
      	        board[i+1][j] |= 1
    	        board = this.fill(board, i+1, j, ocolor)
    	    }
    	    if(j>0 && s==3){
      	        board[i][j-1] |= 2
    	        board = this.fill(board, i, j-1, ocolor)
    	    }
    	    
    	    if(j<board.length-1 && s==1){
      	        board[i][j+1] |= 8
    	        board = this.fill(board, i, j+1, ocolor)
    	    }
    	    return true 
    	}
    	return false
    }

    // Determines the winner of the game if available 'R': red, 'Y': yellow, ' ': none
    winner(board){
    	var cr = 0
    	var cy = 0
    	for(var i=0; i<board.length; i++)
    	  for(var j=0; j<board.length; j++)
    	  if(board[i][j]<0){
    	      if(board[i][j] == -1){ cr++ }else{ cy++ }
    	  }
    	if(cr+cy<board.length*board.length) return ' '
    	if(cr>cy) return 'R'
    	if(cy>cr) return 'Y'
        return ' '
    }

    // Draw the board on the canvas
    print(board){
        var size = board.length
        // Commands to be run (left as string to show them into the editor)
        var grid = []
        for(var i=0; i<size; i++){
            for(var j=0; j<size; j++){
                var commands = [{"command":"-"}]
                if(board[i][j] < 0){
                    if(board[i][j]==-1) commands.push({"command":"R"})
                    else commands.push({"command":"Y"})
                    commands.push({"command":"u"})
                    commands.push({"command":"r"})
                    commands.push({"command":"d"})
                    commands.push({"command":"l"})
                }else{
                    if((board[i][j]&1)==1) commands.push({"command":"u"})
                    if((board[i][j]&2)==2) commands.push({"command":"r"})
                    if((board[i][j]&4)==4) commands.push({"command":"d"})
                    if((board[i][j]&8)==8) commands.push({"command":"l"})
                }
                grid.push({"command":"translate", "y":i, "x":j, "commands":commands})
            }
        }

	var cmds = {"r":true,"x":1.0/size,"y":1.0/size,"command":"fit", "commands":grid}
        Konekti.client['canvas'].setText(cmds)
    }
}

/*
 * Player's Code (Must inherit from Agent: It is mandatory the inheritance process) 
 * This is an example of a random player agent
 *
 */
class RandomPlayer extends Agent{
    constructor(){ 
        super() 
        this.board = new Board()
    }

    compute(board, time){
        // Always cheks the current board status since opponent move can change several squares in the board
        var moves = this.board.valid_moves(board)
        // Randomly picks one available move
        var index = Math.floor(moves.length * Math.random())
        for(var i=0; i<50000000; i++){} // Making it very slow to test time restriction
        for(var i=0; i<50000000; i++){} // Making it very slow to test time restriction
        return moves[index]
    }
}

/*
 * This is an efficient deterministic Agent that avoids giving squares and minimizes when giving
 * It is not random, though
 *
 */
class RandomFetus extends Agent{
    constructor(){ 
        super() 
        this.board = new Board()
    }

    compute(board, time){
        // Always cheks the current board status since opponent move can change several squares in the board
        var moves = this.valid_moves(board)
        this.board = board
        // Randomly picks one available move
        if (moves[0].length == 0){
            moves = moves[1]
            
            return this.get_best_option(moves)
        }
        else {
            moves = moves[0]
            var index = Math.floor(moves.length * Math.random())
        }
        
        return moves[index]
    }
    valid_moves(board){
        var recommended = []
        var n_recommended = []
        var size = board.length
        for( var i=0; i<size; i++)
            for( var j=0; j<size; j++)
                for( var s=0; s<4; s++){
                    let res = this.check(board, i, j, s)
                    if(res == 1){
                        recommended.push([i,j,s])
                        return [recommended, n_recommended]
                    }
                    else if(res == 2) n_recommended.push([i,j,s])
                }
        return [recommended, n_recommended]
    }
    check(board, r, c, s){
        if(board[r][c] < 0) return false
        var s_shift = 1<<s
        if(((board[r][c] & s_shift)==s_shift)) return false

        if ([14, 7, 11, 13].includes((board[r][c] | s_shift))) {
            return 2
        }
        if(r>0 && s==0){
            if ([14, 7, 11, 13].includes((board[r-1][c] | 4))) {
            return 2
        }
        }
        if(r<board.length-1 && s==2){
            if ([14, 7, 11, 13].includes((board[r+1][c] | 1))) {
            return 2
            }
        }
        if(c>0 && s==3){
            if ([14, 7, 11, 13].includes((board[r][c-1] | 2))) {
            return 2
            }
        }
        
        if(c<board.length-1 && s==1){
            if ([14, 7, 11, 13].includes((board[r][c+1] | 8))) {
            return 2
            }
        }
        return 1
    }

    fill(board, i, j){
        var count = 0
        var color = -2
        if(i<0 || i==board.length || j<0 || j==board.length) return count
    	
        if(board[i][j]==15 || board[i][j] == 14){
            board[i][j] = color
            if(i>0 && board[i-1][j]>=0){
                board[i-1][j] += 4
                count = this.fill(board,i-1,j)
                return count + 1
            }    
        }
        
        if(board[i][j]==15 || board[i][j] == 13){
            board[i][j] = color
            if(j<board.length-1 && board[i][j+1]>=0){
                board[i][j+1] += 8
                count = this.fill(board,i,j+1)
                return count + 1
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==11){
            board[i][j] = color
            if(i<board.length-1 && board[i+1][j]>=0){
                board[i+1][j] += 1
                count = this.fill(board,i+1,j)
                return count + 1
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==7){
            board[i][j] = color
            if(j>0 && board[i][j-1]>=0){
                board[i][j-1] += 2
                count = this.fill(board,i,j-1)
                return count + 1
            }    
        }
        return count
    }

    clone(board){
        var size = board.length
        var b = []
        for(var i=0; i<size; i++){
            b[i] = []
            for(var j=0; j<size; j++)
                b[i][j] = board[i][j]
        }
        return b
    }
    
    get_best_option(moves){
        let bestValue = Infinity;
        let bestMove = null;
        let n_board = null
        for (let i = 0; i < moves.length; i++){
            let move = moves[i];
            n_board = this.clone(this.board);

            var s = move[2]
            var row = move[0]
            var col = move[1]
            n_board[row][col] |= 1<<s
            var value = this.fill(n_board, row, col)
            if(row>0 && s==0){
                n_board[row-1][col] |= 4
                value += this.fill(n_board, row-1, col)
            }
            if(row<n_board.length-1 && s==2){
                n_board[row+1][col] |= 1
                value += this.fill(n_board, row+1, col)
            }
            if(col>0 && s==3){
                n_board[row][col-1] |= 2
                value += this.fill(n_board, row, col-1)
            }
            
            if(col<n_board.length-1 && s==1){
                n_board[row][col+1] |= 8
                value += this.fill(n_board, row, col+1)
            }

            if (value < bestValue) {
                bestValue = value;
                bestMove = move;
            }

            if (bestValue == 1) {
                return bestMove
            }
        }

        return bestMove;
    }
 
}

/*
 * This is a modified version of RandomFetus Agent
 * It tries not to recheck wrong moves and it is happier
 * It seems to be slower due to early return removal in valid_moves :(
 *
 */
class PibbleFetus extends Agent{
    constructor(){ 
        super() 
        this.board = null
        this.recommended = []
        this.n_recommended = []
    }

    compute(board, time){
        // First cheks the current board status since opponent move can change several squares in the board
        [this.recommended, this.n_recommended] = this.valid_moves(board)
        this.compute = this.compute_main
        this.board = board
        // Picks a good move
        if (this.recommended.length <= 0){
            return this.get_best_option(this.n_recommended)
        }
        var index = Math.floor(this.recommended.length * Math.random())
        var move = this.recommended[index]
        this.recommended.splice(index, 1)
        return move
    }

    compute_main(board, time){
        // Always checks the remaining valid moves
        this.valid_remaining_moves(board)
        this.board = board
        // Picks a good move
        if (this.recommended.length <= 0){
            if (this.n_recommended.length <= 0){
                [this.recommended, this.n_recommended] = this.valid_moves(board)
                return this.compute_main(board, time)
            }
            return this.get_best_option(this.n_recommended)
        }
        var index = Math.floor(this.recommended.length * Math.random())
        var move = this.recommended[index]
        this.recommended.splice(index, 1)
        return move
    }
    
    valid_moves(board){
        // Travel across all board positions the first time (it is slower at first move)
        var recommended = []
        var n_recommended = []
        var size = board.length
        for( var i=0; i<size; i++)
            for( var j=0; j<size; j++)
                for( var s=0; s<4; s++){
                    let res = this.check(board, i, j, s)
                    if(res == 1){
                        recommended.push([i,j,s])
                    }
                    else if(res == 2) n_recommended.push([i,j,s])
                }
        return [recommended, n_recommended]
    }

    valid_remaining_moves(board){
        // Complete travel (it is slower before the end)
        var index = 0
        while(index < this.recommended.length){
            let move = this.recommended[index]
            let i = move[0]
            let j = move[1]
            let s = move[2]
            let res = this.check(board, i, j, s)
            if(res == 1){
                index ++
            }
            else if(res == 2){
                this.n_recommended.push([i,j,s])
                this.recommended.splice(index, 1)
            }
            else this.recommended.splice(index, 1)
        }

        index = 0
        while(index < this.n_recommended.length){
            let move = this.n_recommended[index]
            let i = move[0]
            let j = move[1]
            let s = move[2]
            let res = this.check(board, i, j, s)
            if(res == 2){
                index ++
            }
            else this.n_recommended.splice(index, 1)
        }
    }

    check(board, r, c, s){
        if(board[r][c] < 0) return false
        var s_shift = 1<<s
        if(((board[r][c] & s_shift)==s_shift)) return false

        if ([14, 7, 11, 13].includes((board[r][c] | s_shift))) {
            return 2
        }
        if(r>0 && s==0){
            if ([14, 7, 11, 13].includes((board[r-1][c] | 4))) {
            return 2
        }
        }
        if(r<board.length-1 && s==2){
            if ([14, 7, 11, 13].includes((board[r+1][c] | 1))) {
            return 2
            }
        }
        if(c>0 && s==3){
            if ([14, 7, 11, 13].includes((board[r][c-1] | 2))) {
            return 2
            }
        }
        
        if(c<board.length-1 && s==1){
            if ([14, 7, 11, 13].includes((board[r][c+1] | 8))) {
            return 2
            }
        }
        return 1
    }

    fill(board, i, j){
        var count = 0
        var color = -2
        if(i<0 || i==board.length || j<0 || j==board.length) return count
    	
        if(board[i][j]==15 || board[i][j] == 14){
            board[i][j] = color
            if(i>0 && board[i-1][j]>=0){
                board[i-1][j] += 4
                count = this.fill(board,i-1,j)
                return count + 1
            }    
        }
        
        if(board[i][j]==15 || board[i][j] == 13){
            board[i][j] = color
            if(j<board.length-1 && board[i][j+1]>=0){
                board[i][j+1] += 8
                count = this.fill(board,i,j+1)
                return count + 1
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==11){
            board[i][j] = color
            if(i<board.length-1 && board[i+1][j]>=0){
                board[i+1][j] += 1
                count = this.fill(board,i+1,j)
                return count + 1
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==7){
            board[i][j] = color
            if(j>0 && board[i][j-1]>=0){
                board[i][j-1] += 2
                count = this.fill(board,i,j-1)
                return count + 1
            }    
        }
        return count
    }

    clone(board){
        var size = board.length
        var b = []
        for(var i=0; i<size; i++){
            b[i] = []
            for(var j=0; j<size; j++)
                b[i][j] = board[i][j]
        }
        return b
    }
    
    get_best_option(moves){
        let bestValue = Infinity;
        let bestMove = null;
        let bestIndex = 0;
        let n_board = null
        for (let i = 0; i < moves.length; i++){
            let move = moves[i];
            n_board = this.clone(this.board);

            var s = move[2]
            var row = move[0]
            var col = move[1]
            n_board[row][col] |= 1<<s
            var value = this.fill(n_board, row, col)
            if(row>0 && s==0){
                n_board[row-1][col] |= 4
                value += this.fill(n_board, row-1, col)
            }
            if(row<n_board.length-1 && s==2){
                n_board[row+1][col] |= 1
                value += this.fill(n_board, row+1, col)
            }
            if(col>0 && s==3){
                n_board[row][col-1] |= 2
                value += this.fill(n_board, row, col-1)
            }
            
            if(col<n_board.length-1 && s==1){
                n_board[row][col+1] |= 8
                value += this.fill(n_board, row, col+1)
            }

            if (value < bestValue) {
                bestValue = value;
                bestMove = move;
                bestIndex = i;
            }

            if (bestValue == 1) {
                moves.splice(bestIndex, 1)
                return bestMove
            }
        }

        moves.splice(bestIndex, 1)
        return bestMove;
    }
 
}


/*
 * This is a modified version of PibbleFetus Agent
 * It checks chain (but seems to be worse)
 *
 */
class PityFetus extends Agent{
    constructor(){ 
        super() 
        this.board = null
        this.first_recommended = []
        this.second_recommended = []
        this.n_recommended = []
    }

    compute(board, time){
        // First cheks the current board status since opponent move can change several squares in the board
        this.board = board
        [this.first_recommended, this.n_recommended, this.second_recommended] = this.valid_moves(board)
        this.compute = this.compute_main
        return this.compute(board,time)
    }

    compute_main(board, time){
        // Always checks the remaining valid moves
        this.board = board
        this.valid_remaining_moves(board)
        // Picks a good move
        if (this.first_recommended.length <= 0){
            if (this.n_recommended.length <= 0){
                [this.first_recommended, this.n_recommended, this.second_recommended] = this.valid_moves(board)
                return this.compute_main(board, time)
            }
            if (this.second_recommended.length <= 0) return this.get_best_option(this.n_recommended)
            var index = Math.floor(this.second_recommended.length * Math.random())
            var move = this.second_recommended[index]
            this.second_recommended.splice(index, 1)
            return move
        }
        var index = Math.floor(this.first_recommended.length * Math.random())
        var move = this.first_recommended[index]
        this.first_recommended.splice(index, 1)
        return move
    }
    
    valid_moves(board){
        // Travel across all board positions the first time (it is slower at first move)
        var first_recommended = []
        var second_recommended = []
        var n_recommended = []
        var size = board.length
        for( var i=0; i<size; i++)
            for( var j=0; j<size; j++)
                for( var s=0; s<4; s++){
                    let res = this.check(board, i, j, s)
                    if(res == 1){
                        if (!this.check_chain(i,j,s, board)) {
                            first_recommended.push([i,j,s])
                        }
                        second_recommended.push([i,j,s])
                    }
                    else if(res == 2) n_recommended.push([i,j,s])
                }
        return [first_recommended, n_recommended, second_recommended]
    }

    valid_remaining_moves(board){
        // Complete travel (it is slower before the end)
        var index = 0
        while(index < this.first_recommended.length){
            let move = this.first_recommended[index]
            let i = move[0]
            let j = move[1]
            let s = move[2]
            let res = this.check(board, i, j, s)
            if(res == 1){
                if (!this.check_chain(i,j,s, board)) {
                    index ++
                }
                else {
                    this.second_recommended.push([i,j,s])
                    this.first_recommended.splice(index, 1)
                }
            }
            else if(res == 2){
                this.n_recommended.push([i,j,s])
                this.first_recommended.splice(index, 1)
            }
            else this.first_recommended.splice(index, 1)
        }

        index = 0
        while(index < this.second_recommended.length){
            let move = this.second_recommended[index]
            let i = move[0]
            let j = move[1]
            let s = move[2]
            let res = this.check(board, i, j, s)
            if(res == 1){
                index ++
            }
            else if(res == 2){
                this.n_recommended.push([i,j,s])
                this.second_recommended.splice(index, 1)
            }
            else this.second_recommended.splice(index, 1)
        }

        index = 0
        while(index < this.n_recommended.length){
            let move = this.n_recommended[index]
            let i = move[0]
            let j = move[1]
            let s = move[2]
            let res = this.check(board, i, j, s)
            if(res == 2){
                index ++
            }
            else this.n_recommended.splice(index, 1)
        }
    }

    check(board, r, c, s){
        if(board[r][c] < 0) return false
        var s_shift = 1<<s
        if(((board[r][c] & s_shift)==s_shift)) return false

        if ([14, 7, 11, 13].includes((board[r][c] | s_shift))) {
            return 2
        }
        if(r>0 && s==0){
            if ([14, 7, 11, 13].includes((board[r-1][c] | 4))) {
            return 2
        }
        }
        if(r<board.length-1 && s==2){
            if ([14, 7, 11, 13].includes((board[r+1][c] | 1))) {
            return 2
            }
        }
        if(c>0 && s==3){
            if ([14, 7, 11, 13].includes((board[r][c-1] | 2))) {
            return 2
            }
        }
        
        if(c<board.length-1 && s==1){
            if ([14, 7, 11, 13].includes((board[r][c+1] | 8))) {
            return 2
            }
        }
        return 1
    }

    check_chain(i, j, s, board){
        var n = board.length - 1
        if (s == 1 || s == 3){
            if (i != 0 && i != n){
                return ((board[i-1][j] == 10 || board[i+1][j] == 10) && (board[i][j] == 2 || board[i][j] == 8))
            }
            else if (i == 0){
                return (( board[i+1][j] == 10) && (board[i][j] == 2 || board[i][j] == 8))
            }
            else if (i == n){
                return ((board[i-1][j] == 10) && (board[i][j] == 2 || board[i][j] == 8))
            }
        }
        else if (s == 0|| s == 2 ){
            if (j != 0 && j != n){
                
                return (((board[i][j-1]) == 5 || (board[i][j+1]) == 5) && ((board[i][j]) == 1 || (board[i][j]) == 4))
            }
            else if (j == 0){
                return (( board[i][j+1] == 5) && (board[i][j] == 1 || board[i][j] == 4))
            }
            else if (j == n){
                return ((board[i][j-1] == 5) && (board[i][j] == 1 || board[i][j] == 4))
            }
        }
    }

    fill(board, i, j){
        var count = 0
        var color = -2
        if(i<0 || i==board.length || j<0 || j==board.length) return count
    	
        if(board[i][j]==15 || board[i][j] == 14){
            board[i][j] = color
            if(i>0 && board[i-1][j]>=0){
                board[i-1][j] += 4
                count = this.fill(board,i-1,j)
                return count + 1
            }    
        }
        
        if(board[i][j]==15 || board[i][j] == 13){
            board[i][j] = color
            if(j<board.length-1 && board[i][j+1]>=0){
                board[i][j+1] += 8
                count = this.fill(board,i,j+1)
                return count + 1
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==11){
            board[i][j] = color
            if(i<board.length-1 && board[i+1][j]>=0){
                board[i+1][j] += 1
                count = this.fill(board,i+1,j)
                return count + 1
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==7){
            board[i][j] = color
            if(j>0 && board[i][j-1]>=0){
                board[i][j-1] += 2
                count = this.fill(board,i,j-1)
                return count + 1
            }    
        }
        return count
    }

    clone(board){
        var size = board.length
        var b = []
        for(var i=0; i<size; i++){
            b[i] = []
            for(var j=0; j<size; j++)
                b[i][j] = board[i][j]
        }
        return b
    }
    
    get_best_option(moves){
        let bestValue = Infinity;
        let bestMove = null;
        let bestIndex = 0;
        let n_board = null
        for (let i = 0; i < moves.length; i++){
            let move = moves[i];
            n_board = this.clone(this.board);

            var s = move[2]
            var row = move[0]
            var col = move[1]
            n_board[row][col] |= 1<<s
            var value = this.fill(n_board, row, col)
            if(row>0 && s==0){
                n_board[row-1][col] |= 4
                value += this.fill(n_board, row-1, col)
            }
            if(row<n_board.length-1 && s==2){
                n_board[row+1][col] |= 1
                value += this.fill(n_board, row+1, col)
            }
            if(col>0 && s==3){
                n_board[row][col-1] |= 2
                value += this.fill(n_board, row, col-1)
            }
            
            if(col<n_board.length-1 && s==1){
                n_board[row][col+1] |= 8
                value += this.fill(n_board, row, col+1)
            }

            if (value < bestValue) {
                bestValue = value;
                bestMove = move;
                bestIndex = i;
            }

            if (bestValue == 1) {
                moves.splice(bestIndex, 1)
                return bestMove
            }
        }

        moves.splice(bestIndex, 1)
        return bestMove;
    }
 
}


// Fetus Fetus is a modified version of random fetus that avoids making chains so no points are given away
class FetusFetus extends Agent{
    constructor(){ 
        super() 
        this.board = new Board()
    }

    compute(board, time){
        // Always cheks the current board status since opponent move can change several squares in the board
        this.board = board
        var moves = this.valid_moves(board)

        // Randomly picks one available move
        if (moves[0].length == 0){
            if (moves[2].length == 0) return this.get_best_option(moves[1])
            
            moves = moves[2]
            
            return moves[0]
        }

        moves = moves[0]

        return moves[0]
    }
    valid_moves(board){
        var first_recommended = []
        var second_recommended = []
        var n_recommended = []
        var size = board.length
        for( var i=0; i<size; i++)
            for( var j=0; j<size; j++)
                for( var s=0; s<4; s++){
                    let res = this.check(board, i, j, s)
                    if(res == 1){
                        if (!this.check_chain(i,j,s)) {
                            first_recommended.push([i,j,s])
                            return [first_recommended, n_recommended, second_recommended]
                        }
                        second_recommended.push([i,j,s])
                    }
                    else if(res == 2) n_recommended.push([i,j,s])
                }
        return [first_recommended, n_recommended, second_recommended]
    }
    check(board, r, c, s){
        if(board[r][c] < 0) return false
        var s_shift = 1<<s
        if(((board[r][c] & s_shift)==s_shift)) return false

        if ([14, 7, 11, 13].includes((board[r][c] | s_shift))) {
            return 2
        }
        if(r>0 && s==0){
            if ([14, 7, 11, 13].includes((board[r-1][c] | 4))) {
            return 2
        }
        }
        if(r<board.length-1 && s==2){
            if ([14, 7, 11, 13].includes((board[r+1][c] | 1))) {
            return 2
            }
        }
        if(c>0 && s==3){
            if ([14, 7, 11, 13].includes((board[r][c-1] | 2))) {
            return 2
            }
        }
        
        if(c<board.length-1 && s==1){
            if ([14, 7, 11, 13].includes((board[r][c+1] | 8))) {
            return 2
            }
        }
        return 1
    }

    check_chain(i, j, s){
        var n = this.board.length - 1
        if (s == 1 || s == 3){
            if (i != 0 && i != n){
                return ((this.board[i-1][j] == 10 || this.board[i+1][j] == 10) && (this.board[i][j] == 2 || this.board[i][j] == 8))
            }
            else if (i == 0){
                return (( this.board[i+1][j] == 10) && (this.board[i][j] == 2 || this.board[i][j] == 8))
            }
            else if (i == n){
                return ((this.board[i-1][j] == 10) && (this.board[i][j] == 2 || this.board[i][j] == 8))
            }
        }
        else if (s == 0|| s == 2 ){
            if (j != 0 && j != n){
                
                return (((this.board[i][j-1]) == 5 || (this.board[i][j+1]) == 5) && ((this.board[i][j]) == 1 || (this.board[i][j]) == 4))
            }
            else if (j == 0){
                return (( this.board[i][j+1] == 5) && (this.board[i][j] == 1 || this.board[i][j] == 4))
            }
            else if (j == n){
                return ((this.board[i][j-1] == 5) && (this.board[i][j] == 1 || this.board[i][j] == 4))
            }

        }
    }

    fill(board, i, j){
        var count = 0
        var color = -2
        if(i<0 || i==board.length || j<0 || j==board.length) return count
        
        if(board[i][j]==15 || board[i][j] == 14){
            board[i][j] = color
            if(i>0 && board[i-1][j]>=0){
                board[i-1][j] += 4
                count = this.fill(board,i-1,j)
                return count + 1
            }    
        }
        
        if(board[i][j]==15 || board[i][j] == 13){
            board[i][j] = color
            if(j<board.length-1 && board[i][j+1]>=0){
                board[i][j+1] += 8
                count = this.fill(board,i,j+1)
                return count + 1
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==11){
            board[i][j] = color
            if(i<board.length-1 && board[i+1][j]>=0){
                board[i+1][j] += 1
                count = this.fill(board,i+1,j)
                return count + 1
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==7){
            board[i][j] = color
            if(j>0 && board[i][j-1]>=0){
                board[i][j-1] += 2
                count = this.fill(board,i,j-1)
                return count + 1
            }    
        }
        return count
    }

    clone(board){
        var size = board.length
        var b = []
        for(var i=0; i<size; i++){
            b[i] = []
            for(var j=0; j<size; j++)
                b[i][j] = board[i][j]
        }
        return b
    }
    
    get_best_option(moves){
        let bestValue = Infinity;
        let bestMove = null;
        let n_board = null
        for (let i = 0; i < moves.length; i++){
            let move = moves[i];
            n_board = this.clone(this.board);

            var s = move[2]
            var row = move[0]
            var col = move[1]
            n_board[row][col] |= 1<<s
            var value = this.fill(n_board, row, col)
            if(row>0 && s==0){
                n_board[row-1][col] |= 4
                value += this.fill(n_board, row-1, col)
            }
            if(row<n_board.length-1 && s==2){
                n_board[row+1][col] |= 1
                value += this.fill(n_board, row+1, col)
            }
            if(col>0 && s==3){
                n_board[row][col-1] |= 2
                value += this.fill(n_board, row, col-1)
            }
            
            if(col<n_board.length-1 && s==1){
                n_board[row][col+1] |= 8
                value += this.fill(n_board, row, col+1)
            }

            if (value < bestValue) {
                bestValue = value;
                bestMove = move;
            }

            if (bestValue == 1) {
                return bestMove
            }
        }

        return bestMove;
    }
 
}


// PibbleFetus but returning first recommended, using "swap and pop" instead of splice, 
// without .includes and using ===
class LastFetus extends Agent{
    constructor(){ 
        super()
        this.recommended = []
        this.n_recommended = []
        this.board = null
    }

    init(color, board, time=20000){
        super.init(color, board, time);
        [this.recommended, this.n_recommended] = this.valid_moves(board)
    }

    compute(board, time){
        // Always checks the remaining valid moves
        this.board = board
        var recommended_move = this.valid_remaining_moves(board)
        // Picks a good move
        if (!recommended_move){
            if (this.n_recommended.length <= 0){
                [this.recommended, this.n_recommended] = this.valid_moves(board)
                return this.compute(board, time)
            }
            return this.get_best_option(this.n_recommended)
        }
        return recommended_move
    }
    
    valid_moves(board){
        // Travel across all board positions the first time (it is slower at first move)
        var recommended = []
        var n_recommended = []
        var size = board.length
        for( var i=size-1; i>=0; i--)
            for( var j=size-1; j>=0; j--)
                for( var s=3; s>=0; s--){
                    let res = this.check(board, i, j, s)
                    if(res === 1){
                        recommended.push([i,j,s])
                    }
                    else if(res === 2) n_recommended.push([i,j,s])
                }
        return [recommended, n_recommended]
    }

    valid_remaining_moves(board){
        // Complete travel (it is slower before the end)
        var index = 0
        while(index < this.recommended.length){
            let move = this.recommended[index]
            let i = move[0]
            let j = move[1]
            let s = move[2]
            let res = this.check(board, i, j, s)
            if(res === 1){
                this.recommended[index] = this.recommended[this.recommended.length - 1]
                this.recommended.pop()
                return [i,j,s]
            }
            else if(res === 2){
                this.n_recommended.push([i,j,s])
                this.recommended[index] = this.recommended[this.recommended.length - 1]
                this.recommended.pop()
            }
            else {
                this.recommended[index] = this.recommended[this.recommended.length - 1]
                this.recommended.pop()
            }
        }

        index = 0
        while(index < this.n_recommended.length){
            let move = this.n_recommended[index]
            let i = move[0]
            let j = move[1]
            let s = move[2]
            let res = this.check(board, i, j, s)
            if(res === 2){
                index ++
            }
            else {
                this.n_recommended[index] = this.n_recommended[this.n_recommended.length - 1]
                this.n_recommended.pop()
            }
        }
    }

    check(board, r, c, s){
        if(board[r][c] < 0) return false
        var s_shift = 1<<s
        if(((board[r][c] & s_shift) === s_shift)) return false

        let v = board[r][c] | s_shift
        if(v === 14 || v === 13 || v === 11 || v === 7){
            return 2
        }

        if(r > 0 && s === 0){
            v = board[r-1][c] | 4
            if(v === 14 || v === 13 || v === 11 || v === 7) return 2
        }

        if(r < board.length-1 && s === 2){
            v = board[r+1][c] | 1
            if(v === 14 || v === 13 || v === 11 || v === 7) return 2
        }

        if(c > 0 && s === 3){
            v = board[r][c-1] | 2
            if(v === 14 || v === 13 || v === 11 || v === 7) return 2
        }

        if(c < board.length-1 && s === 1){
            v = board[r][c+1] | 8
            if(v === 14 || v === 13 || v === 11 || v === 7) return 2
        }

        return 1
    }

    fill(board, i, j){
        var count = 0
        var color = -2
        if(i<0 || i===board.length || j<0 || j===board.length) return count
    	
        if(board[i][j]===15 || board[i][j] === 14){
            board[i][j] = color
            if(i>0 && board[i-1][j]>=0){
                board[i-1][j] += 4
                count = this.fill(board,i-1,j)
                return count + 1
            }    
        }
        
        if(board[i][j]===15 || board[i][j] === 13){
            board[i][j] = color
            if(j<board.length-1 && board[i][j+1]>=0){
                board[i][j+1] += 8
                count = this.fill(board,i,j+1)
                return count + 1
            }    
        }
        
        if(board[i][j]===15 || board[i][j]===11){
            board[i][j] = color
            if(i<board.length-1 && board[i+1][j]>=0){
                board[i+1][j] += 1
                count = this.fill(board,i+1,j)
                return count + 1
            }    
        }
        
        if(board[i][j]===15 || board[i][j]===7){
            board[i][j] = color
            if(j>0 && board[i][j-1]>=0){
                board[i][j-1] += 2
                count = this.fill(board,i,j-1)
                return count + 1
            }    
        }
        return count
    }

    clone(board){
        var size = board.length
        var b = []
        for(var i=0; i<size; i++){
            b[i] = []
            for(var j=0; j<size; j++)
                b[i][j] = board[i][j]
        }
        return b
    }
    
    get_best_option(moves){
        let bestValue = Infinity;
        let bestMove = null;
        let bestIndex = 0;
        let n_board = null
        for (let i = 0; i < moves.length; i++){
            let move = moves[i];
            n_board = this.clone(this.board);

            var s = move[2]
            var row = move[0]
            var col = move[1]
            n_board[row][col] |= 1<<s
            var value = this.fill(n_board, row, col)
            if(row>0 && s===0){
                n_board[row-1][col] |= 4
                value += this.fill(n_board, row-1, col)
            }
            if(row<n_board.length-1 && s===2){
                n_board[row+1][col] |= 1
                value += this.fill(n_board, row+1, col)
            }
            if(col>0 && s===3){
                n_board[row][col-1] |= 2
                value += this.fill(n_board, row, col-1)
            }
            
            if(col<n_board.length-1 && s===1){
                n_board[row][col+1] |= 8
                value += this.fill(n_board, row, col+1)
            }

            if (value < bestValue) {
                bestValue = value;
                bestMove = move;
                bestIndex = i;
            }

            if (bestValue === 1) {
                moves[bestIndex] = moves[moves.length - 1]
                moves.pop()
                return bestMove
            }
        }

        moves[bestIndex] = moves[moves.length - 1]
        moves.pop()
        return bestMove;
    }
 
}


class silksongPlayer extends Agent {
    constructor() {
        super();
        this.boardUtil = new Board();
        this.transpositionTable = new Map();
        this.nodeCount = 0;
    }

    init(color, board, time=20000){
        super.init(color, board, time);
        this.ply = (color === 'R') ? -1 : -2;
        this.oppPly = (this.ply === -1) ? -2 : -1;
    }

    // Minimax functions (4x4 or smaller grids)
    
    countSides(cellValue){
        let count = 0;
        if(cellValue & 1) count++;  // Top
        if(cellValue & 2) count++;  // Right
        if(cellValue & 4) count++;  // Bottom
        if(cellValue & 8) count++;  // Left
        return count;
    }

    evaluateMinimax(board){
        let my = 0, opp = 0;
        let totalBoxes = board.length * board.length;
        
        for(let i=0; i<board.length; i++){
            for(let j=0; j<board.length; j++){
                if(board[i][j] === this.ply) my++;
                else if(board[i][j] === this.oppPly) opp++;
            }
        }
        
        // Terminal state detection
        if(my + opp === totalBoxes){
            if(my > opp) return 1000000 + my;
            if(opp > my) return -1000000 - opp;
            return 0;
        }
        
        // Count strategic positions
        let my3sided = 0;
        let safe2sided = 0;
        
        for(let i=0; i<board.length; i++){
            for(let j=0; j<board.length; j++){
                if(board[i][j] >= 0){
                    let sides = this.countSides(board[i][j]);
                    if(sides === 3) my3sided++;
                    else if(sides === 2) safe2sided++;
                }
            }
        }
        
        return (my - opp) * 100 + my3sided * 20 + safe2sided * 1;
    }

    hashBoard(board, playerPly){
        let hash = playerPly + '|';
        for(let i=0; i<board.length; i++){
            for(let j=0; j<board.length; j++){
                hash += board[i][j] + ',';
            }
        }
        return hash;
    }

    orderedMovesMinimax(board, playerPly){
        let moves = this.boardUtil.valid_moves(board);
        let scored = [];
        
        for(let m of moves){
            let clone = this.boardUtil.clone(board);
            let boxesBefore = this.countCapturedBoxes(clone);
            
            this.boardUtil.move(clone, m[0], m[1], m[2], playerPly);
            
            let boxesAfter = this.countCapturedBoxes(clone);
            let boxesGained = boxesAfter - boxesBefore;
            let threeSidedAfter = this.count3SidedBoxes(clone);
            let twoSidedAfter = this.count2SidedBoxes(clone);
            
            let score = 0;
            if(boxesGained > 0){
                score = 10000 + boxesGained * 1000;
            } else {
                score = -threeSidedAfter * 100 + twoSidedAfter;
            }
            
            scored.push({move: m, score: score});
        }
        
        scored.sort((a,b) => b.score - a.score);
        return scored.map(x => x.move);
    }

    countCapturedBoxes(board){
        let count = 0;
        for(let i=0; i<board.length; i++){
            for(let j=0; j<board.length; j++){
                if(board[i][j] < 0) count++;
            }
        }
        return count;
    }

    count3SidedBoxes(board){
        let count = 0;
        for(let i=0; i<board.length; i++){
            for(let j=0; j<board.length; j++){
                if(board[i][j] >= 0 && this.countSides(board[i][j]) === 3){
                    count++;
                }
            }
        }
        return count;
    }

    count2SidedBoxes(board){
        let count = 0;
        for(let i=0; i<board.length; i++){
            for(let j=0; j<board.length; j++){
                if(board[i][j] >= 0 && this.countSides(board[i][j]) === 2){
                    count++;
                }
            }
        }
        return count;
    }

    minimax(board, playerPly, alpha, beta, depth){
        this.nodeCount++;

        let hash = this.hashBoard(board, playerPly);
        if(this.transpositionTable.has(hash)){
            return this.transpositionTable.get(hash);
        }

        let moves = this.boardUtil.valid_moves(board);
        
        if(moves.length === 0){
            let result = {value: this.evaluateMinimax(board), move: null};
            this.transpositionTable.set(hash, result);
            return result;
        }

        moves = this.orderedMovesMinimax(board, playerPly);

        let bestMove = moves[0]; // Initialize with first valid move

        if(playerPly === this.ply){
            let value = -Infinity;
            
            for(let m of moves){
                let clone = this.boardUtil.clone(board);
                let ok = this.boardUtil.move(clone, m[0], m[1], m[2], playerPly);
                
                if(!ok) continue;
                
                let gainedBoxes = this.hasGainedBoxes(board, clone, playerPly);
                let nextPly = gainedBoxes ? playerPly : this.oppPly;
                
                let child = this.minimax(clone, nextPly, alpha, beta, depth + 1);
                
                if(child.value > value){
                    value = child.value;
                    bestMove = m;
                }
                
                alpha = Math.max(alpha, value);
                if(alpha >= beta) break;
            }
            
            let result = {value: value, move: bestMove};
            this.transpositionTable.set(hash, result);
            return result;
            
        } else {
            let value = Infinity;
            
            for(let m of moves){
                let clone = this.boardUtil.clone(board);
                let ok = this.boardUtil.move(clone, m[0], m[1], m[2], playerPly);
                
                if(!ok) continue;
                
                let gainedBoxes = this.hasGainedBoxes(board, clone, playerPly);
                let nextPly = gainedBoxes ? playerPly : this.ply;
                
                let child = this.minimax(clone, nextPly, alpha, beta, depth + 1);
                
                if(child.value < value){
                    value = child.value;
                    bestMove = m;
                }
                
                beta = Math.min(beta, value);
                if(alpha >= beta) break;
            }
            
            let result = {value: value, move: bestMove};
            this.transpositionTable.set(hash, result);
            return result;
        }
    }

    hasGainedBoxes(oldBoard, newBoard, ply){
        for(let i=0; i<oldBoard.length; i++){
            for(let j=0; j<oldBoard.length; j++){
                if(oldBoard[i][j] >= 0 && newBoard[i][j] === ply){
                    return true;
                }
            }
        }
        return false;
    }

    // Heuristic functions 

    countBits(x) {
        let c = 0;
        for (let k = 0; k < 4; k++) if (x & (1 << k)) c++;
        return c;
    }

    evaluate(board, player) {
        const opp = (player === -1) ? -2 : -1;
        let myScore = 0, oppScore = 0;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
                const v = board[i][j];
                if (v === player) myScore++;
                else if (v === opp) oppScore++;
            }
        }
        return myScore - oppScore;
    }

    computePhase(board) {
        let lines = 0, total = board.length * board.length * 4;
        for (let i = 0; i < board.length; i++)
            for (let j = 0; j < board.length; j++)
                if (board[i][j] >= 0) lines += this.countBits(board[i][j]);
        return lines / total;
    }

    willGiveAway(board, i, j, s) {
        const size = board.length;
        const near = [[i,j],[i-1,j],[i+1,j],[i,j-1],[i,j+1]];
        for (const [ni, nj] of near) {
            if (ni < 0 || nj < 0 || ni >= size || nj >= size) continue;
            const v = board[ni][nj];
            if (v >= 0 && this.countBits(v) === 3) return true;
        }
        return false;
    }

    givesOpponentBox(board, i, j, s) {
        const size = board.length;
        const adj = [[i,j],[i-1,j],[i+1,j],[i,j-1],[i,j+1]];
        for (const [x,y] of adj) {
            if (x < 0 || y < 0 || x >= size || y >= size) continue;
            const v = board[x][y];
            if (v >= 0 && this.countBits(v) === 3) return true;
        }
        return false;
    }

    createsMyChain(board, i, j, s) {
        const size = board.length;
        const adj = [[i,j],[i-1,j],[i+1,j],[i,j-1],[i,j+1]];
        let count = 0;
        for (const [x,y] of adj) {
            if (x < 0 || y < 0 || x >= size || y >= size) continue;
            const v = board[x][y];
            if (v >= 0 && this.countBits(v) === 2) count++;
        }
        return count;
    }

    secondStrategy(board, player, phase, moves) {
        let bestMove = moves[0];
        let bestScore = -Infinity;
        const gainWeight = phase > 0.6 ? 1.8 : 1.2;
        const riskWeight = phase < 0.5 ? 0.8 : 1.4;

        const baseEval = this.evaluate(board, player);

        for (const [i, j, s] of moves) {
            if (!this.boardUtil.check(board, i, j, s)) continue;
            const clone = this.boardUtil.clone(board);
            this.boardUtil.move(clone, i, j, s, player);

            const gain = this.evaluate(clone, player) - baseEval;

            let opponentBoxes = 0;
            for (let x = 0; x < clone.length; x++)
                for (let y = 0; y < clone.length; y++)
                    if (clone[x][y] >= 0 && this.countBits(clone[x][y]) === 3)
                        opponentBoxes++;

            const giveAway = this.willGiveAway(board, i, j, s);
            const score =
                gain * gainWeight
                - giveAway * 2.0
                - opponentBoxes * riskWeight
                + Math.random() * 0.01;

            if (score > bestScore) {
                bestScore = score;
                bestMove = [i, j, s];
            }
        }

        return bestMove;
    }

    firstStrategy(board, player, phase, moves) {
        let bestMove = moves[0];
        let bestScore = -Infinity;
        const early = phase < 0.35;
        const late = phase > 0.75;
        const baseScore = this.evaluate(board, player);

        for (const [i, j, s] of moves) {
            const clone = this.boardUtil.clone(board);
            this.boardUtil.move(clone, i, j, s, player);

            const afterScore = this.evaluate(clone, player);
            const gain = afterScore - baseScore;
            const givesBox = this.givesOpponentBox(board, i, j, s);
            const chain = this.createsMyChain(board, i, j, s);

            const cx = (board.length - 1) / 2;
            const centerBias = 1 - (Math.abs(i - cx) + Math.abs(j - cx)) / board.length;

            let score =
                gain * 5.0 +
                chain * 1.2 +
                centerBias * (early ? 1.5 : 0.3) -
                givesBox * (late ? 3.0 : 1.2)
                + Math.random() * 0.01;

            if (score > bestScore) {
                bestScore = score;
                bestMove = [i, j, s];
            }
        }

        return bestMove;
    }

    // Main compute function 

    compute(board, time) {
        const boardSize = board.length;

        // Use full minimax for 4x4 or smaller grids
        if(boardSize <= 4){
            this.nodeCount = 0;
            this.transpositionTable.clear();

            const moves = this.boardUtil.valid_moves(board);
            if(!moves.length) return [0,0,0];

            const result = this.minimax(
                this.boardUtil.clone(board),
                this.ply,
                -Infinity,
                Infinity,
                0
            );

            // Safety check: ensure we return a valid move
            if(result.move && this.boardUtil.check(board, result.move[0], result.move[1], result.move[2])){
                return result.move;
            }
            
            // Fallback: find first valid move
            for(let m of moves){
                if(this.boardUtil.check(board, m[0], m[1], m[2])){
                    return m;
                }
            }
            
            return moves[0]; // Last resort
        }

        // Use heuristic strategy for larger grids
        const player = (this.color === 'R') ? -1 : -2;
        const isFirst = (this.color === 'R');
        const moves = this.boardUtil.valid_moves(board);
        if (!moves.length) return [0,0,0];

        const phase = this.computePhase(board);

        return isFirst
            ? this.firstStrategy(board, player, phase, moves)
            : this.secondStrategy(board, player, phase, moves);
    }
}

/*
 * Environment (Cannot be modified or any of its attributes accesed directly)
 */
class Environment extends MainClient{
	constructor(){ 
        super()
        this.board = new Board()
    }

    setPlayers(players){ this.players = players }

	// Initializes the game 
	init(){ 
        var white = Konekti.vc('R').value // Name of competitor with red pieces
        console.log(white)
        var black = Konekti.vc('Y').value // Name of competitor with yellow pieces
        var time = 1000*parseInt(Konekti.vc('time').value) // Maximum playing time assigned to a competitor (milliseconds)
        var size = parseInt(Konekti.vc('size').value) // Size of the reversi board
        
        this.size = size
        this.rb = this.board.init(size)
        this.board.print(this.rb)
        var b1 = this.board.clone(this.rb)
        var b2 = this.board.clone(this.rb)

        this.white = white
        this.black = black
        this.ptime = {'R':time, 'Y':time}
        Konekti.vc('R_time').innerHTML = ''+time
        Konekti.vc('Y_time').innerHTML = ''+time
        this.player = 'R'
        this.winner = ''

        this.players[white].init('R', b1, time)
        this.players[black].init('Y', b2, time)
    }

    // Listen to play button 
	play(){ 
        var TIME = 10
        var x = this
        var board = x.board
        x.player = 'R'
        Konekti.vc('log').innerHTML = 'The winner is...'

        x.init()
        var start = -1

        function clock(){
            if(x.winner!='') return
            if(start==-1) setTimeout(clock,TIME)
            else{
                var end = Date.now()
                var ellapsed = end - start
                var remaining = x.ptime[x.player] - ellapsed
                Konekti.vc(x.player+'_time').innerHTML = remaining
                Konekti.vc((x.player=='R'?'Y':'R')+'_time').innerHTML = x.ptime[x.player=='R'?'Y':'R']
                
                if(remaining <= 0) x.winner = (x.player=='R'?x.black:x.white) + ' since ' + (x.player=='R'?x.white:x.black) + 'got time out'
                else setTimeout(clock,TIME) 
            }
        }
        
        function compute(){
            var w = x.player=='R'
            var id = w?x.white:x.black
            var nid = w?x.black:x.white
            var b = board.clone(x.rb)
            start = Date.now()
            var action = x.players[id].compute(b, x.ptime[x.player])
            var end = Date.now()
            var ply = (x.player=='R')?-1:-2
            var flag = board.move(x.rb, action[0], action[1], action[2], ply)
            if(!flag){
                x.winner = nid + ' ...Invalid move taken by ' + id + ' on column ' + action
            }else{
                var winner = board.winner(x.rb)
                if(winner!= ' ') x.winner = winner
                else{
                    var ellapsed = end - start
                    x.ptime[x.player] -= ellapsed
                    Konekti.vc(x.player+'_time').innerHTML = ''+x.ptime[x.player]
                    if(x.ptime[x.player] <= 0){ 
                        x.winner = nid + ' since ' + id + ' got run of time'
                    }else{
                        x.player = w?'Y':'R'
                    }
                }    
            }

            board.print(x.rb)
            start = -1
            if(x.winner=='') setTimeout(compute,TIME)
            else Konekti.vc('log').innerHTML = 'The winner is ' + x.winner
        }

        board.print(x.rb)
        setTimeout(clock, 1000)
        setTimeout(compute, 1000)
    }
}

// Drawing commands
function custom_commands(){
    return [
        { 
            "command":" ", "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":255, "green":255, "blue":255, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                }

            ]},
        { 
            "command":"-", 
            "commands":[
                {
                    "command":"strokeStyle",
                    "color":{"red":128, "green":128, "blue":128, "alpha":255}
                },
                {
                    "command":"polyline",
                    "x":[0,0,1,1,0],
                    "y":[0,1,1,0,0]
                }
            ]
        },
        { 
            "command":"u", 
            "commands":[
                {
                    "command":"strokeStyle",
                    "color":{"red":0, "green":0, "blue":255, "alpha":255}
                },
                {
                    "command":"polyline",
                    "x":[0,1],
                    "y":[0,0]
                }
            ]
        },
        { 
            "command":"d", 
            "commands":[
                {
                    "command":"strokeStyle",
                    "color":{"red":0, "green":0, "blue":255, "alpha":255}
                },
                {
                    "command":"polyline",
                    "x":[0,1],
                    "y":[1,1]
                }
            ]
        },
        { 
            "command":"r", 
            "commands":[
                {
                    "command":"strokeStyle",
                    "color":{"red":0, "green":0, "blue":255, "alpha":255}
                },
                {
                    "command":"polyline",
                    "x":[1,1],
                    "y":[0,1]
                }
            ]
        },
        { 
            "command":"l", 
            "commands":[
                {
                    "command":"strokeStyle",
                    "color":{"red":0, "green":0, "blue":255, "alpha":255}
                },
                {
                    "command":"polyline",
                    "x":[0,0],
                    "y":[0,1]
                }
            ]
        },
        {
            "command":"R",
            "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":255, "green":0, "blue":0, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                }
            ]
        },  
        {
            "command":"Y",
            "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":255, "green":255, "blue":0, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                },
            ]
        }
    ] 
}

