import { describe, it, expect } from 'vitest';
import { Maze } from './maze';

describe('Maze', () => {
    let maze: Maze;

    beforeEach(() => {
        maze = new Maze();
    });

    describe('dimensions', () => {
        it('should have width of 40', () => {
            expect(maze.width).toBe(40);
        });

        it('should have height of 30', () => {
            expect(maze.height).toBe(30);
        });
    });

    describe('border walls', () => {
        it('top border (y=0) should be walls', () => {
            for (let x = 0; x < maze.width; x++) {
                expect(maze.isWall(x, 0)).toBe(true);
            }
        });

        it('bottom border (y=29) should be walls', () => {
            for (let x = 0; x < maze.width; x++) {
                expect(maze.isWall(x, maze.height - 1)).toBe(true);
            }
        });

        it('left border (x=0) should be walls', () => {
            for (let y = 0; y < maze.height; y++) {
                expect(maze.isWall(0, y)).toBe(true);
            }
        });

        it('right border (x=39) should be walls', () => {
            for (let y = 0; y < maze.height; y++) {
                expect(maze.isWall(maze.width - 1, y)).toBe(true);
            }
        });
    });

    describe('internal walls', () => {
        it('horizontal wall at row 10, columns 5-14', () => {
            for (let x = 5; x < 15; x++) {
                expect(maze.isWall(x, 10)).toBe(true);
            }
        });

        it('horizontal wall at row 20, columns 5-14', () => {
            for (let x = 5; x < 15; x++) {
                expect(maze.isWall(x, 20)).toBe(true);
            }
        });

        it('vertical wall at column 20, rows 5-24', () => {
            for (let y = 5; y < 25; y++) {
                expect(maze.isWall(20, y)).toBe(true);
            }
        });
    });

    describe('open spaces', () => {
        it('interior non-wall tiles should not be walls', () => {
            // (1,1) is interior and not part of any internal wall
            expect(maze.isWall(1, 1)).toBe(false);
            // (5,5) is Pacman start — not a wall
            expect(maze.isWall(5, 5)).toBe(false);
            // (10,15) is between the two horizontal walls, not on vertical wall
            expect(maze.isWall(10, 15)).toBe(false);
        });
    });

    describe('out-of-bounds treated as wall', () => {
        it('negative x is a wall', () => {
            expect(maze.isWall(-1, 5)).toBe(true);
        });

        it('negative y is a wall', () => {
            expect(maze.isWall(5, -1)).toBe(true);
        });

        it('x >= width is a wall', () => {
            expect(maze.isWall(40, 5)).toBe(true);
        });

        it('y >= height is a wall', () => {
            expect(maze.isWall(5, 30)).toBe(true);
        });

        it('large out-of-bounds coordinates are walls', () => {
            expect(maze.isWall(100, 100)).toBe(true);
        });
    });

    describe('hasPellet', () => {
        it('interior non-wall tiles have pellets', () => {
            // (1,1) is inside, not a wall, not Pacman start
            expect(maze.hasPellet(1, 1)).toBe(true);
            expect(maze.hasPellet(2, 2)).toBe(true);
        });

        it('walls do not have pellets', () => {
            // border wall
            expect(maze.hasPellet(0, 0)).toBe(false);
            // internal wall
            expect(maze.hasPellet(5, 10)).toBe(false);
        });

        it('Pacman start position (5,5) has no pellet', () => {
            expect(maze.hasPellet(5, 5)).toBe(false);
        });

        it('out-of-bounds returns false', () => {
            expect(maze.hasPellet(-1, 0)).toBe(false);
            expect(maze.hasPellet(0, -1)).toBe(false);
            expect(maze.hasPellet(40, 0)).toBe(false);
            expect(maze.hasPellet(0, 30)).toBe(false);
        });
    });

    describe('removePellet', () => {
        it('removes pellet from a tile that has one', () => {
            expect(maze.hasPellet(1, 1)).toBe(true);
            maze.removePellet(1, 1);
            expect(maze.hasPellet(1, 1)).toBe(false);
        });

        it('removing pellet from tile without pellet is a no-op', () => {
            maze.removePellet(1, 1);
            maze.removePellet(1, 1); // second removal should not throw
            expect(maze.hasPellet(1, 1)).toBe(false);
        });

        it('removing pellet out-of-bounds does not throw', () => {
            expect(() => maze.removePellet(-1, -1)).not.toThrow();
            expect(() => maze.removePellet(100, 100)).not.toThrow();
        });
    });
});
