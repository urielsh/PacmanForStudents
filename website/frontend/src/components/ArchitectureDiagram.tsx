import { useState } from 'react';

type Language = 'java' | 'python' | 'javascript' | 'typescript' | 'cpp';

interface MethodSignatures {
  java: string[];
  python: string[];
  javascript: string[];
  typescript: string[];
  cpp: string[];
}

interface ClassBox {
  name: string;
  color: string;
  methods: MethodSignatures;
  row: number;
  col: number;
}

const classes: ClassBox[] = [
  {
    name: 'Maze',
    color: '#0000FF',
    row: 0,
    col: 1,
    methods: {
      java: ['Maze()', 'boolean isWall(int x, int y)', 'boolean hasPellet(int x, int y)', 'void removePellet(int x, int y)', 'void draw(Graphics g, int tileSize)'],
      python: ['def __init__(self)', 'def is_wall(self, x, y) -> bool', 'def has_pellet(self, x, y) -> bool', 'def remove_pellet(self, x, y)', 'def draw(self, screen, tile_size)'],
      javascript: ['constructor()', 'isWall(x, y)', 'hasPellet(x, y)', 'removePellet(x, y)', 'draw(ctx, tileSize)'],
      typescript: ['constructor()', 'isWall(x: number, y: number): boolean', 'hasPellet(x: number, y: number): boolean', 'removePellet(x: number, y: number): void', 'draw(ctx: CanvasRenderingContext2D, tileSize: number): void'],
      cpp: ['Maze()', 'bool isWall(int x, int y) const', 'bool hasPellet(int x, int y) const', 'void removePellet(int x, int y)', 'void draw(SDL_Renderer* r, int tileSize)'],
    },
  },
  {
    name: 'Pacman',
    color: '#FFFF00',
    row: 1,
    col: 0,
    methods: {
      java: ['Pacman(int x, int y, int size)', 'void setDirection(int dx, int dy)', 'void update(Maze maze)', 'void draw(Graphics g)', 'int getGridX()', 'int getGridY()'],
      python: ['def __init__(self, x, y, size)', 'def set_direction(self, dx, dy)', 'def update(self, maze)', 'def draw(self, screen)', 'def get_grid_x(self) -> int', 'def get_grid_y(self) -> int'],
      javascript: ['constructor(x, y, size)', 'setDirection(dx, dy)', 'update(maze)', 'draw(ctx)', 'getGridX()', 'getGridY()'],
      typescript: ['constructor(x: number, y: number, size: number)', 'setDirection(dx: number, dy: number): void', 'update(maze: Maze): void', 'draw(ctx: CanvasRenderingContext2D): void', 'getGridX(): number', 'getGridY(): number'],
      cpp: ['Pacman(int x, int y, int size)', 'void setDirection(int dx, int dy)', 'void update(Maze& maze)', 'void draw(SDL_Renderer* r)', 'int getGridX() const', 'int getGridY() const'],
    },
  },
  {
    name: 'Ghost',
    color: '#FF0000',
    row: 1,
    col: 2,
    methods: {
      java: ['Ghost(int x, int y, int size, Color color)', 'void update(Maze maze)', 'void draw(Graphics g)', 'int getGridX()', 'int getGridY()'],
      python: ['def __init__(self, x, y, size, color)', 'def update(self, maze)', 'def draw(self, screen)', 'def get_grid_x(self) -> int', 'def get_grid_y(self) -> int'],
      javascript: ['constructor(x, y, size, color)', 'update(maze)', 'draw(ctx)', 'getGridX()', 'getGridY()'],
      typescript: ['constructor(x: number, y: number, size: number, color: string)', 'update(maze: Maze): void', 'draw(ctx: CanvasRenderingContext2D): void', 'getGridX(): number', 'getGridY(): number'],
      cpp: ['Ghost(int x, int y, int size, SDL_Color color)', 'void update(Maze& maze)', 'void draw(SDL_Renderer* r)', 'int getGridX() const', 'int getGridY() const'],
    },
  },
  {
    name: 'GameLogic',
    color: '#00FFFF',
    row: 2,
    col: 1,
    methods: {
      java: ['GameLogic()', 'void checkCollisions(Pacman p, Ghost[] ghosts)', 'Maze getMaze()', 'int getScore()', 'boolean isGameOver()'],
      python: ['def __init__(self)', 'def check_collisions(self, pacman, ghosts)', 'def get_maze(self) -> Maze', 'def get_score(self) -> int', 'def is_game_over(self) -> bool'],
      javascript: ['constructor()', 'checkCollisions(pacman, ghosts)', 'getMaze()', 'getScore()', 'isGameOver()'],
      typescript: ['constructor()', 'checkCollisions(pacman: Pacman, ghosts: Ghost[]): void', 'getMaze(): Maze', 'getScore(): number', 'isGameOver(): boolean'],
      cpp: ['GameLogic()', 'void checkCollisions(Pacman& p, std::vector<Ghost>& ghosts)', 'Maze& getMaze()', 'int getScore() const', 'bool isGameOver() const'],
    },
  },
  {
    name: 'GamePanel',
    color: '#FFB8FF',
    row: 3,
    col: 0,
    methods: {
      java: ['GamePanel()', 'void startGame()', 'void update()', 'void render(Graphics g)', 'void handleInput(KeyEvent e)'],
      python: ['def __init__(self)', 'def start_game(self)', 'def update(self)', 'def render(self, screen)', 'def handle_input(self, event)'],
      javascript: ['constructor()', 'startGame()', 'update()', 'render(ctx)', 'handleInput(event)'],
      typescript: ['constructor()', 'startGame(): void', 'update(): void', 'render(ctx: CanvasRenderingContext2D): void', 'handleInput(event: KeyboardEvent): void'],
      cpp: ['GamePanel()', 'void startGame()', 'void update()', 'void render(SDL_Renderer* r)', 'void handleInput(SDL_Event& e)'],
    },
  },
  {
    name: 'Main / Entry',
    color: '#FF00FF',
    row: 3,
    col: 2,
    methods: {
      java: ['public static void main(String[] args)', 'new JFrame("Pacman")', 'frame.add(new GamePanel())'],
      python: ['if __name__ == "__main__":', 'pygame.init()', 'game = GamePanel()', 'game.start_game()'],
      javascript: ['window.onload = () => { ... }', 'const canvas = document.getElementById(...)', 'const game = new GamePanel(canvas)'],
      typescript: ['window.onload = (): void => { ... }', 'const canvas = document.getElementById(...) as HTMLCanvasElement', 'const game = new GamePanel(canvas)'],
      cpp: ['int main(int argc, char* argv[])', 'SDL_Init(SDL_INIT_VIDEO)', 'GamePanel game(window, renderer)', 'game.startGame()'],
    },
  },
];

const languageLabels: Record<Language, { label: string; color: string }> = {
  java: { label: 'Java', color: '#ED8B00' },
  python: { label: 'Python', color: '#3776AB' },
  javascript: { label: 'JavaScript', color: '#F7DF1E' },
  typescript: { label: 'TypeScript', color: '#3178C6' },
  cpp: { label: 'C++', color: '#00599C' },
};

/* Relationship data: [from, to, label] */
const relationships: [string, string, string][] = [
  ['GamePanel', 'GameLogic', 'owns'],
  ['GamePanel', 'Pacman', 'owns'],
  ['GamePanel', 'Ghost', 'owns'],
  ['GameLogic', 'Maze', 'owns'],
  ['Pacman', 'Maze', 'uses'],
  ['Ghost', 'Maze', 'uses'],
  ['Main / Entry', 'GamePanel', 'creates'],
];

function ClassBoxComponent({
  cls,
  lang,
}: {
  cls: ClassBox;
  lang: Language;
}) {
  const methods = cls.methods[lang];
  return (
    <div
      className="rounded-lg border-2 p-3 sm:p-4 flex flex-col min-w-0"
      style={{
        borderColor: cls.color,
        background: 'rgba(0,0,0,0.8)',
        boxShadow: `0 0 12px ${cls.color}33`,
      }}
    >
      <h3
        className="font-heading text-xs sm:text-sm mb-2 pb-2 border-b truncate"
        style={{ color: cls.color, borderColor: `${cls.color}66` }}
      >
        {cls.name}
      </h3>
      <ul className="space-y-1 flex-1">
        {methods.map((m, i) => (
          <li key={i} className="text-gray-300 font-mono text-[10px] sm:text-xs break-all leading-relaxed">
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Arrow({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-1 text-[10px] text-gray-500 whitespace-nowrap">
      <span
        className="inline-block w-3 h-0 border-t-2 border-dashed"
        style={{ borderColor: color }}
      />
      <span className="hidden sm:inline">{label}</span>
      <span style={{ color }}>&#9654;</span>
    </div>
  );
}

export default function ArchitectureDiagram() {
  const [lang, setLang] = useState<Language>('java');

  return (
    <div className="w-full">
      {/* Language selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(Object.keys(languageLabels) as Language[]).map((l) => {
          const active = lang === l;
          const info = languageLabels[l];
          return (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="font-heading text-xs px-4 py-2 rounded-md border-2 transition-all duration-200"
              style={{
                borderColor: active ? info.color : '#333',
                color: active ? info.color : '#888',
                backgroundColor: active ? `${info.color}15` : 'transparent',
              }}
            >
              {info.label}
            </button>
          );
        })}
      </div>

      {/* Diagram grid */}
      <div className="relative max-w-5xl mx-auto space-y-6">
        {/* Row 0: Maze at center */}
        <div className="grid grid-cols-3 gap-4">
          <div />
          <ClassBoxComponent cls={classes[0]} lang={lang} />
          <div />
        </div>

        {/* Connection labels row 0 -> row 1 */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="flex justify-end pr-2">
            <Arrow label="uses" color="#FFFF00" />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-gray-600 text-[10px]">owns</span>
            <div className="w-0 h-4 border-l-2 border-dashed border-cyan-700" />
          </div>
          <div className="flex justify-start pl-2">
            <Arrow label="uses" color="#FF0000" />
          </div>
        </div>

        {/* Row 1: Pacman and Ghost */}
        <div className="grid grid-cols-3 gap-4">
          <ClassBoxComponent cls={classes[1]} lang={lang} />
          <div />
          <ClassBoxComponent cls={classes[2]} lang={lang} />
        </div>

        {/* Connection labels row 1 -> row 2 */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="flex justify-end pr-2">
            <Arrow label="owns" color="#FFB8FF" />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-0 h-4 border-l-2 border-dashed border-cyan-700" />
          </div>
          <div className="flex justify-start pl-2">
            <Arrow label="owns" color="#FFB8FF" />
          </div>
        </div>

        {/* Row 2: GameLogic at center */}
        <div className="grid grid-cols-3 gap-4">
          <div />
          <ClassBoxComponent cls={classes[3]} lang={lang} />
          <div />
        </div>

        {/* Connection labels row 2 -> row 3 */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="flex justify-end pr-2">
            <Arrow label="owns" color="#FFB8FF" />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-0 h-4 border-l-2 border-dashed border-cyan-700" />
          </div>
          <div className="flex justify-start pl-2">
            <Arrow label="creates" color="#FF00FF" />
          </div>
        </div>

        {/* Row 3: GamePanel and Main */}
        <div className="grid grid-cols-3 gap-4">
          <ClassBoxComponent cls={classes[4]} lang={lang} />
          <div />
          <ClassBoxComponent cls={classes[5]} lang={lang} />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 border-2 border-gray-800 rounded-lg p-4 max-w-xl mx-auto">
        <h4 className="font-heading text-gray-500 text-[10px] mb-3 tracking-wider">RELATIONSHIPS</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
          {relationships.map(([from, to, label], i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gray-300">{from}</span>
              <span className="text-gray-600">--{label}--&gt;</span>
              <span className="text-gray-300">{to}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
