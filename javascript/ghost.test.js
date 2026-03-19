const { Ghost } = require('./ghost');
const { Maze } = require('./maze');

describe('Ghost', () => {
    let ghost;
    let maze;

    beforeEach(() => {
        ghost = new Ghost(15, 15, 'TestGhost', '#FF0000');
        maze = new Maze();
    });

    describe('initial position', () => {
        test('gridX matches constructor startX', () => {
            expect(ghost.gridX).toBe(15);
        });

        test('gridY matches constructor startY', () => {
            expect(ghost.gridY).toBe(15);
        });

        test('name matches constructor arg', () => {
            expect(ghost.name).toBe('TestGhost');
        });

        test('color matches constructor arg', () => {
            expect(ghost.color).toBe('#FF0000');
        });
    });

    describe('ghost does not move into walls', () => {
        test('ghost stays in place when random direction picks a wall', () => {
            // Place ghost adjacent to a wall. (1,1) is open; (0,1) is a border wall.
            // If ghost picks left (-1,0), it would try (0,1) which is a wall.
            const wallAdjacentGhost = new Ghost(1, 1, 'WallTest', '#00FF00');

            // Mock Math.random to return 0 (index 0 = [-1, 0] = left direction)
            const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0);

            // Advance moveCounter to 20 so ghost tries to move
            for (let i = 0; i < 20; i++) {
                wallAdjacentGhost.update(maze);
            }

            // Ghost should not have moved into the wall at (0,1)
            expect(wallAdjacentGhost.gridX).toBe(1);
            expect(wallAdjacentGhost.gridY).toBe(1);

            mockRandom.mockRestore();
        });
    });

    describe('movement every 20 frames', () => {
        test('ghost does not move before 20 frames', () => {
            // Mock Math.random to always return 0.25 (index 1 = [1,0] = right)
            const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.25);

            for (let i = 0; i < 19; i++) {
                ghost.update(maze);
            }

            // After 19 frames, ghost should not have moved
            expect(ghost.gridX).toBe(15);
            expect(ghost.gridY).toBe(15);

            mockRandom.mockRestore();
        });

        test('ghost moves on the 20th frame', () => {
            // Mock Math.random to return 0.25 => floor(0.25*4) = 1 => [1,0] = right
            const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.25);

            for (let i = 0; i < 20; i++) {
                ghost.update(maze);
            }

            // After 20 frames, ghost should have moved right to (16,15)
            expect(ghost.gridX).toBe(16);
            expect(ghost.gridY).toBe(15);

            mockRandom.mockRestore();
        });

        test('ghost moves again on the 40th frame', () => {
            // Mock Math.random to return 0.25 => direction [1,0] = right
            const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.25);

            for (let i = 0; i < 40; i++) {
                ghost.update(maze);
            }

            // After 40 frames, ghost should have moved right twice to (17,15)
            expect(ghost.gridX).toBe(17);
            expect(ghost.gridY).toBe(15);

            mockRandom.mockRestore();
        });
    });
});
