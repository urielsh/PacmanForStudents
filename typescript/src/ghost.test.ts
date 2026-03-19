import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Ghost } from './ghost';
import { Maze } from './maze';

describe('Ghost', () => {
    let maze: Maze;

    beforeEach(() => {
        maze = new Maze();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initial position', () => {
        it('should start at the given coordinates', () => {
            const ghost = new Ghost(10, 10, 'Blinky', '#FF0000');
            expect(ghost.gridX).toBe(10);
            expect(ghost.gridY).toBe(10);
        });

        it('should store name and color', () => {
            const ghost = new Ghost(10, 10, 'Blinky', '#FF0000');
            expect(ghost.name).toBe('Blinky');
            expect(ghost.color).toBe('#FF0000');
        });

        it('should support different start positions', () => {
            const ghost = new Ghost(15, 20, 'Pinky', '#FFB8FF');
            expect(ghost.gridX).toBe(15);
            expect(ghost.gridY).toBe(20);
        });
    });

    describe('20-frame movement interval', () => {
        it('should not move before 20 frames', () => {
            const ghost = new Ghost(10, 15, 'Blinky', '#FF0000');
            // Mock random to always return 0 (direction [-1, 0], i.e., left)
            vi.spyOn(Math, 'random').mockReturnValue(0);

            for (let i = 0; i < 19; i++) {
                ghost.update(maze);
            }
            // After 19 updates, ghost should not have moved
            expect(ghost.gridX).toBe(10);
            expect(ghost.gridY).toBe(15);
        });

        it('should move on the 20th frame', () => {
            const ghost = new Ghost(10, 15, 'Blinky', '#FF0000');
            // Mock random to return 0 → direction index 0 → [-1, 0] (left)
            vi.spyOn(Math, 'random').mockReturnValue(0);

            for (let i = 0; i < 20; i++) {
                ghost.update(maze);
            }
            // After 20 updates, ghost should have moved left once
            expect(ghost.gridX).toBe(9);
            expect(ghost.gridY).toBe(15);
        });

        it('should move again on the 40th frame', () => {
            const ghost = new Ghost(10, 15, 'Blinky', '#FF0000');
            vi.spyOn(Math, 'random').mockReturnValue(0); // always left

            for (let i = 0; i < 40; i++) {
                ghost.update(maze);
            }
            // Moved left twice
            expect(ghost.gridX).toBe(8);
            expect(ghost.gridY).toBe(15);
        });
    });

    describe('wall avoidance', () => {
        it('should not move into a wall', () => {
            // Place ghost at (1, 1) — near border walls
            const ghost = new Ghost(1, 1, 'Blinky', '#FF0000');
            // Mock random to return 0 → direction [-1, 0] (left into wall at x=0)
            vi.spyOn(Math, 'random').mockReturnValue(0);

            for (let i = 0; i < 20; i++) {
                ghost.update(maze);
            }
            // Should stay at (1,1) because x=0 is a wall
            expect(ghost.gridX).toBe(1);
            expect(ghost.gridY).toBe(1);
        });

        it('should move when random direction leads to open space', () => {
            // Place ghost at (10, 15) — open space
            const ghost = new Ghost(10, 15, 'Blinky', '#FF0000');
            // Mock random to return 0.25 → Math.floor(0.25*4)=1 → direction [1,0] (right)
            vi.spyOn(Math, 'random').mockReturnValue(0.25);

            for (let i = 0; i < 20; i++) {
                ghost.update(maze);
            }
            expect(ghost.gridX).toBe(11);
            expect(ghost.gridY).toBe(15);
        });

        it('should stay put when random direction leads to internal wall', () => {
            // Place ghost at (19, 10) — next to vertical wall at x=20
            const ghost = new Ghost(19, 10, 'Blinky', '#FF0000');
            // Mock random → direction index 1 → [1, 0] (right into wall at x=20)
            vi.spyOn(Math, 'random').mockReturnValue(0.25);

            for (let i = 0; i < 20; i++) {
                ghost.update(maze);
            }
            // (20, 10) is a wall (vertical wall), so ghost stays
            expect(ghost.gridX).toBe(19);
            expect(ghost.gridY).toBe(10);
        });
    });

    describe('different directions via Math.random', () => {
        it('should move up when random selects direction index 2', () => {
            // direction index 2 → [0, -1] (up)
            const ghost = new Ghost(10, 15, 'Blinky', '#FF0000');
            vi.spyOn(Math, 'random').mockReturnValue(0.5); // Math.floor(0.5*4)=2

            for (let i = 0; i < 20; i++) {
                ghost.update(maze);
            }
            expect(ghost.gridX).toBe(10);
            expect(ghost.gridY).toBe(14);
        });

        it('should move down when random selects direction index 3', () => {
            // direction index 3 → [0, 1] (down)
            const ghost = new Ghost(10, 15, 'Blinky', '#FF0000');
            vi.spyOn(Math, 'random').mockReturnValue(0.75); // Math.floor(0.75*4)=3

            for (let i = 0; i < 20; i++) {
                ghost.update(maze);
            }
            expect(ghost.gridX).toBe(10);
            expect(ghost.gridY).toBe(16);
        });
    });
});
