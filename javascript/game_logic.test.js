const { GameLogic } = require('./game_logic');

describe('GameLogic', () => {
    let game;

    beforeEach(() => {
        game = new GameLogic();
    });

    describe('initial state', () => {
        test('initial score is 0', () => {
            expect(game.score).toBe(0);
        });

        test('initial gameOver is false', () => {
            expect(game.gameOver).toBe(false);
        });
    });

    describe('pellet scoring', () => {
        test('moving pacman to a pellet tile increases score by 10', () => {
            // Pacman starts at (5,5) which has no pellet (start position).
            // Moving right to (6,5) which has a pellet.
            expect(game.maze.hasPellet(6, 5)).toBe(true);

            game.pacman.setDirection(1, 0); // right

            // Mock ghost random movement to prevent interference
            const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0);

            game.update();

            expect(game.pacman.gridX).toBe(6);
            expect(game.pacman.gridY).toBe(5);
            expect(game.score).toBe(10);
            expect(game.maze.hasPellet(6, 5)).toBe(false);

            mockRandom.mockRestore();
        });

        test('collecting multiple pellets accumulates score', () => {
            const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0);

            game.pacman.setDirection(1, 0); // right
            game.update(); // move to (6,5) - collect pellet, score = 10
            game.update(); // move to (7,5) - collect pellet, score = 20

            expect(game.score).toBe(20);

            mockRandom.mockRestore();
        });
    });

    describe('ghost collision', () => {
        test('game over when ghost is on same tile as pacman', () => {
            // Ghost "Clyde" starts at (11,11). Place pacman directly on that tile
            // by setting its internal coordinates, then trigger a collision check via update.
            const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0);

            // Directly place pacman at ghost Clyde's position (11,11)
            game.pacman._gridX = 11;
            game.pacman._gridY = 11;

            // One update will check collisions and detect the overlap
            game.update();

            expect(game.gameOver).toBe(true);

            mockRandom.mockRestore();
        });

        test('game does not update after gameOver', () => {
            const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0);

            // Place pacman on ghost to trigger gameOver
            game.pacman._gridX = 11;
            game.pacman._gridY = 11;
            game.update();

            expect(game.gameOver).toBe(true);
            const scoreAtGameOver = game.score;
            const posX = game.pacman.gridX;
            const posY = game.pacman.gridY;

            // Further updates should do nothing
            game.pacman.setDirection(1, 0);
            game.update();
            expect(game.score).toBe(scoreAtGameOver);
            expect(game.pacman.gridX).toBe(posX);
            expect(game.pacman.gridY).toBe(posY);

            mockRandom.mockRestore();
        });
    });
});
