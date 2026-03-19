#!/usr/bin/env python3
"""
Educational Multi-Language Pacman -- Terminal Launcher (curses TUI)

Run:  python3 launcher.py

Features (FR-1 through FR-7):
  1. ASCII-art Pacman title screen
  2. Arrow-key navigable language menu (5 languages)
  3. Green/red prerequisite status per language
  4. Educational blurb when a language is highlighted
  5. Enter launches the selected language's run.sh
  6. "Educational Comparisons" submenu for cross-language docs
  7. Prerequisite auto-detection
"""

import curses
import os
import shutil
import subprocess
import sys
import textwrap

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TITLE_ART = r"""
  ____   _    ____ __  __    _    _   _
 |  _ \ / \  / ___|  \/  |  / \  | \ | |
 | |_) / _ \| |   | |\/| | / _ \ |  \| |
 |  __/ ___ \ |___| |  | |/ ___ \| |\  |
 |_| /_/   \_\____|_|  |_/_/   \_\_| \_|

   Educational Multi-Language Pacman
""".rstrip("\n")

LANGUAGES = [
    {
        "name": "Java",
        "dir": "java",
        "blurb": "OOP class hierarchy, Swing event dispatch, Timer-based game loop",
        "prereqs": [
            ("java", "java -version"),
            ("mvn", "mvn --version"),
        ],
    },
    {
        "name": "Python",
        "dir": "python",
        "blurb": "Dynamic typing, simple pygame loop, beginner-friendly",
        "prereqs": [
            ("python3", "python3 --version"),
            ("pygame", 'python3 -c "import pygame"'),
        ],
    },
    {
        "name": "JavaScript",
        "dir": "javascript",
        "blurb": "Event-driven, requestAnimationFrame, browser runtime",
        "prereqs": [
            ("xdg-open/open", None),  # special: check for either
        ],
    },
    {
        "name": "TypeScript",
        "dir": "typescript",
        "blurb": "Static types on top of JS, compile-time safety, same Canvas API",
        "prereqs": [
            ("npx", "npx --version"),
        ],
    },
    {
        "name": "C++",
        "dir": "cpp",
        "blurb": "Manual memory, header/source separation, SDL2 low-level control",
        "prereqs": [
            ("g++", "g++ --version"),
            ("cmake", "cmake --version"),
            ("sdl2", "pkg-config --exists sdl2"),
        ],
    },
]

DOCS = [
    ("01 - Game Loop Patterns", "docs/01_game_loop.md"),
    ("02 - Rendering Approaches", "docs/02_rendering.md"),
    ("03 - Input Handling", "docs/03_input_handling.md"),
    ("04 - Collision Detection", "docs/04_collision_detection.md"),
    ("05 - Ghost AI", "docs/05_ghost_ai.md"),
    ("06 - State Management", "docs/06_state_management.md"),
]

# ---------------------------------------------------------------------------
# Prerequisite checking
# ---------------------------------------------------------------------------


def _run_silent(cmd: str) -> bool:
    """Return True if *cmd* exits 0, False otherwise."""
    try:
        subprocess.run(
            cmd,
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=10,
        )
        return True
    except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
        return False


def check_prereq(name: str, cmd: str | None) -> bool:
    """Check a single prerequisite.

    *cmd* is a shell command whose exit-code signals availability.
    The special value ``None`` (used for JavaScript's browser opener)
    means we check for ``xdg-open`` or ``open`` on PATH.
    """
    if cmd is None:
        # JavaScript: need either xdg-open (Linux) or open (macOS)
        return shutil.which("xdg-open") is not None or shutil.which("open") is not None
    return _run_silent(cmd)


def check_all_prereqs(lang: dict) -> list[tuple[str, bool]]:
    """Return [(tool_name, is_available), ...] for a language entry."""
    return [(name, check_prereq(name, cmd)) for name, cmd in lang["prereqs"]]

# ---------------------------------------------------------------------------
# Drawing helpers
# ---------------------------------------------------------------------------

MIN_HEIGHT = 24
MIN_WIDTH = 60


def _clamp(val: int, lo: int, hi: int) -> int:
    return max(lo, min(val, hi))


def safe_addstr(win, y: int, x: int, text: str, attr=0):
    """Write *text* to *win* at (y, x), silently clipping to window bounds."""
    max_y, max_x = win.getmaxyx()
    if y < 0 or y >= max_y or x >= max_x:
        return
    available = max_x - x
    if available <= 0:
        return
    clipped = text[:available]
    try:
        win.addstr(y, x, clipped, attr)
    except curses.error:
        # Writing the very last cell of the window raises an error in some
        # curses implementations even though it succeeds.  Ignore it.
        pass


def draw_title(stdscr, start_row: int, max_width: int):
    """Draw the ASCII title art centred horizontally."""
    lines = TITLE_ART.split("\n")
    for i, line in enumerate(lines):
        x = max(0, (max_width - len(line)) // 2)
        safe_addstr(stdscr, start_row + i, x, line, curses.A_BOLD)
    return start_row + len(lines)

# ---------------------------------------------------------------------------
# Screens
# ---------------------------------------------------------------------------


def main_menu(stdscr):
    """Main language-selection menu (FR-1 through FR-5, FR-7)."""
    curses.curs_set(0)
    curses.start_color()
    curses.use_default_colors()
    curses.init_pair(1, curses.COLOR_GREEN, -1)   # ready
    curses.init_pair(2, curses.COLOR_RED, -1)      # missing
    curses.init_pair(3, curses.COLOR_YELLOW, -1)   # highlight bar
    curses.init_pair(4, curses.COLOR_CYAN, -1)     # blurb / info

    GREEN = curses.color_pair(1)
    RED = curses.color_pair(2)
    HIGHLIGHT = curses.color_pair(3) | curses.A_BOLD
    INFO = curses.color_pair(4)

    # Pre-compute prerequisite status for all languages
    prereq_cache: list[list[tuple[str, bool]]] = []
    for lang in LANGUAGES:
        prereq_cache.append(check_all_prereqs(lang))

    selected = 0
    # Extra entry: "Educational Comparisons" submenu
    total_items = len(LANGUAGES) + 1  # languages + comparisons entry

    while True:
        stdscr.erase()
        height, width = stdscr.getmaxyx()

        if height < MIN_HEIGHT or width < MIN_WIDTH:
            msg = f"Terminal too small ({width}x{height}). Need {MIN_WIDTH}x{MIN_HEIGHT}."
            safe_addstr(stdscr, 0, 0, msg, RED)
            stdscr.refresh()
            stdscr.nodelay(False)
            key = stdscr.getch()
            if key == curses.KEY_RESIZE:
                continue
            if key in (ord("q"), ord("Q"), 27):  # q / Esc
                return
            continue

        # -- Title --
        row = draw_title(stdscr, 0, width)
        row += 1  # blank line

        # -- Menu --
        safe_addstr(stdscr, row, 2, "Select a language (Up/Down, Enter to launch, 'q' to quit):", curses.A_DIM)
        row += 2

        menu_start_row = row

        for idx, lang in enumerate(LANGUAGES):
            prefix = " >> " if idx == selected else "    "
            attr = HIGHLIGHT if idx == selected else curses.A_NORMAL

            # Build status string
            all_ok = all(ok for _, ok in prereq_cache[idx])
            status_char = "[OK]" if all_ok else "[!!]"
            status_attr = GREEN | curses.A_BOLD if all_ok else RED | curses.A_BOLD

            label = f"{prefix}{lang['name']}"
            safe_addstr(stdscr, row, 2, label, attr)
            safe_addstr(stdscr, row, 2 + len(label) + 1, status_char, status_attr)
            row += 1

        # Comparisons entry
        row += 1
        comp_idx = len(LANGUAGES)
        prefix = " >> " if selected == comp_idx else "    "
        attr = HIGHLIGHT if selected == comp_idx else curses.A_NORMAL
        safe_addstr(stdscr, row, 2, f"{prefix}Educational Comparisons ...", attr)
        row += 2

        # -- Detail pane --
        separator = "-" * min(width - 4, 70)
        safe_addstr(stdscr, row, 2, separator, curses.A_DIM)
        row += 1

        if selected < len(LANGUAGES):
            lang = LANGUAGES[selected]
            # Blurb
            safe_addstr(stdscr, row, 2, f"{lang['name']}:", curses.A_BOLD)
            row += 1
            # Word-wrap the blurb
            wrapped = textwrap.wrap(lang["blurb"], width=min(width - 6, 72))
            for line in wrapped:
                safe_addstr(stdscr, row, 4, line, INFO)
                row += 1
            row += 1
            # Prereq details
            safe_addstr(stdscr, row, 2, "Prerequisites:", curses.A_UNDERLINE)
            row += 1
            for tool_name, available in prereq_cache[selected]:
                mark = "  OK " if available else " MISS"
                c = GREEN if available else RED
                safe_addstr(stdscr, row, 4, mark, c | curses.A_BOLD)
                safe_addstr(stdscr, row, 10, tool_name, curses.A_NORMAL)
                row += 1
        else:
            safe_addstr(stdscr, row, 2, "Browse 6 cross-language comparison documents.", INFO)
            row += 1

        # Footer
        footer_row = max(row + 2, height - 2)
        footer_row = _clamp(footer_row, 0, height - 1)
        safe_addstr(stdscr, footer_row, 2, "q/Esc: Quit  |  Enter: Launch/Open  |  r: Re-check prerequisites", curses.A_DIM)

        stdscr.refresh()

        # -- Input --
        key = stdscr.getch()
        if key == curses.KEY_RESIZE:
            continue
        if key in (ord("q"), ord("Q"), 27):
            return
        if key == curses.KEY_UP:
            selected = (selected - 1) % total_items
        elif key == curses.KEY_DOWN:
            selected = (selected + 1) % total_items
        elif key in (curses.KEY_ENTER, 10, 13):
            if selected < len(LANGUAGES):
                launch_language(stdscr, LANGUAGES[selected])
            else:
                comparisons_menu(stdscr)
        elif key in (ord("r"), ord("R")):
            # Refresh prerequisite checks
            prereq_cache = [check_all_prereqs(lang) for lang in LANGUAGES]


def comparisons_menu(stdscr):
    """Submenu listing the 6 cross-language comparison docs (FR-6)."""
    curses.curs_set(0)
    GREEN = curses.color_pair(1)
    RED = curses.color_pair(2)
    HIGHLIGHT = curses.color_pair(3) | curses.A_BOLD
    INFO = curses.color_pair(4)

    selected = 0

    while True:
        stdscr.erase()
        height, width = stdscr.getmaxyx()

        row = 1
        safe_addstr(stdscr, row, 2, "Educational Comparisons", curses.A_BOLD)
        row += 2
        safe_addstr(stdscr, row, 2, "Select a document (Enter to view, Esc/q to go back):", curses.A_DIM)
        row += 2

        for idx, (title, relpath) in enumerate(DOCS):
            prefix = " >> " if idx == selected else "    "
            attr = HIGHLIGHT if idx == selected else curses.A_NORMAL

            full_path = os.path.join(BASE_DIR, relpath)
            exists = os.path.isfile(full_path)
            status = "[OK]" if exists else "[--]"
            status_attr = GREEN | curses.A_BOLD if exists else RED | curses.A_BOLD

            label = f"{prefix}{title}"
            safe_addstr(stdscr, row, 2, label, attr)
            safe_addstr(stdscr, row, 2 + len(label) + 1, status, status_attr)
            row += 1

        row += 1
        safe_addstr(stdscr, row, 2, "Status: [OK] = file exists  [--] = not yet created", curses.A_DIM)

        footer_row = _clamp(height - 2, 0, height - 1)
        safe_addstr(stdscr, footer_row, 2, "q/Esc: Back  |  Enter: Open document", curses.A_DIM)

        stdscr.refresh()

        key = stdscr.getch()
        if key == curses.KEY_RESIZE:
            continue
        if key in (ord("q"), ord("Q"), 27):
            return
        if key == curses.KEY_UP:
            selected = (selected - 1) % len(DOCS)
        elif key == curses.KEY_DOWN:
            selected = (selected + 1) % len(DOCS)
        elif key in (curses.KEY_ENTER, 10, 13):
            view_document(stdscr, DOCS[selected])


def view_document(stdscr, doc_entry: tuple[str, str]):
    """Open a comparison document with *less* (falls back to *cat*)."""
    title, relpath = doc_entry
    full_path = os.path.join(BASE_DIR, relpath)

    if not os.path.isfile(full_path):
        _show_message(stdscr, f"File not found:\n  {full_path}\n\nPress any key to go back.")
        return

    # Temporarily leave curses so less/cat can use the terminal
    curses.endwin()

    pager = shutil.which("less") or shutil.which("cat")
    if pager:
        try:
            subprocess.run([pager, full_path])
        except Exception as exc:
            # Will be shown after curses restores
            print(f"Error opening file: {exc}")
    else:
        # Absolute fallback: just print
        try:
            with open(full_path, "r") as fh:
                print(fh.read())
            input("\n[Press Enter to return]")
        except Exception as exc:
            print(f"Error reading file: {exc}")
            input("\n[Press Enter to return]")

    # Restore curses
    stdscr.refresh()


def launch_language(stdscr, lang: dict):
    """Launch a language implementation's run.sh (FR-5)."""
    lang_dir = os.path.join(BASE_DIR, lang["dir"])
    run_script = os.path.join(lang_dir, "run.sh")

    if not os.path.isfile(run_script):
        _show_message(stdscr, f"run.sh not found in {lang_dir}\n\nPress any key to go back.")
        return

    # Temporarily leave curses
    curses.endwin()

    try:
        subprocess.run(
            ["bash", "run.sh"],
            cwd=lang_dir,
        )
    except Exception as exc:
        print(f"\nError launching {lang['name']}: {exc}")
    finally:
        print(f"\n[{lang['name']} exited. Press Enter to return to the launcher]")
        try:
            input()
        except EOFError:
            pass

    # Restore curses
    stdscr.refresh()


def _show_message(stdscr, message: str):
    """Display a simple message overlay and wait for a keypress."""
    stdscr.erase()
    height, width = stdscr.getmaxyx()
    lines = message.split("\n")
    start_row = max(0, (height - len(lines)) // 2)
    for i, line in enumerate(lines):
        safe_addstr(stdscr, start_row + i, 2, line, curses.A_BOLD)
    stdscr.refresh()
    stdscr.getch()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    os.environ.setdefault("ESCDELAY", "25")  # snappy Esc response
    try:
        curses.wrapper(main_menu)
    except KeyboardInterrupt:
        pass
    finally:
        print("Goodbye!")


if __name__ == "__main__":
    main()
