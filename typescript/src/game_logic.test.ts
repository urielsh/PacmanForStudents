import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLogic } from './game_logic';

describe('GameLogic', () => {
    let game: GameLogic;

    beforeEach(() => {
        game = new GameLogic();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initial state', () => {
        it('should start with score 0', () => {
            expect(game.score).toBe(0);
        });

        it('should start with gameOver = false', () => {
            expect(game.gameOver).toBe(false);
        });

        it('should have a maze', () => {
            expect(game.maze).toBeDefined();
        });

        it('should have a pacman at (5, 5)', () => {
            expect(game.pacman.gridX).toBe(5);
            expect(game.pacman.gridY).toBe(5);
        });

        it('should have 4 ghosts', () => {
            expect(game.ghosts.length).toBe(4);
        });
    });

    describe('pellet scoring (+10)', () => {
        it('should add 10 points when pacman moves onto a pellet', () => {
            // Pacman starts at (5,5) which has no pellet. Move right to (6,5) which has a pellet.
            game.pacman.setDirection(1, 0);
            // Mock random=0.5 so ghosts try to go up into walls and stay put
            vi.spyOn(Math, 'random').mockReturnValue(0.5);

            game.update();

            expect(game.pacman.gridX).toBe(6);
            expect(game.pacman.gridY).toBe(5);
            expect(game.score).toBe(10);
        });

        it('should accumulate score across multiple pellets', () => {
            game.pacman.setDirection(1, 0);
            vi.spyOn(Math, 'random').mockReturnValue(0.5);

            game.update(); // move to (6,5), collect pellet
            game.update(); // move to (7,5), collect pellet
            game.update(); // move to (8,5), collect pellet

            expect(game.score).toBe(30);
        });

        it('should not score when revisiting a tile where pellet was already collected', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);

            game.pacman.setDirection(1, 0);
            game.update(); // (6,5) - collect pellet, score = 10

            // Move back left
            game.pacman.setDirection(-1, 0);
            game.update(); // (5,5) - no pellet at start
            game.update(); // (4,5) - collect pellet, score = 20

            // Move right again through (5,5) and (6,5) — both pellet-free now
            game.pacman.setDirection(1, 0);
            game.update(); // (5,5) - no pellet
            game.update(); // (6,5) - pellet already collected

            expect(game.score).toBe(20);
        });
    });

    describe('ghost collision = gameOver', () => {
        /**
         * Helper: navigates pacman to (11,11) where ghost Clyde sits.
         * Uses Math.random mock of 0.5 so ghosts try to move up into walls.
         * Ghost at (11,11) tries up to (11,10) = wall, so it stays put.
         * Route: right 10 to (15,5), down 6 to (15,11), left 4 to (11,11).
         * Total = 20 frames. On frame 20, pacman arrives at (11,11) and
         * ghost stays at (11,11), triggering collision.
         */
        function navigatePacmanToGhost(game: GameLogic): void {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);

            // Move right from (5,5) to (15,5): 10 frames
            game.pacman.setDirection(1, 0);
            for (let i = 0; i < 10; i++) {
                game.update();
            }

            // Move down from (15,5) to (15,11): 6 frames
            game.pacman.setDirection(0, 1);
            for (let i = 0; i < 6; i++) {
                game.update();
            }

            // Move left from (15,11) to (11,11): 4 frames (frame 17-20)
            game.pacman.setDirection(-1, 0);
            for (let i = 0; i < 4; i++) {
                game.update();
            }
        }

        it('should set gameOver when pacman collides with a ghost', () => {
            navigatePacmanToGhost(game);

            expect(game.pacman.gridX).toBe(11);
            expect(game.pacman.gridY).toBe(11);
            expect(game.gameOver).toBe(true);
        });

        it('should detect collision after pacman and ghost occupy same tile', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);

            // Verify game is not over before navigation
            expect(game.gameOver).toBe(false);

            // Navigate most of the way — stop 1 step short
            game.pacman.setDirection(1, 0);
            for (let i = 0; i < 10; i++) {
                game.update();
            }
            game.pacman.setDirection(0, 1);
            for (let i = 0; i < 6; i++) {
                game.update();
            }
            game.pacman.setDirection(-1, 0);
            for (let i = 0; i < 3; i++) {
                game.update();
            }

            // One step away from ghost at (11,11), pacman at (12,11)
            expect(game.pacman.gridX).toBe(12);
            expect(game.pacman.gridY).toBe(11);
            expect(game.gameOver).toBe(false);

            // One more step — collision
            game.update();
            expect(game.pacman.gridX).toBe(11);
            expect(game.gameOver).toBe(true);
        });
    });

    describe('no updates after gameOver', () => {
        function triggerGameOver(game: GameLogic): void {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);

            game.pacman.setDirection(1, 0);
            for (let i = 0; i < 10; i++) {
                game.update();
            }
            game.pacman.setDirection(0, 1);
            for (let i = 0; i < 6; i++) {
                game.update();
            }
            game.pacman.setDirection(-1, 0);
            for (let i = 0; i < 4; i++) {
                game.update();
            }
        }

        it('should not change score after gameOver', () => {
            triggerGameOver(game);
            expect(game.gameOver).toBe(true);
            const scoreAtGameOver = game.score;

            // Try to keep playing — score should not change
            game.pacman.setDirection(1, 0);
            game.update();
            game.update();
            game.update();

            expect(game.score).toBe(scoreAtGameOver);
        });

        it('should not move pacman after gameOver', () => {
            triggerGameOver(game);
            expect(game.gameOver).toBe(true);
            const pacX = game.pacman.gridX;
            const pacY = game.pacman.gridY;

            // Try to move — pacman should stay put
            game.pacman.setDirection(1, 0);
            game.update();

            expect(game.pacman.gridX).toBe(pacX);
            expect(game.pacman.gridY).toBe(pacY);
        });
    });
});
