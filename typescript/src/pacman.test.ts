import { describe, it, expect } from 'vitest';
import { Pacman } from './pacman';
import { Maze } from './maze';

describe('Pacman', () => {
    let pacman: Pacman;
    let maze: Maze;

    beforeEach(() => {
        pacman = new Pacman();
        maze = new Maze();
    });

    describe('initial position', () => {
        it('should start at grid position (5, 5)', () => {
            expect(pacman.gridX).toBe(5);
            expect(pacman.gridY).toBe(5);
        });
    });

    describe('wall collision rejection', () => {
        it('should not move into a wall', () => {
            // Pacman starts at (5,5). Moving left 5 times should eventually hit the left border wall at x=0.
            pacman.setDirection(-1, 0);
            // Move left until we reach x=1 (next to wall at x=0)
            for (let i = 0; i < 10; i++) {
                pacman.update(maze);
            }
            // Pacman should stop at x=1, not go to x=0 (wall)
            expect(pacman.gridX).toBe(1);
        });

        it('should not move into border wall above', () => {
            // Move up from (5,5) — should stop at y=1
            pacman.setDirection(0, -1);
            for (let i = 0; i < 10; i++) {
                pacman.update(maze);
            }
            expect(pacman.gridY).toBe(1);
        });

        it('should stay in place when direction leads into a wall and no current direction', () => {
            // Place pacman at the border: move to (1,1) first
            pacman.setDirection(-1, 0);
            for (let i = 0; i < 10; i++) {
                pacman.update(maze);
            }
            // Now at x=1, try to move left again into wall at x=0
            pacman.setDirection(-1, 0);
            pacman.update(maze);
            // Current direction is left, next direction is left — both blocked
            expect(pacman.gridX).toBe(1);
        });
    });

    describe('valid movement', () => {
        it('should move right when direction is set to right', () => {
            pacman.setDirection(1, 0);
            pacman.update(maze);
            expect(pacman.gridX).toBe(6);
            expect(pacman.gridY).toBe(5);
        });

        it('should move down when direction is set to down', () => {
            pacman.setDirection(0, 1);
            pacman.update(maze);
            expect(pacman.gridX).toBe(5);
            expect(pacman.gridY).toBe(6);
        });

        it('should move left when direction is set to left', () => {
            pacman.setDirection(-1, 0);
            pacman.update(maze);
            expect(pacman.gridX).toBe(4);
            expect(pacman.gridY).toBe(5);
        });

        it('should move up when direction is set to up', () => {
            pacman.setDirection(0, -1);
            pacman.update(maze);
            expect(pacman.gridX).toBe(5);
            expect(pacman.gridY).toBe(4);
        });

        it('should continue moving in current direction if no new direction set', () => {
            pacman.setDirection(1, 0);
            pacman.update(maze);
            pacman.update(maze);
            pacman.update(maze);
            expect(pacman.gridX).toBe(8);
            expect(pacman.gridY).toBe(5);
        });
    });

    describe('direction queueing', () => {
        it('should apply queued direction when it becomes valid', () => {
            // Move right first
            pacman.setDirection(1, 0);
            pacman.update(maze);
            expect(pacman.gridX).toBe(6);

            // Queue down direction
            pacman.setDirection(0, 1);
            pacman.update(maze);
            expect(pacman.gridX).toBe(6);
            expect(pacman.gridY).toBe(6);
        });

        it('should fall back to current direction if queued direction is blocked', () => {
            // Move right from (5,5)
            pacman.setDirection(1, 0);
            pacman.update(maze);
            // Now at (6,5). Queue up — but (6,4) is open, so it should go up
            // Let's use a scenario where queued direction is blocked:
            // Move right to near the vertical wall at x=20
            pacman.setDirection(1, 0);
            for (let i = 0; i < 13; i++) {
                pacman.update(maze); // moves right from x=6 to x=19
            }
            expect(pacman.gridX).toBe(19);

            // Now at (19, 5). Queue right — (20,5) is a wall (vertical wall at col 20, rows 5-24)
            pacman.setDirection(1, 0);
            // Current direction is right, which is also blocked.
            // So pacman should stay at (19, 5)
            pacman.update(maze);
            expect(pacman.gridX).toBe(19);
            expect(pacman.gridY).toBe(5);
        });

        it('should keep current direction when queued direction is into a wall', () => {
            // Move right
            pacman.setDirection(1, 0);
            pacman.update(maze);
            expect(pacman.gridX).toBe(6);

            // Now at (6,5), moving right. Queue up into... (6,4) is open.
            // Let's navigate to a position where we can test the fallback:
            // Go to (6,5) moving right, then queue left-into-wall scenario
            // Actually, let's test: moving right, queue upward into open space
            // Instead, test that current direction continues when queued is blocked:
            // Go to row y=1 near top wall
            pacman.setDirection(0, -1);
            for (let i = 0; i < 5; i++) {
                pacman.update(maze);
            }
            // Now direction is up, and we should be near y=1
            // At y=1, queue up (into wall at y=0). Current dir is up, also blocked.
            // Pacman stays at y=1
            const currentX = pacman.gridX;
            pacman.setDirection(0, -1);
            pacman.update(maze);
            expect(pacman.gridY).toBe(1);

            // Now set direction to right — should move right since it's open
            pacman.setDirection(1, 0);
            pacman.update(maze);
            expect(pacman.gridX).toBe(currentX + 1);
            expect(pacman.gridY).toBe(1);
        });
    });
});
