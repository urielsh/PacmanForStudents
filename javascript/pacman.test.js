const { Pacman } = require('./pacman');
const { Maze } = require('./maze');

describe('Pacman', () => {
    let pacman;
    let maze;

    beforeEach(() => {
        pacman = new Pacman();
        maze = new Maze();
    });

    describe('initial position', () => {
        test('starts at x=5', () => {
            expect(pacman.gridX).toBe(5);
        });

        test('starts at y=5', () => {
            expect(pacman.gridY).toBe(5);
        });
    });

    describe('wall collision rejection', () => {
        test('moving into a wall keeps position unchanged', () => {
            // (5,5) is the start. Moving left 5 times would reach border wall at x=0.
            // But let's directly try to move into the wall at (5,10) by going down from (5,9).
            // Simpler: move pacman up towards the top border wall at y=0.
            // From (5,5), set direction up (0,-1) and update 4 times to reach (5,1).
            pacman.setDirection(0, -1);
            pacman.update(maze); // (5,4)
            pacman.update(maze); // (5,3)
            pacman.update(maze); // (5,2)
            pacman.update(maze); // (5,1)

            // Now at (5,1), top border is at y=0. Trying to move up should be blocked.
            pacman.update(maze); // should stay at (5,1) since (5,0) is a wall
            expect(pacman.gridX).toBe(5);
            expect(pacman.gridY).toBe(1);
        });
    });

    describe('valid movement', () => {
        test('moving into open space changes position', () => {
            pacman.setDirection(1, 0); // move right
            pacman.update(maze);
            expect(pacman.gridX).toBe(6);
            expect(pacman.gridY).toBe(5);
        });

        test('moving down into open space changes position', () => {
            pacman.setDirection(0, 1); // move down
            pacman.update(maze);
            expect(pacman.gridX).toBe(5);
            expect(pacman.gridY).toBe(6);
        });
    });

    describe('direction queueing', () => {
        test('setDirection queues direction, update applies it', () => {
            // Move right first
            pacman.setDirection(1, 0);
            pacman.update(maze);
            expect(pacman.gridX).toBe(6);
            expect(pacman.gridY).toBe(5);

            // Queue downward direction
            pacman.setDirection(0, 1);
            pacman.update(maze);
            expect(pacman.gridX).toBe(6);
            expect(pacman.gridY).toBe(6);
        });

        test('if queued direction is blocked, continues in current direction', () => {
            // Move right from (5,5)
            pacman.setDirection(1, 0);
            pacman.update(maze); // (6,5)
            pacman.update(maze); // (7,5)

            // Now at (7,5). Queue upward, which should be open.
            // Let's instead get to a position where queued direction is blocked.
            // Navigate to (5,9): from (5,5) go down 4 steps
            pacman = new Pacman();
            pacman.setDirection(0, 1); // move down
            pacman.update(maze); // (5,6)
            pacman.update(maze); // (5,7)
            pacman.update(maze); // (5,8)
            pacman.update(maze); // (5,9)

            // Current direction is down (0,1). Next would be (5,10) which is a wall.
            // Queue left direction (-1,0). (4,9) is open, so it should turn left.
            pacman.setDirection(-1, 0);
            pacman.update(maze);
            expect(pacman.gridX).toBe(4);
            expect(pacman.gridY).toBe(9);
        });
    });
});
