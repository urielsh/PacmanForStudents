const { Maze } = require('./maze');

describe('Maze', () => {
    let maze;

    beforeEach(() => {
        maze = new Maze();
    });

    describe('border walls', () => {
        test('top-left corner (0,0) is a wall', () => {
            expect(maze.isWall(0, 0)).toBe(true);
        });

        test('top-right corner (39,0) is a wall', () => {
            expect(maze.isWall(39, 0)).toBe(true);
        });

        test('bottom-left corner (0,29) is a wall', () => {
            expect(maze.isWall(0, 29)).toBe(true);
        });

        test('bottom-right corner (39,29) is a wall', () => {
            expect(maze.isWall(39, 29)).toBe(true);
        });
    });

    describe('internal walls', () => {
        test('(5,10) is a wall (horizontal wall row 10)', () => {
            expect(maze.isWall(5, 10)).toBe(true);
        });

        test('(14,10) is a wall (horizontal wall row 10)', () => {
            expect(maze.isWall(14, 10)).toBe(true);
        });

        test('(20,5) is a wall (vertical wall column 20)', () => {
            expect(maze.isWall(20, 5)).toBe(true);
        });

        test('(20,24) is a wall (vertical wall column 20)', () => {
            expect(maze.isWall(20, 24)).toBe(true);
        });
    });

    describe('open spaces', () => {
        test('(1,1) is not a wall', () => {
            expect(maze.isWall(1, 1)).toBe(false);
        });

        test('(5,5) is not a wall', () => {
            expect(maze.isWall(5, 5)).toBe(false);
        });
    });

    describe('pellets', () => {
        test('hasPellet on open non-start tile returns true', () => {
            // (1,1) is open and not the start position (5,5)
            expect(maze.hasPellet(1, 1)).toBe(true);
        });

        test('hasPellet on wall returns false', () => {
            expect(maze.hasPellet(0, 0)).toBe(false);
        });

        test('removePellet removes the pellet', () => {
            expect(maze.hasPellet(1, 1)).toBe(true);
            maze.removePellet(1, 1);
            expect(maze.hasPellet(1, 1)).toBe(false);
        });
    });

    describe('out-of-bounds', () => {
        test('negative x is treated as wall', () => {
            expect(maze.isWall(-1, 5)).toBe(true);
        });

        test('negative y is treated as wall', () => {
            expect(maze.isWall(5, -1)).toBe(true);
        });

        test('x beyond width is treated as wall', () => {
            expect(maze.isWall(40, 5)).toBe(true);
        });

        test('y beyond height is treated as wall', () => {
            expect(maze.isWall(5, 30)).toBe(true);
        });
    });
});
