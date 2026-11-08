// WordGame6_AutoBuild_v77.js - Lens Studio (classic JavaScript)
// v44 2026-11-07: FRESH build (user deleted all textures).
// Same wide layout as v43. BINDINGS - fill these in the
// Inspector after importing the 6 fresh PNGs:
//  Templates: Ortho Camera -> Orthographic Camera;
//   Template Tile Obj -> Text; Template Key Obj -> Key_Q;
//   Template Box Obj -> Tilebox (see TILEBOX note below);
//   Template Msg Obj -> Text.
//  Textures: White Texture -> rounded-tile-texture.png
//   (128x128 SQUARE - this one decides if tiles are wide);
//   Rules Icon -> rules-icon.png; Stats Icon -> stats-icon.png;
//   Delete Icon -> delete-icon.png;
//   Delete Tile -> delete-tile-texture.png (192x143);
//   Enter Pill -> enter-pill-texture-daily.png (320x144).
//  Word List: the 61 words (already in this script).
// TILEBOX (under Orthographic Camera -> Full Frame Region):
//  The Tilebox is a Screen Image and the TEMPLATE for every
//  box in the game. The script hides it on start and COPIES
//  it to make each grid tile box, each key box, the Rules /
//  Stats button boxes, the DEL box and the ENTER pill box.
//  Every copy inherits the Tilebox's Image, then the script
//  re-colours it (white tiles, light-grey keys, indigo
//  buttons) and swaps its texture where needed (wide tile
//  for DEL, pill for ENTER). If the Tilebox is missing or
//  is not a Screen Image, NO boxes appear at all. It must
//  stay under Full Frame Region so it renders on screen.
// (a) DEL key shows a delete/backspace icon (new optional input
//     deleteIconTexture; import delete-icon.png). Falls back to
//     "DEL" text if not filled. (b) ENTER bigger: font 24 -> 32.
// (a) Rules/Stats use the SVG/PNG icons (new optional inputs).
// (b) ENTER is a Text pill - Image boxes render as squares, so
//     a 0.50-wide Image came out as a small square and ENTER
//     overflowed it. (c) Empty tiles no longer show a '.' dot.
// (d) Rounded tiles: set the White Texture input to
//     rounded-tile-texture.png (no code change needed).
// v23 and v28 are kept intact - this is a separate file, built from v28.
// (a) WORDLY title (gradient in the mockup; solid indigo here -
//     Lens Studio Text cannot do a gradient), light glassy pill
//     behind the message (the v28 dark status bar is REMOVED -
//     it rendered as a narrow black box), 5 progress dots.
// (b) Pleasing colours: correct = indigo #6366f1, present =
//     warm amber #fbbf24, absent = soft grey #9ca3af,
//     unplayed keys = warm light grey #d6d3d1. ENTER is an
//     indigo pill. Rules/Stats buttons are indigo (was black).
// (c) NO background image - the camera feed shows through
//     (the user asked to remove the background). Empty tiles
//     are glassy translucent white so the camera shows through.
// (d) 5 GUESSES, not 6: 5 rows, 5 dots, 'Guess X of 5'.
//     The word is still 6 letters; only the tries are 5.
// (a) Keyboard: after every guess each key shows the BEST result
// for that letter across all guesses - blue = right place, yellow
// = in the word, grey = not in the word (best wins: blue > yellow
// > grey, so a key never downgrades). Unplayed keys are Wordle
// light grey (#D3D6DA). Letters: white on blue/grey, black on
// yellow. ENTER/DEL stay white with black letters. Key materials
// are cloned ONCE at build (keyBoxMat[] - properly initialised,
// unlike v24's tileBoxMat bug) and recoloured by drawBoard.
// (b) Status bar: a dark bar behind the top message (created
// BEFORE the message text so it sits behind it), message text
// now white on dark - a proper header/status bar.
// ONE copy-paste file that builds the whole 6-letter Wordle board itself.
// You do NOT need to manually duplicate 36 tiles + 28 keys.
//
// WHAT IT DOES ON START:
//  - Copies your 1 template Text tile 30 times into a 5x6 grid
//  - Copies your 1 template key 28 times into a QWERTY keyboard
//    (A-Z + ENTER + BACK), positions them, and binds their taps
//  - Makes the message Text + the rules line
//  - Adds a Rules button (top-right, "?") and a Stats button
//    (top-right, "S") — tap Rules to see how to play, tap Stats
//    to see past performance (games, wins, win %, streak)
//  - Then runs the game, exactly as you said:
//    Board starts WHITE / empty. 6 letters, 6 chances.
//    BLUE = right letter, right place
//    YELLOW = right letter, wrong place
//    GREY = letter not in the word
//  - Stats are saved with Persistent Storage, so they survive
//    closing and reopening the Lens (Snap clears them only after
//    60 days of not using the Lens).
//
// HOW TO USE IT (3 steps, in Lens Studio on your laptop):
//  1. You already have: Orthographic Camera + 1 Text under it.
//     Keep that 1 Text as your template. Make sure its font size
//     looks right (big enough to read on a phone).
//     Also make 1 key object under the same camera, e.g. named Key_Q,
//     with a Text child / Text component showing "Q", and an
//     Interaction Component on it. That is your key template.
//  2. In the Asset Browser, make a new JavaScript file, paste this
//     whole file into it, and drag it onto any Scene Object
//     (e.g. the Orthographic Camera itself).
//  3. In the Inspector for that script, fill in:
//        orthoCamera      -> your Orthographic Camera
//        templateTileObj  -> your 1 Text tile Scene Object
//        templateKeyObj   -> your 1 Key_Q Scene Object
//        templateMsgObj   -> your 1 Text tile again (it will be
//                            copied for the message + rules lines)
//     Leave wordList as-is. Press Preview / Play.
//
// NOTE: This auto-build uses copySceneObject + ScreenTransform
// anchors.setCenter, which are the documented Lens Studio APIs.
// It has NOT been run inside Lens Studio yet — if you get a red
// error in the Logger, copy the exact error text to me and I will
// fix this file. Do NOT delete your manual tiles yet — keep them
// as a backup until this auto version previews correctly.

// @input SceneObject orthoCamera
// @input SceneObject templateTileObj
// @input SceneObject templateKeyObj
// @input SceneObject templateBoxObj
// @input Asset.Texture whiteTexture
// @input Asset.Texture tileTexture
// @input Asset.Texture keyTexture // v58: white key texture with grey border (key-white-border.png)
// @input Asset.Texture rulesIconTexture
// @input Asset.Texture statsIconTexture
// @input Asset.Texture deleteIconTexture
// @input Asset.Texture deleteTileTexture
// @input Asset.Texture enterPillTexture
// @input Asset.Texture panelTexture // v59: black panel background for Stats (panel-black.png)
// @input Asset.Texture rulesPanelTexture // v62: tall black panel for Rules (panel-black-rules.png)
// @input Asset.Texture countdownTexture // v73: black countdown pill, Stats-panel width, with clock icon (pill-black-stats.png)
// @input SceneObject templateMsgObj
// @input string[] wordList = {"PLANET", "GARDEN", "BRIDGE", "CASTLE", "MARKET", "SILVER", "GOLDEN", "WINTER", "SUMMER", "SPRING", "AUTUMN", "BANANA", "ORANGE", "PURPLE", "JUNGLE", "DESERT", "ISLAND", "BREEZE", "MEADOW", "FOREST", "HARBOR", "LETTER", "NUMBER", "PEOPLE", "FAMILY", "FRIEND", "SCHOOL", "TRAVEL", "DANCER", "SINGER", "PLAYER", "WINNER", "SUNSET", "STARRY", "CLOUDY", "FLOWER", "POCKET", "BUTTON", "WINDOW", "PENCIL", "HAMMER", "LADDER", "ROCKET", "DRAGON", "WIZARD", "KNIGHT", "PIRATE", "SAILOR", "FARMER", "DOCTOR", "LAWYER", "WORKER", "DRIVER", "RUNNER", "JUMPER", "HUNTER", "FISHER", "ARTIST", "WRITER", "READER", "LISTEN"}

var ROWS = 5; // v32: 5 guesses, not 6
var COLS = 6;

var BLUE = new vec4(0.39, 0.40, 0.95, 1.0); // v32: pleasing indigo #6366f1 (was 0.23,0.51,0.86)
var YELLOW = new vec4(0.98, 0.75, 0.14, 1.0); // v32: warm amber #fbbf24 (was 0.98,0.65,0.12)
// v10: GREY was 0.62 — white letters on light grey were faint.
// Darker now so white letters pop, like the reference.
var GREY = new vec4(0.61, 0.64, 0.69, 1.0); // v32: soft grey #9ca3af (was 0.45,0.48,0.52)
var KEY_GREY = new vec4(1, 1, 1, 1.0); // v58: WHITE unplayed keys - the bordered key texture (key-white-border.png) supplies the grey edge (was warm light grey #d6d3d1)
var INDIGO = new vec4(0.39, 0.40, 0.95, 1.0); // v32: same indigo, for title/buttons/dots/ENTER
var GLASS_TILE = new vec4(1.0, 1.0, 1.0, 0.55); // v32: glassy translucent white for empty tiles
var GLASS_PILL = new vec4(1.0, 1.0, 1.0, 0.75); // v32: light glassy pill behind the message
var DARKTEXT = new vec4(0.18, 0.06, 0.40, 1.0); // v32: dark plum for message text on the light pill
var DOT_GREY = new vec4(0.61, 0.64, 0.69, 1.0); // v32: empty progress dots
var WHITE = new vec4(1.0, 1.0, 1.0, 1.0);
var TILE_GREY = new vec4(1, 1, 1, 1.0); // v58: WHITE unplayed tiles - the bordered tile texture (tile-white-border.png) supplies the grey edge, so white stays crisp even in sunlight (was light grey #D1D5DB)
// v11: empty tiles were 0.80-0.85 — almost the same as the light
// wall, so rows 2-6 looked missing. Only the scored row showed,
// because it had a coloured background + letters. Empty tiles now
// 0.70, clearly darker than any light wall, so all 36 show.
// Current row (being typed) is WHITE, like the reference.
var LIGHTGREY = new vec4(0.70, 0.70, 0.70, 1.0);
var BLACKBG = new vec4(0.12, 0.12, 0.12, 1.0);

// Grid positions (-1 to 1, X left to right, Y bottom to top)
// v6 2026-11-06: looked at the 13:21 phone screenshot myself.
// Capture button is NOT at -0.85 — its centre is ~-0.44, top edge
// ~-0.30, X -0.18 to +0.18. So v5 keyboard still overlapped it:
// row 3 (Z..DEL) and ENTER were behind the capture circle and the
// lens carousel. Fix: compress the whole game so it fits ABOVE
// the capture button. Tiles spacing 0.11 (was 0.15), keys spacing
// 0.11 (was 0.16), smaller fonts. Middle keys must end above
// Y -0.30; ENTER/DEL are at X 0.64, outside the capture circle,
// so they can sit a little lower.
// v7 2026-11-06: lower a bit (-0.04) — v6 was a touch too high.
// v23 2026-11-06: WHOLE-KEY TAPS. User: letters do not
// register properly — taps miss and hit Snapchat's own
// UI instead. Cause: the tap area was only the LETTER
// glyph (the Text object's Interaction Component), not
// the whole key square. Tapping the white part of a key
// fell straight through to Snapchat underneath. Fix:
// the tap is now bound to the BOX (the white square)
// instead, so the whole key is tappable. If a box has no
// Interaction Component, one is created in code and its
// camera set to the Orthographic Camera. Same for the
// Rules/Stats buttons (their boxes are the tap targets
// now). The letter Text keeps no binding, so no
// double-fire. Reference video check: in Daily GuessIt
// Snapchat's own UI (capture button, carousel, side
// icons) disappears and only the game + an X show —
// that is Snapchat hiding its camera UI once the lens
// is opened/activated; in Lens Studio Preview the
// camera UI stays visible, which is a preview difference,
// not a lens difference. Once published it behaves
// like the reference.
// v22 2026-11-06: POLISH. v21 preview 18:19 IST: IT WORKS.
// He WON — target WINDOW, guessed in 4: PLKJUI (I yellow),
// NUMBER (N yellow), WINTEH (W,I,N blue), WINDOW all blue.
// Boxes are solid white/blue/yellow/grey squares, keys
// white with black letters, Rules/Stats black, typing +
// scoring + win message all working. Remaining niggles:
// (1) ENTER label sticks out of its box (E left, R right)
// — font 20 -> 16, box 0.42 -> 0.50. DEL font 28 -> 24.
// (2) Win message cut off left/right — it was ~70 chars
// at font 20 in a 1.7 anchor. Shortened + font 20 -> 18,
// anchor 1.7 -> 1.9.
// v21 2026-11-06: NO CLONING BY DEFAULT. v20 still showed
// checkerboard after inputs were confirmed filled
// (image-26: all 5 inputs correct, Logger sent 18:12).
// Root cause: cloning a material DROPS its texture — the
// clone renders checkerboard, and white baseColor cannot
// hide a checkerboard (white x checker = checker). Black
// baseColor CAN hide it (black x anything = black), which
// is why Rules/Stats looked black and correct.
// v21: boxes keep the SHARED template material (white
// texture, white) — no cloning, no colour change on the
// box. Score is shown by the LETTER colour instead
// (blue/yellow/grey letter on a white box — textFill
// works per-copy, proven). OPTIONAL upgrade: if the user
// drags white-tile-texture into the new "White Texture"
// input, boxes ARE cloned with that texture set back on
// the clone, and scored boxes turn blue/yellow/grey with
// white/black letters. Safe default = white boxes +
// coloured letters, which always works.
// ENTER font 26 -> 20 (its label stuck out of its box).
// v20 2026-11-06: KEEP THE WHITE TEXTURE. v19 set
// baseTex = null on every clone, which stripped the GOOD
// white-tile-texture off the boxes and brought back the
// magenta/black checkerboard (no texture = checkerboard).
// v20 removes those two lines. White texture x white
// baseColor = solid white; scoring tints it blue/yellow/grey.
// v19 2026-11-06: REMOVE PLACEHOLDER TEXTURE. v18 preview
// 17:48 IST: BOXES ARE SQUARE AT LAST — 6x6 grid, keys
// square, letters readable, Rules/Stats black. Only
// fault: every box is GREY with a faint "image missing"
// icon, because the TileBox template's Texture is the
// placeholder image, tinted by baseColor. Fix: set
// baseTex = null on the cloned material, so the box
// renders as solid baseColor (white / blue / yellow /
// grey) with no icon. Manual fallback if this fails:
// select TileBox in Lens Studio, Inspector > Image >
// Texture > None.
// v18 2026-11-06: IMAGE BOXES. Text cannot make a square
// box (proven v11-v16). Proper way, per Snap's own docs:
// an IMAGE for the box + TEXT for the letter on top.
// User creates ONE Screen Image named TileBox (white,
// under Full Frame Region) and drags it into the new
// "Template Box Obj" input. Script copies it 36x for
// tiles, 28x for keys, 2x for buttons. An Image IS sized
// by its anchor (0.23 x 0.10 = square), unlike Text.
// Colour per box: materials are SHARED assets, so each
// copy gets a CLONED material first (clone -> clear ->
// add), then baseColor is set on the clone. If cloning
// fails, boxes stay white and the LETTER shows the score
// colour instead (tested at startup, boxColorWorks flag).
// v17 2026-11-06: REVERT. v16 "WWW" rendered ~10x too big
// (Text size in script != Inspector size) and covered the
// whole screen white — that is the 17:25 screenshot.
// v17 = v14 again: simple setBg, "." white ink, no BG
// copies, no "WWW", no "█". Playable again, boxes thin
// as in v14, NOT square yet. Proper squares need IMAGE
// boxes (see note to user) — Text cannot do it reliably.
// v16 2026-11-06: "WWW" BLOCK. v15 failed on TWO things:
// (1) "█" U+2588 is NOT in Lens Studio's font — it renders
// as a thin vertical line, so tiles stayed thin white lines
// and keys stayed black letters on black boxes.
// (2) letter copies kept their template background ENABLED,
// so a black box (Key_Q template) covered the white block.
// v16: BG copy text = "WWW\nWWW" (3 W's, 2 lines, font 32)
// — W is the widest letter in the font, so its background
// box is ~75px wide x ~77px tall = a proper SQUARE white
// box, and the W's are white-on-white, invisible.
// Letter copy gets noBg() so nothing covers the block.
// Scored tiles: BG textFill AND background both set to the
// score colour, so the score shows even if one of them fails.
// v15 2026-11-06: BLOCK-GLYPH TILES. v14 proved it for good:
// Text background width = glyph width, height = line height,
// never the anchor size — so a Text background can NEVER be
// a square tile, and its colour kept coming back black on
// keys (Snap's own docs: "for anything bigger than a small
// square, don't use a Text background at all").
// v15 drops backgroundSettings entirely. Each tile/key is
// TWO Text copies: a solid block "█" whose textFill IS the
// box colour (textFill DOES work per-copy, proven), and a
// letter copy on top. "█" is a full em square, so font 72
// = ~72px square box. Tiles: white block, black letter;
// scored: blue/yellow/grey block, white/black letter.
// Keys: white block, black letter — characters visible.
// Buttons: black block, white letter. No setBg calls left.
// v14 2026-11-06: BACK TO SIMPLE. v12 margins made the screen
// black, v13 keys went black. Root causes: (1) background
// size = glyph + margins, margins must stay 0; (2) Stats
// button with huge margins covered the whole screen, so
// every tap opened Stats and keys never got tapped.
// v14 removes ALL margin/radius/component-wise code.
// Background = simple assignment only, like the version
// that worked at 13:13. Empty tiles = "." in WHITE ink
// (white on white, alpha 1, so background draws).
// Tiles/keys = WHITE boxes, black letters, square
// 0.23x0.10 / 0.18x0.09, v11 measured positions.
// v11 2026-11-06: EXACT layout, measured from the reference
// image with visual grounding (0-1000 coords, converted to
// Lens -1..1). Reference, 5 cols: tiles centres X -0.51..0.51,
// Y 0.74..0.17, spacing X 0.255, Y 0.114; Q (-0.87, 0.05),
// P (0.87, 0.05); backspace (0.78, -0.20); ENTER (0.68, -0.32);
// capture button (0.00, -0.44); Rules (0.89, 0.30),
// Stats (0.89, 0.18). Ours is 6 cols, so same tile size/spacing,
// 6 across: X -0.64..0.64. My old tiles were 0.20 wide x 0.11
// high = 71px x 88px, tall-narrow — that is why they looked
// random. Correct square tile: 0.23 wide x 0.10 high = ~92px x 80px.
// Correct square key: 0.18 wide x 0.09 high = ~64px x 72px.
var TILE_X = [-0.618, -0.371, -0.124, 0.124, 0.371, 0.618]; // v53: bigger tiles, green gap stays 2px (spacing 0.247, was 0.236); orange gap stays 4px
var TILE_Y = [0.640, 0.485, 0.330, 0.175, 0.020]; // v54: whole game lifted up 0.10 (was 0.540...) - ENTER was hidden behind the carousel // v32: 5 rows, shifted down for title + pill

// QWERTY keyboard: [letter, x, y] — measured from reference.
// Row1 Y 0.05, row2 Y -0.07, row3 Y -0.20, ENTER Y -0.32.
// Keyboard bottom (ENTER bottom -0.365) sits just above the
// capture button top (-0.30), ENTER is on the right so it
// never overlaps the centre capture circle.
var KEY_LAYOUT = [ // v54: whole game lifted up 0.10 (X spacing 0.196, Y spacing 0.132)
    ["Q", -0.882, -0.136], ["W", -0.686, -0.136], ["E", -0.490, -0.136], ["R", -0.294, -0.136], ["T", -0.098, -0.136],
    ["Y", 0.098, -0.136], ["U", 0.294, -0.136], ["I", 0.490, -0.136], ["O", 0.686, -0.136], ["P", 0.882, -0.136],
    ["A", -0.784, -0.268], ["S", -0.588, -0.268], ["D", -0.392, -0.268], ["F", -0.196, -0.268], ["G", 0.00, -0.268],
    ["H", 0.196, -0.268], ["J", 0.392, -0.268], ["K", 0.588, -0.268], ["L", 0.784, -0.268],
    ["Z", -0.686, -0.400], ["X", -0.490, -0.400], ["C", -0.294, -0.400], ["V", -0.098, -0.400], ["B", 0.098, -0.400],
    ["N", 0.294, -0.400], ["M", 0.490, -0.400],
    ["BACK", 0.777, -0.400], // v42: Daily match - DEL at Daily's X
    ["ENTER", 0.667, -0.520] // v54: lifted up with the game (was -0.620) - was hidden behind the carousel
];

var tiles = [];   // Component.Text[36] — LETTER layer
var tileBox = []; // Component.Image[36] — white square box behind each tile
var keys = [];    // SceneObject[28]
var keyBoxes = []; // SceneObject[28] — the white box behind each key (the tap target)
var keyBoxMat = []; // v28: cloned Material[28] - one clone per key box, made once at build
var keyTextComp = []; // v28: Text component[28] for each key letter, so drawBoard can recolour it
// v53: progress dots REMOVED (mustafa: 'remove that guess1 guess2 dots') - no dots array
var boxColorWorks = false; // set by testBoxColor() at startup
var messageText = null; // Component.Text
var gameOverTextObj = null; // v64: big 'You won!' / 'Game over!' on the board
var gameOverText = null;
var gameWon = false; // v66: true if the daily word was guessed
var countdownBgObj = null; // v67: black countdown pill bg (below Stats)
var countdownTextObj = null; // v67: 'Next word in HH:MM:SS' text
var countdownText = null;
var delIconObj = null; // v68: DEL icon (stored so the keyboard hide can reach it)
var introOpen = false; // v74: intro popup is showing
var introPanelBg = null; // v74: intro card bg
var introTitleObj = null; // v74: 'WORDLY' on the intro card
var introTitleText = null;
var introBodyObj = null; // v74: 'Guess the 6-letter word...' on the intro card
var introBodyText = null;
var introPlayBg = null; // v74: PLAY pill button bg
var introPlayTextObj = null; // v74: 'PLAY' text
var introPlayText = null;
var rulesTextComp = null;
var rulesPanelObj = null;
var statsPanelObj = null;
var rulesPanelText = null;
var statsPanelText = null;
var panelOpen = ""; // "", "rules", "stats"
// v59: black modal panels (Daily style)
var rulesPanelBg = null;
var statsPanelBg = null;
var rulesTitleObj = null;
var statsTitleObj = null;
var rulesXObj = null;
var statsXObj = null;
var ruleSwatches = []; // 3 swatch boxes + 3 swatch letters
var statRowObjs = []; // v60: 5 stat numbers + 5 stat labels (row)
var statNumTexts = []; // v60: the 5 number Text components, to update

// Stats — saved in Persistent Storage between Lens sessions
var store = null;
var gamesPlayed = 0;
var gamesWon = 0;
var currentStreak = 0;
var bestStreak = 0;

var target = "";
var guesses = [];
var current = "";
var gameOver = false;
// v56: TILE FLIP ANIMATION (Daily GuessIt style). When a guess
// is submitted, its row flips left-to-right, one tile at a
// time, revealing each colour. Driven by the UpdateEvent below.
var flipRow = -1;       // row currently flipping (-1 = no flip)
var flipElapsed = 0;    // seconds since this row's flip started
var flipScores = null;  // scoreGuess() result for the flipping row
var flipGuess = "";     // the word being flipped
var flipColored = [false, false, false, false, false, false];
var FLIP_STAGGER = 0.12; // v57: flip a bit slower (was 0.09) - seconds between tile starts
var FLIP_DUR = 0.22;     // v57: flip a bit slower (was 0.16) - seconds per tile flip

function getTextComp(obj) {
    var c = obj.getComponent("Component.Text");
    if (!c) { c = obj.getComponent("Text"); }
    return c;
}
function getImageComp(obj) {
    var c = obj.getComponent("Component.Image");
    if (!c) { c = obj.getComponent("Image"); }
    return c;
}
// v21: colour one Image box — ONLY if the white texture
// input is filled. Otherwise do nothing: the box keeps
// the shared template material (white texture, white)
// and the LETTER shows the score colour instead.
function setBoxColor(img, color) {
    if (!img) { return; }
    if (!script.whiteTexture) { return; }
    try {
        var mat = null;
        try { mat = img.mainMaterial; } catch (e1) { }
        if (!mat && img.getMaterial) { try { mat = img.getMaterial(0); } catch (e1) { } }
        if (!mat) { return; }
        var clone = null;
        try { clone = mat.clone(); } catch (e1) { }
        if (clone) {
            try { if (img.clearMaterials) { img.clearMaterials(); } } catch (e1) { }
            try { if (img.addMaterial) { img.addMaterial(clone); } } catch (e1) { }
            try { clone.mainPass.baseTex = script.whiteTexture; } catch (e1) { }
            try { clone.mainPass.baseColor = color; } catch (e1) { }
        }
    } catch (e) { }
}
// v51: like setBoxColor, but the GRID TILES use the TALL tile
// texture (128x192, 1.5:1) so they render 1.5x taller than
// wide. Falls back to whiteTexture if tileTexture is empty.
// Keys, Rules/Stats buttons keep setBoxColor (square).
function setTileBoxColor(img, color) {
    if (!img) { return; }
    var tex = script.tileTexture || script.whiteTexture;
    if (!tex) { return; }
    try {
        var mat = null;
        try { mat = img.mainMaterial; } catch (e1) { }
        if (!mat && img.getMaterial) { try { mat = img.getMaterial(0); } catch (e1) { } }
        if (!mat) { return; }
        var clone = null;
        try { clone = mat.clone(); } catch (e1) { }
        if (clone) {
            try { if (img.clearMaterials) { img.clearMaterials(); } } catch (e1) { }
            try { if (img.addMaterial) { img.addMaterial(clone); } } catch (e1) { }
            try { clone.mainPass.baseTex = tex; } catch (e1) { }
            try { clone.mainPass.baseColor = color; } catch (e1) { }
        }
    } catch (e) { }
}
// v33: set an Image to an icon texture (white icon on
// transparent). Clones the material like setBoxColor, but
// sets baseTex to the given icon texture (not whiteTexture)
// and baseColor to WHITE, so the white icon shows on the
// indigo button behind it. Returns true if it worked.
function setIcon(img, texture) {
    if (!img || !texture) { return false; }
    try {
        var mat = null;
        try { mat = img.mainMaterial; } catch (e1) { }
        if (!mat && img.getMaterial) { try { mat = img.getMaterial(0); } catch (e1) { } }
        if (!mat || !mat.clone) { return false; }
        var clone = mat.clone();
        if (!clone) { return false; }
        try { if (img.clearMaterials) { img.clearMaterials(); } } catch (e1) { }
        try { if (img.addMaterial) { img.addMaterial(clone); } } catch (e1) { }
        try { clone.mainPass.baseTex = texture; } catch (e1) { }
        try { clone.mainPass.baseColor = WHITE; } catch (e1) { }
        return true;
    } catch (e) { return false; }
}
// v28: clone a box material ONCE and return it (null if it
// cannot be cloned). Used for KEY boxes only (tiles still
// re-clone per redraw, as in v23).
function makeBoxMat(img) {
    if (!img || !script.whiteTexture) { return null; }
    try {
        var mat = null;
        try { mat = img.mainMaterial; } catch (e1) { }
        if (!mat && img.getMaterial) { try { mat = img.getMaterial(0); } catch (e1) { } }
        if (!mat || !mat.clone) { return null; }
        var clone = mat.clone();
        if (!clone) { return null; }
        try { if (img.clearMaterials) { img.clearMaterials(); } } catch (e1) { }
        try { if (img.addMaterial) { img.addMaterial(clone); } } catch (e1) { }
        // v58: keys use the bordered key texture when set
        // (key-white-border.png), else fall back to whiteTexture.
        try { clone.mainPass.baseTex = script.keyTexture || script.whiteTexture; } catch (e1) { }
        return clone;
    } catch (e) { return null; }
}
// v28: colour a key box by its stored clone - no re-cloning.
// Falls back to setBoxColor if no stored clone exists.
function setKeyBoxColor(idx, color) {
    var m = keyBoxMat[idx];
    if (m && m.mainPass) {
        try { m.mainPass.baseColor = color; return; } catch (e) { }
    }
    var img = getImageComp(keyBoxes[idx]);
    if (img) { setBoxColor(img, color); }
}
// v21: box colour only works if the white texture input
// is filled AND cloning keeps it. Otherwise false, and
// drawBoard uses coloured letters on white boxes.
function testBoxColor() {
    if (!script.templateBoxObj || !script.whiteTexture) { return false; }
    try {
        var img = getImageComp(script.templateBoxObj);
        if (!img) { return false; }
        var mat = null;
        try { mat = img.mainMaterial; } catch (e) { }
        if (!mat && img.getMaterial) { try { mat = img.getMaterial(0); } catch (e) { } }
        if (!mat || !mat.clone) { return false; }
        var clone = mat.clone();
        if (!clone || !clone.mainPass) { return false; }
        clone.mainPass.baseTex = script.whiteTexture;
        clone.mainPass.baseColor = new vec4(1, 0, 0, 1);
        return clone.mainPass.baseColor.x === 1 && clone.mainPass.baseTex != null;
    } catch (e) { return false; }
}
function getScreenTransform(obj) {
    var s = obj.getComponent("Component.ScreenTransform");
    if (!s) { s = obj.getComponent("ScreenTransform"); }
    return s;
}
function setPos(obj, x, y) {
    var st = getScreenTransform(obj);
    if (st && st.anchors && st.anchors.setCenter) {
        st.anchors.setCenter(new vec2(x, y));
    } else if (st) {
        // Fallback: try the position property
        try { st.position = new vec3(x, y, 0); } catch (e) { print("AutoBuild: could not set position for " + obj.name); }
    }
}
// v2 fix 2026-11-06: template font 64 made the rules/message lines
// huge and cut off, and empty white tiles were invisible (no box).
// Set a size per copy, and give each copy a fixed anchor size so
// long lines fit. Background colour is tried best-effort — if the
// runtime Text API has no background field, it is skipped and the
// letter colour still shows the score.
function setTextSize(comp, size) {
    if (!comp) { return; }
    try { comp.size = size; } catch (e) { }
}
function setAnchorSize(obj, w, h) {
    var st = getScreenTransform(obj);
    try { if (st && st.anchors && st.anchors.setSize) { st.anchors.setSize(new vec2(w, h)); } } catch (e) { }
}
// v56: scale one grid tile (box Image + letter Text, both
// siblings at the same position) horizontally for the flip.
// The anchor is centred, so scaleX 1 -> 0 -> 1 narrows the
// tile to a line and widens it back - a card flip. Best
// effort: if the transform cannot scale, the colour swap
// below still happens and the game plays on.
function setTileScale(idx, sx) {
    if (sx < 0.02) { sx = 0.02; }
    try {
        var box = tileBox[idx];
        if (box && box.getSceneObject) {
            var so = box.getSceneObject();
            if (so && so.getTransform) { so.getTransform().setLocalScale(new vec3(sx, 1, 1)); }
        }
    } catch (e) { }
    try {
        var t = tiles[idx];
        if (t && t.getSceneObject) {
            var so2 = t.getSceneObject();
            if (so2 && so2.getTransform) { so2.getTransform().setLocalScale(new vec3(sx, 1, 1)); }
        }
    } catch (e) { }
}
function setBg(comp, color) {
    if (!comp) { return; }
    try {
        var bs = comp.backgroundSettings;
        if (bs) { bs.enabled = true; if (bs.fill) { bs.fill.color = color; } }
        else if (comp.background) { comp.background.enabled = true; if (comp.background.color) { comp.background.color = color; } }
    } catch (e) { }
}
function setBold(comp, color) {
    // v36: make text look BOLD by adding an outline in the SAME
    // colour as the text. The outline thickens each stroke, so the
    // letters read as bold. Best-effort like setBg - if this build
    // of Lens Studio does not expose the outline this way, the text
    // simply stays regular (the bigger size still makes it pop).
    if (!comp) { return; }
    try {
        var ol = comp.textOutline;
        if (ol) {
            try { ol.enabled = true; } catch (e1) { }
            try { if (ol.fill) { ol.fill.color = color; } } catch (e2) { }
            try { if (ol.color) { ol.color = color; } } catch (e3) { }
            try { ol.size = 2; } catch (e4) { }
            try { ol.thickness = 2; } catch (e5) { }
        }
    } catch (e) { }
}
// v14: SIMPLE background only. v12/v13 margins (28, then 0.05)
// made boxes huge / black, and component-wise fill turned
// keys black. Back to the simple setBg that worked at 13:13:
// backgroundSettings.enabled = true, fill.color = color
// (assignment only), no margins, no radius, no component-wise.
// Empty tiles use "." in WHITE ink (white on white, alpha 1)
// so the background draws — the whitespace trap fix —
// NOT alpha 0, which made the whole tile vanish.
var HIDDEN = WHITE; // "." in white ink = invisible on a white tile, but alpha 1 so it draws
// v9 fix 2026-11-06: ONE simple block for everything — letters
// looked big/small and random because tiles were 36, keys 36,
// ENTER 24, buttons 44, with different block heights (0.13 vs
// 0.10 vs 0.09). Now: same height 0.11 for every tile and key,
// same font 32 for every single letter, centre-aligned, Size To
// Fit off. Only ENTER/DEL get a WIDER block (same height) so
// their longer words fit at a near-normal size instead of
// shrinking to fit a narrow box.
var BLOCK_H = 0.150; // v53: tiles a little bigger (109px, was 104px) - tall tiles
var TILE_W = 0.25; // v42: Daily match (was 0.23)
var KEY_H = 0.125; // v53: keys a little taller (90px, was 83px) // key height (0.19 wide = ~68px, 0.125 high = ~90px)
var KEY_W = 0.19; // v43: WIDER keys (was 0.178)
var BLOCK_FONT = 30; // v45: SMALLER letters + bold (DECREASED per user, was 36)
function styleBlock(comp, size) {
    if (!comp) { return; }
    setTextSize(comp, size);
    try { comp.sizeToFit = false; } catch (e) { }
    try { comp.horizontalAlignment = 1; } catch (e) { } // centre
    try { comp.verticalAlignment = 1; } catch (e) { }   // centre
    // NOTE v12: do NOT touch comp.margins here — that was
    // shrinking the background box down to the glyph size.
    // Background size is set via setBlockBg margins instead.
}
// v8 fix: message/rules lines must have NO background and BLACK
// text — the template has Background enabled + white text, so
// they showed as solid white bars with invisible white text.
function noBg(comp) {
    if (!comp) { return; }
    try { if (comp.backgroundSettings) { comp.backgroundSettings.enabled = false; } } catch (e) { }
    try { if (comp.background) { comp.background.enabled = false; } } catch (e) { }
}
var BLACK = new vec4(0, 0, 0, 1);
function copyUnder(parent, templateObj, newName) {
    var copy = parent.copySceneObject(templateObj);
    copy.name = newName;
    return copy;
}

function loadStats() {
    try {
        store = global.persistentStorageSystem.store;
        gamesPlayed = store.getInt("wordle_gamesPlayed");
        gamesWon = store.getInt("wordle_gamesWon");
        currentStreak = store.getInt("wordle_streak");
        bestStreak = store.getInt("wordle_bestStreak");
    } catch (e) {
        // Persistent Storage not available in this preview — stats
        // will just count for this session only.
        store = null; gamesPlayed = 0; gamesWon = 0; currentStreak = 0; bestStreak = 0;
    }
}
function saveStats() {
    if (!store) { return; }
    try {
        store.putInt("wordle_gamesPlayed", gamesPlayed);
        store.putInt("wordle_gamesWon", gamesWon);
        store.putInt("wordle_streak", currentStreak);
        store.putInt("wordle_bestStreak", bestStreak);
    } catch (e) { print("AutoBuild: could not save stats"); }
}
function recordWin() {
    gamesPlayed++; gamesWon++; currentStreak++;
    if (currentStreak > bestStreak) { bestStreak = currentStreak; }
    saveStats();
}
// v75: day number for the daily word / save (same maths as
// pickWord, so the save and the daily word always agree).
function todayNumber() {
    try {
        var now = new Date();
        var dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return Math.floor(dayStart.getTime() / 86400000);
    } catch (e) { return -1; }
}
// v75: persist today's game (progress + win/loss) so leaving
// the lens and coming back does not restart it.
function saveGame() {
    if (!store) { return; }
    try {
        store.putInt("wordle_day", todayNumber());
        store.putString("wordle_guesses", guesses.join(","));
        store.putInt("wordle_over", gameOver ? 1 : 0);
        store.putInt("wordle_won", gameWon ? 1 : 0);
    } catch (e) { print("AutoBuild: could not save game"); }
}
// v75: load today's saved game into guesses/gameOver/gameWon.
// Returns true if a game for today was restored.
function loadGame() {
    try {
        if (!store) { return false; }
        if (store.getInt("wordle_day") !== todayNumber()) { return false; }
        var g = store.getString("wordle_guesses");
        if (!g) { return false; }
        var parts = g.split(",");
        var clean = [];
        for (var i = 0; i < parts.length; i++) {
            var w = parts[i];
            if (w && w.length === 6 && /^[A-Z]{6}$/.test(w)) { clean.push(w); }
        }
        if (clean.length === 0) { return false; }
        guesses = clean;
        current = "";
        gameOver = store.getInt("wordle_over") === 1;
        gameWon = store.getInt("wordle_won") === 1;
        return true;
    } catch (e) { return false; }
}
function recordLoss() {
    gamesPlayed++; currentStreak = 0;
    saveStats();
}
function statsText() {
    var pct = (gamesPlayed > 0) ? Math.round(gamesWon * 100 / gamesPlayed) : 0;
    return "Played: " + gamesPlayed + "\nWon: " + gamesWon + "\nWin %: " + pct + "%\nStreak: " + currentStreak + "\nBest streak: " + bestStreak;
}
// v59: show/hide a whole panel (bg + title + body + extras) together.
// v66: hide/show the board + keyboard LETTERS. Text renders
// on top of the panel Image, so grid/key letters show
// THROUGH a black panel. Hiding the letter SceneObjects
// while a panel is open fixes it; the tile/key BOXES stay
// (covered by the panel where they overlap).
function setBoardLettersVisible(v) {
    for (var i = 0; i < tiles.length; i++) {
        if (tiles[i]) { try { tiles[i].getSceneObject().enabled = v; } catch (e) { } }
    }
    // v68: key letters stay hidden after game over (the keyboard
    // is gone) - closing the Stats panel must not bring them back.
    var kv = v && !gameOver;
    for (var k = 0; k < keys.length; k++) {
        // v67: keys[] holds SceneObjects (not Text comps), so
        // set .enabled directly - getSceneObject() on a
        // SceneObject fails silently and the key letters never hid.
        if (keys[k]) { try { keys[k].enabled = kv; } catch (e) { } }
    }
}
// v68: hide/show the ENTIRE keyboard (boxes + letters + DEL
// icon). On game over it disappears so the countdown pill
// below the Stats panel is visible (Daily does the same).
function setKeyboardVisible(v) {
    for (var i = 0; i < keyBoxes.length; i++) {
        if (keyBoxes[i]) { try { keyBoxes[i].enabled = v; } catch (e) { } }
    }
    for (var k = 0; k < keys.length; k++) {
        if (keys[k]) { try { keys[k].enabled = v; } catch (e) { } }
    }
    if (delIconObj) { try { delIconObj.enabled = v; } catch (e) { } }
}
function updateBoardLetters() {
    // v74: also hide the letters while the intro popup is open.
    setBoardLettersVisible(panelOpen === "" && !introOpen);
}
// v74: show/hide the intro popup card.
function setIntroVisible(v) {
    introOpen = v;
    if (introPanelBg) { introPanelBg.enabled = v; }
    if (introTitleObj) { introTitleObj.enabled = v; }
    if (introBodyObj) { introBodyObj.enabled = v; }
    if (introPlayBg) { introPlayBg.enabled = v; }
    if (introPlayTextObj) { introPlayTextObj.enabled = v; }
    updateBoardLetters();
}
function setRulesPanelVisible(v) {
    if (rulesPanelBg) { rulesPanelBg.enabled = v; }
    if (rulesPanelObj) { rulesPanelObj.enabled = v; }
    if (rulesTitleObj) { rulesTitleObj.enabled = v; }
    if (rulesXObj) { rulesXObj.enabled = v; }
    for (var i = 0; i < ruleSwatches.length; i++) { if (ruleSwatches[i]) { ruleSwatches[i].enabled = v; } }
    updateBoardLetters();
}
function setStatsPanelVisible(v) {
    if (statsPanelBg) { statsPanelBg.enabled = v; }
    if (statsPanelObj) { statsPanelObj.enabled = v; }
    if (statsTitleObj) { statsTitleObj.enabled = v; }
    if (statsXObj) { statsXObj.enabled = v; }
    for (var i = 0; i < statRowObjs.length; i++) { if (statRowObjs[i]) { statRowObjs[i].enabled = v; } }
    updateBoardLetters();
}
// v60: write the 5 stats into the stats row (Daily style).
function updateStatsRow() {
    var pct = (gamesPlayed > 0) ? Math.round(gamesWon * 100 / gamesPlayed) : 0;
    var vals = [gamesPlayed, gamesWon, pct + "%", currentStreak, bestStreak];
    for (var i = 0; i < statNumTexts.length && i < vals.length; i++) {
        if (statNumTexts[i]) { statNumTexts[i].text = "" + vals[i]; }
    }
}
function closePanels() {
    panelOpen = "";
    setRulesPanelVisible(false);
    setStatsPanelVisible(false);
}
function toggleRules() {
    if (panelOpen === "rules") { closePanels(); return; }
    panelOpen = "rules";
    setStatsPanelVisible(false);
    if (rulesPanelText) {
        rulesPanelText.text = "Guess the 6-letter word in 5 tries.\n\nBLUE = right letter, right place\nYELLOW = right letter, wrong place\nGREY = letter not in the word\n\nENTER submits, BACK deletes.";
    }
    setRulesPanelVisible(true);
}
function toggleStats() {
    if (panelOpen === "stats") { closePanels(); return; }
    panelOpen = "stats";
    setRulesPanelVisible(false);
    updateStatsRow();
    setStatsPanelVisible(true);
}
// v23: get an Interaction Component, or make one in code
// and point it at the Orthographic Camera.
function getOrMakeInteraction(obj) {
    if (!obj) { return null; }
    var interaction = null;
    try { interaction = obj.getComponent("InteractionComponent"); } catch (e) { }
    if (!interaction) { try { interaction = obj.getComponent("Component.InteractionComponent"); } catch (e) { } }
    if (!interaction) {
        try { interaction = obj.createComponent("Component.InteractionComponent"); } catch (e) { }
    }
    if (interaction) {
        try { interaction.camera = script.orthoCamera; } catch (e) { }
    }
    return interaction;
}
function bindButton(obj, fn) {
    var interaction = getOrMakeInteraction(obj);
    if (interaction) { interaction.onTouchStart.add(fn); }
    else { print("AutoBuild: no Interaction Component on " + obj.name); }
}

function buildBoard() {
    if (!script.orthoCamera || !script.templateTileObj || !script.templateKeyObj) {
        print("AutoBuild: fill in orthoCamera, templateTileObj and templateKeyObj in the Inspector first.");
        return false;
    }
    // Hide the templates themselves so only the copies show
    script.templateTileObj.enabled = false;
    script.templateKeyObj.enabled = false;
    if (script.templateBoxObj) { script.templateBoxObj.enabled = false; }

    // 30 tiles, row-major: row 0 left-to-right first
    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
            var idx = r * COLS + c;
            // v18: white IMAGE box first, letter on top.
            if (script.templateBoxObj) {
                var boxObj = copyUnder(script.orthoCamera, script.templateBoxObj, "TileBox" + (idx + 1));
                boxObj.enabled = true;
                setPos(boxObj, TILE_X[c], TILE_Y[r]);
                setAnchorSize(boxObj, TILE_W, BLOCK_H);
                var bc = getImageComp(boxObj);
                // v23: set the box white here; drawBoard re-colours
                // it (re-cloning the material) on every redraw.
                setTileBoxColor(bc, TILE_GREY); // v51: tall tile (was setBoxColor)
                tileBox.push(bc);
            } else { tileBox.push(null); }
            var tileObj = copyUnder(script.orthoCamera, script.templateTileObj, "Tile" + (idx + 1));
            tileObj.enabled = true;
            setPos(tileObj, TILE_X[c], TILE_Y[r]);
            setAnchorSize(tileObj, TILE_W, BLOCK_H);
            var tc = getTextComp(tileObj);
            if (tc) { tc.text = ""; styleBlock(tc, BLOCK_FONT); noBg(tc); tc.textFill.color = HIDDEN; } // v33: no "." dot - empty tiles are truly empty
            tiles.push(tc);
        }
    }
    // v32: NO dark status bar (v28's rendered as a narrow black
    // box). The message now sits on a light glassy pill (its own
    // Text background, set below). Add the WORDLY title above it
    // and the 5 progress dots below it.
    if (script.templateMsgObj) {
        var titleObj = copyUnder(script.orthoCamera, script.templateMsgObj, "TitleText");
        titleObj.enabled = true;
        setPos(titleObj, 0, 0.86); // v54: whole game lifted up (was 0.76) - ENTER was hidden behind the carousel
        setAnchorSize(titleObj, 1.9, 0.16); // v53: taller anchor for the even bolder font (was 0.14)
        var titleText = getTextComp(titleObj);
        if (titleText) {
            setTextSize(titleText, 72); // v53: WORDLY even bolder (was 64)
            noBg(titleText); // v49: NO box behind WORDLY (v47 setBg rendered white, not black)
            titleText.textFill.color = INDIGO;
            try { titleText.horizontalAlignment = 1; } catch (e) { }
            titleText.text = "WORDLY";
            setBold(titleText, INDIGO); // v36: bold
        }
    }
    // v53: progress dots REMOVED (mustafa) - no dots are created.
    // v67: the message pill is REMOVED completely (mustafa) - it
    // sat under WORDLY and covered the title. messageText stays
    // null, so setMessage() is a no-op from here on.
    // (The countdown now lives in its own black pill, below.)
    if (script.templateMsgObj) {
        // v64: big game-over text on the board (Daily style) -
        // white bold with black outline, over the grid centre.
        gameOverTextObj = copyUnder(script.orthoCamera, script.templateMsgObj, "GameOverText");
        setPos(gameOverTextObj, 0, 0.55);
        // v67: black countdown pill (Daily style) below the Stats
        // panel - 'Next word in HH:MM:SS', white on black.
        if (script.templateBoxObj && script.countdownTexture) {
            countdownBgObj = copyUnder(script.orthoCamera, script.templateBoxObj, "CountdownBg");
            setPos(countdownBgObj, 0, -0.30); // v72: down into the green box (v71 at -0.20 was too high, almost touching Stats)
            setAnchorSize(countdownBgObj, 1.35, 0.14); // v73: Stats-panel width (was 1.9, too wide)
            setIcon(getImageComp(countdownBgObj), script.countdownTexture);
            countdownBgObj.enabled = false;
        }
        countdownTextObj = copyUnder(script.orthoCamera, script.templateMsgObj, "CountdownText");
        setPos(countdownTextObj, 0.08, -0.30); // v73: re-centred in the narrower pill, clear of the clock icon
        setAnchorSize(countdownTextObj, 1.15, 0.12); // v73: was 1.55
        countdownText = getTextComp(countdownTextObj);
        if (countdownText) { setTextSize(countdownText, 20); setBold(countdownText, WHITE); noBg(countdownText); countdownText.textFill.color = WHITE; try { countdownText.horizontalAlignment = 1; } catch (e) { } countdownText.text = ""; } // v69: font 20 bold like Daily's (was 18)
        countdownTextObj.enabled = false;
        setAnchorSize(gameOverTextObj, 1.8, 0.25);
        gameOverText = getTextComp(gameOverTextObj);
        if (gameOverText) { setTextSize(gameOverText, 44); styleBlock(gameOverText, 44); noBg(gameOverText); gameOverText.textFill.color = WHITE; try { gameOverText.horizontalAlignment = 1; } catch (e) { } gameOverText.text = ""; }
        gameOverTextObj.enabled = false;
        var rulesObj = copyUnder(script.orthoCamera, script.templateMsgObj, "RulesText");
        rulesObj.enabled = true;
        setPos(rulesObj, 0, 0.92);
        setAnchorSize(rulesObj, 1.9, 0.10);
        rulesTextComp = getTextComp(rulesObj);
        if (rulesTextComp) {
            // v11: reference has NO rules line at the top — it was
            // cut off on the left in ours and cluttered the top.
            // Rules live in the black Rules button instead.
            // Keep the object, empty text, so nothing shows.
            setTextSize(rulesTextComp, 14);
            noBg(rulesTextComp); rulesTextComp.textFill.color = BLACK;
            try { rulesTextComp.horizontalAlignment = 1; } catch (e) { }
            rulesTextComp.text = "";
        }
    }
    // QWERTY keys
    for (var i = 0; i < KEY_LAYOUT.length; i++) {
        var letter = KEY_LAYOUT[i][0];
        var keyName = (letter === "ENTER") ? "Key_ENTER" : (letter === "BACK") ? "Key_BACK" : "Key_" + letter;
        var keyObj = copyUnder(script.orthoCamera, script.templateKeyObj, keyName);
        keyObj.enabled = true;
        setPos(keyObj, KEY_LAYOUT[i][1], KEY_LAYOUT[i][2]);
        // Same height as tiles (0.11). Single letters: 0.14 wide.
        // DEL: 0.20 wide. ENTER: 0.28 wide, centred at 0.58 so it
        // ends at the same right edge (0.72) as the other keys.
        // v11 measured: single key 0.18 wide, BACK 0.24 wide,
        // ENTER 0.38 wide (about 2 keys), all height 0.09.
        var keyW = (letter === "ENTER") ? 0.70 : (letter === "BACK") ? 0.35 : KEY_W; // v53: ENTER pill BIGGER (was 0.62), DEL 126px
        var keyX = KEY_LAYOUT[i][1];
        setPos(keyObj, keyX, KEY_LAYOUT[i][2]);
        setAnchorSize(keyObj, keyW, KEY_H);
        // v18: IMAGE box behind the key letter. v28: clone its
        // material ONCE (keyBoxMat) and start unplayed keys in
        // Wordle light grey instead of plain white.
        var kboxObj = null;
        var km = null;
        if (letter === "ENTER" && script.enterPillTexture && script.templateBoxObj) {
            // v48: ENTER pill is BACK (v47 removed it by mistake).
            // The pill texture is 320x144 (2.22:1, Daily version -
            // import enter-pill-texture-daily.png), so the Image
            // renders ~200x90px like Daily's ENTER. Text "ENTER"
            // in white on top, no Text bg.
            kboxObj = copyUnder(script.orthoCamera, script.templateBoxObj, "KeyBox_ENTER");
            kboxObj.enabled = true;
            setPos(kboxObj, keyX, KEY_LAYOUT[i][2]);
            setAnchorSize(kboxObj, keyW, KEY_H);
            setIcon(getImageComp(kboxObj), script.enterPillTexture);
        } else if (letter === "ENTER") {
            // v33/v34 fallback: Text pill (no Image box). The Text
            // background hugs "ENTER" and makes a blue pill. The
            // tap binds to the Text itself (bindKeys falls back to
            // the key object when the box is null).
        } else if (script.templateBoxObj) {
            kboxObj = copyUnder(script.orthoCamera, script.templateBoxObj, "KeyBox_" + letter);
            kboxObj.enabled = true;
            setPos(kboxObj, keyX, KEY_LAYOUT[i][2]);
            setAnchorSize(kboxObj, keyW, KEY_H);
            var kbc = getImageComp(kboxObj);
            km = makeBoxMat(kbc);
            // v43: NO tall-key texture (it made tiles narrow in
            // v42). Keys use the square whiteTexture, so they
            // render as WIDE squares. BACK (DEL) uses the wide
            // delete-tile texture (192x143, 1.34:1) so it renders
            // 126x93px like Daily's DEL. baseColor stays KEY_GREY,
            // so the white textures render light grey.
            if (letter === "BACK" && km && km.mainPass && script.deleteTileTexture) { try { km.mainPass.baseTex = script.deleteTileTexture; } catch (e1) { } }
            if (km && km.mainPass) { try { km.mainPass.baseColor = KEY_GREY; } catch (e1) { } }
            else { setBoxColor(kbc, KEY_GREY); }
        }
        // v34: DEL key shows a delete icon if deleteIconTexture is
        // filled (import delete-icon.png). The icon Image sits on
        // top of the light-grey key box; the "DEL" text is hidden
        // below when the icon is used. Falls back to "DEL" text.
        if (letter === "BACK" && script.deleteIconTexture && script.templateBoxObj) {
            delIconObj = copyUnder(script.orthoCamera, script.templateBoxObj, "DeleteIcon");
            delIconObj.enabled = true;
            setPos(delIconObj, keyX, KEY_LAYOUT[i][2]);
            setAnchorSize(delIconObj, keyW * 0.65, KEY_H * 0.65); // v46: small DEL icon centred in the key, like Daily (was full keyW x KEY_H)
            setIcon(getImageComp(delIconObj), script.deleteIconTexture);
        }
        var kc = getTextComp(keyObj);
        if (kc) {
            kc.text = (letter === "BACK") ? (script.deleteIconTexture ? "" : "DEL") : letter; // v34: hide "DEL" when the icon is used
            if (letter === "ENTER") {
                styleBlock(kc, 30); // v53: ENTER word a little bigger in the bigger pill (was 28)
                setBold(kc, WHITE); // v48: bold white ENTER on the blue pill
                if (script.enterPillTexture) { noBg(kc); } // v35: the pill Image is the background
                else { setBg(kc, INDIGO); } // fallback: Text pill
                kc.textFill.color = WHITE;
            } else {
                styleBlock(kc, (letter === "BACK") ? 24 : BLOCK_FONT);
                if (letter !== "BACK") { setBold(kc, BLACK); } // v45: bold letters, centred in the tile like Daily
                noBg(kc);
                kc.textFill.color = BLACK;
            }
        }
        keys.push(keyObj);
        keyBoxes.push(kboxObj || null);
        keyBoxMat.push(km);
        keyTextComp.push(kc || null);
    }
    // Rules + Stats buttons (top-right, like the reference)
    // v10: reference has BLACK Rules/Stats buttons on the right.
    // Ours were invisible — "?" / "S" were white text (template
    // colour) on a light box. Now: black box, white text, at the
    // right edge beside the board, like the reference.
    // v11 measured from reference: Rules (0.89, 0.30),
    // Stats (0.89, 0.18) — beside the board, middle-right,
    // NOT top-right. Black box, white text, so they pop.
    var rulesBtn = copyUnder(script.orthoCamera, script.templateKeyObj, "RulesButton");
    rulesBtn.enabled = true;
    setPos(rulesBtn, 0.89, 0.42); // v54: lifted up with the game (was 0.32)
    setAnchorSize(rulesBtn, 0.16, 0.10);
    if (script.templateBoxObj) {
        var rbBoxObj = copyUnder(script.orthoCamera, script.templateBoxObj, "RulesBox");
        rbBoxObj.enabled = true; setPos(rbBoxObj, 0.89, 0.40); setAnchorSize(rbBoxObj, 0.16, 0.10); // v54: lifted up (was 0.30)
        setBoxColor(getImageComp(rbBoxObj), INDIGO); // v32: indigo button (was black)
        // v33: SVG/PNG icon on top, if rulesIconTexture is filled
        // (import rules-icon.png). Falls back to "?" below if not.
        if (script.rulesIconTexture) {
            var rbIconObj = copyUnder(script.orthoCamera, script.templateBoxObj, "RulesIcon");
            rbIconObj.enabled = true; setPos(rbIconObj, 0.89, 0.40); setAnchorSize(rbIconObj, 0.16 * 0.65, 0.10 * 0.65); // v54: lifted up (was 0.30); v46: small '?' icon centred in the button, like Daily (was full 0.16 x 0.10)
            setIcon(getImageComp(rbIconObj), script.rulesIconTexture);
        }
    }
    var rbText = getTextComp(rulesBtn);
    if (rbText) { rbText.text = script.rulesIconTexture ? "" : "?"; styleBlock(rbText, BLOCK_FONT); noBg(rbText); rbText.textFill.color = boxColorWorks ? WHITE : BLACK; }
    bindButton((typeof rbBoxObj !== "undefined" && rbBoxObj) ? rbBoxObj : rulesBtn, toggleRules);
    var statsBtn = copyUnder(script.orthoCamera, script.templateKeyObj, "StatsButton");
    statsBtn.enabled = true;
    setPos(statsBtn, 0.89, 0.29); // v54: lifted up with the game (was 0.19)
    setAnchorSize(statsBtn, 0.16, 0.10);
    if (script.templateBoxObj) {
        var sbBoxObj = copyUnder(script.orthoCamera, script.templateBoxObj, "StatsBox");
        sbBoxObj.enabled = true; setPos(sbBoxObj, 0.89, 0.28); setAnchorSize(sbBoxObj, 0.16, 0.10); // v54: lifted up (was 0.18)
        setBoxColor(getImageComp(sbBoxObj), INDIGO); // v32: indigo button (was black)
        // v33: SVG/PNG icon on top, if statsIconTexture is filled
        // (import stats-icon.png). Falls back to "S" below if not.
        if (script.statsIconTexture) {
            var sbIconObj = copyUnder(script.orthoCamera, script.templateBoxObj, "StatsIcon");
            sbIconObj.enabled = true; setPos(sbIconObj, 0.89, 0.28); setAnchorSize(sbIconObj, 0.16 * 0.65, 0.10 * 0.65); // v54: lifted up (was 0.18); v46: small bars icon centred in the button, like Daily (was full 0.16 x 0.10)
            setIcon(getImageComp(sbIconObj), script.statsIconTexture);
        }
    }
    var sbText = getTextComp(statsBtn);
    if (sbText) { sbText.text = script.statsIconTexture ? "" : "S"; styleBlock(sbText, BLOCK_FONT); noBg(sbText); sbText.textFill.color = boxColorWorks ? WHITE : BLACK; }
    bindButton((typeof sbBoxObj !== "undefined" && sbBoxObj) ? sbBoxObj : statsBtn, toggleStats);
    // v59: Hidden BLACK modal panels (Daily style) — shown only
    // when their button is tapped. Black rounded-rect bg +
    // white title + white body + X close. Rules also gets 3
    // colour swatches (blue W / yellow Y / grey F).
    if (script.templateMsgObj) {
        // --- Rules panel ---
        if (script.templateBoxObj && script.rulesPanelTexture) {
            rulesPanelBg = copyUnder(script.orthoCamera, script.templateBoxObj, "RulesPanelBg");
            setPos(rulesPanelBg, 0, 0.00);
            setAnchorSize(rulesPanelBg, 1.55, 1.25);
            setIcon(getImageComp(rulesPanelBg), script.rulesPanelTexture);
            rulesPanelBg.enabled = false;
        }
        rulesTitleObj = copyUnder(script.orthoCamera, script.templateMsgObj, "RulesTitle");
        setPos(rulesTitleObj, 0, 0.30);
        setAnchorSize(rulesTitleObj, 1.4, 0.12);
        var rulesTitleText = getTextComp(rulesTitleObj);
        if (rulesTitleText) { setTextSize(rulesTitleText, 28); noBg(rulesTitleText); rulesTitleText.textFill.color = WHITE; try { rulesTitleText.horizontalAlignment = 1; } catch (e) { } rulesTitleText.text = "HOW TO PLAY"; setBold(rulesTitleText, WHITE); }
        rulesTitleObj.enabled = false;
        // Swatches: blue W, yellow Y, grey F in a row.
        var swatchCols = [BLUE, YELLOW, GREY];
        var swatchLetters = ["W", "Y", "F"];
        var swatchX = [-0.35, 0.00, 0.35];
        for (var sw = 0; sw < 3; sw++) {
            var swBox = copyUnder(script.orthoCamera, script.templateBoxObj, "Swatch" + sw);
            setPos(swBox, swatchX[sw], 0.16);
            setAnchorSize(swBox, 0.13, 0.10);
            setBoxColor(getImageComp(swBox), swatchCols[sw]);
            swBox.enabled = false;
            ruleSwatches.push(swBox);
            var swTxtObj = copyUnder(script.orthoCamera, script.templateKeyObj, "SwatchLetter" + sw);
            setPos(swTxtObj, swatchX[sw], 0.16);
            setAnchorSize(swTxtObj, 0.13, 0.10);
            var swTxt = getTextComp(swTxtObj);
            if (swTxt) { swTxt.text = swatchLetters[sw]; styleBlock(swTxt, 24); setBold(swTxt, (sw === 1) ? BLACK : WHITE); noBg(swTxt); swTxt.textFill.color = (sw === 1) ? BLACK : WHITE; }
            swTxtObj.enabled = false;
            ruleSwatches.push(swTxtObj);
        }
        rulesPanelObj = copyUnder(script.orthoCamera, script.templateMsgObj, "RulesPanel");
        setPos(rulesPanelObj, 0, -0.08);
        setAnchorSize(rulesPanelObj, 1.25, 0.85);
        rulesPanelText = getTextComp(rulesPanelObj);
        if (rulesPanelText) { setTextSize(rulesPanelText, 16); noBg(rulesPanelText); rulesPanelText.textFill.color = WHITE; try { rulesPanelText.horizontalAlignment = 0; } catch (e) { } }
        rulesPanelObj.enabled = false;
        rulesXObj = copyUnder(script.orthoCamera, script.templateMsgObj, "RulesX");
        setPos(rulesXObj, 0.63, 0.30);
        setAnchorSize(rulesXObj, 0.12, 0.12);
        var rulesXText = getTextComp(rulesXObj);
        if (rulesXText) { setTextSize(rulesXText, 26); noBg(rulesXText); rulesXText.textFill.color = WHITE; try { rulesXText.horizontalAlignment = 1; } catch (e) { } rulesXText.text = "X"; setBold(rulesXText, WHITE); }
        rulesXObj.enabled = false;
        bindButton(rulesXObj, closePanels);
        // --- Stats panel ---
        if (script.templateBoxObj && script.panelTexture) {
            statsPanelBg = copyUnder(script.orthoCamera, script.templateBoxObj, "StatsPanelBg");
            setPos(statsPanelBg, 0, 0.05);
            setAnchorSize(statsPanelBg, 1.35, 0.70);
            setIcon(getImageComp(statsPanelBg), script.panelTexture);
            statsPanelBg.enabled = false;
        }
        statsTitleObj = copyUnder(script.orthoCamera, script.templateMsgObj, "StatsTitle");
        setPos(statsTitleObj, 0, 0.18);
        setAnchorSize(statsTitleObj, 1.2, 0.12);
        var statsTitleText = getTextComp(statsTitleObj);
        if (statsTitleText) { setTextSize(statsTitleText, 28); noBg(statsTitleText); statsTitleText.textFill.color = WHITE; try { statsTitleText.horizontalAlignment = 1; } catch (e) { } statsTitleText.text = "STATS"; setBold(statsTitleText, WHITE); }
        statsTitleObj.enabled = false;
        // v60: Stats as a row (Daily style) - 5 columns, big
        // number on top, small label below. No multi-line text.
        var statLabels = ["Played", "Won", "Win %", "Streak", "Best"];
        var statColsX = [-0.48, -0.24, 0.00, 0.24, 0.48];
        for (var sc = 0; sc < 5; sc++) {
            var numObj = copyUnder(script.orthoCamera, script.templateMsgObj, "StatNum" + sc);
            setPos(numObj, statColsX[sc], 0.09);
            setAnchorSize(numObj, 0.22, 0.12);
            var numText = getTextComp(numObj);
            if (numText) { setTextSize(numText, 26); noBg(numText); numText.textFill.color = WHITE; try { numText.horizontalAlignment = 1; } catch (e) { } numText.text = "0"; setBold(numText, WHITE); statNumTexts.push(numText); }
            numObj.enabled = false;
            statRowObjs.push(numObj);
            var labObj = copyUnder(script.orthoCamera, script.templateMsgObj, "StatLabel" + sc);
            setPos(labObj, statColsX[sc], 0.00);
            setAnchorSize(labObj, 0.22, 0.10);
            var labText = getTextComp(labObj);
            if (labText) { setTextSize(labText, 14); noBg(labText); labText.textFill.color = WHITE; try { labText.horizontalAlignment = 1; } catch (e) { } labText.text = statLabels[sc]; }
            labObj.enabled = false;
            statRowObjs.push(labObj);
        }
        statsPanelObj = null; // v60: row replaces the multi-line panel
        statsXObj = copyUnder(script.orthoCamera, script.templateMsgObj, "StatsX");
        setPos(statsXObj, 0.55, 0.18);
        setAnchorSize(statsXObj, 0.12, 0.12);
        var statsXText = getTextComp(statsXObj);
        if (statsXText) { setTextSize(statsXText, 26); noBg(statsXText); statsXText.textFill.color = WHITE; try { statsXText.horizontalAlignment = 1; } catch (e) { } statsXText.text = "X"; setBold(statsXText, WHITE); }
        statsXObj.enabled = false;
        bindButton(statsXObj, closePanels);
    }
    // v74: INTRO POPUP CARD (Daily style) - shown on lens start.
    // Black card + WORDLY + how to play + PLAY button. Created
    // last so it sits on top. Tap PLAY (or the card) to dismiss.
    if (script.templateMsgObj) {
        if (script.templateBoxObj && script.panelTexture) {
            introPanelBg = copyUnder(script.orthoCamera, script.templateBoxObj, "IntroPanelBg");
            setPos(introPanelBg, 0, 0.10);
            setAnchorSize(introPanelBg, 1.35, 0.90);
            setIcon(getImageComp(introPanelBg), script.panelTexture);
            introPanelBg.enabled = false;
        }
        introTitleObj = copyUnder(script.orthoCamera, script.templateMsgObj, "IntroTitle");
        setPos(introTitleObj, 0, 0.38);
        setAnchorSize(introTitleObj, 1.2, 0.12);
        introTitleText = getTextComp(introTitleObj);
        if (introTitleText) { setTextSize(introTitleText, 40); setBold(introTitleText, INDIGO); noBg(introTitleText); introTitleText.textFill.color = INDIGO; try { introTitleText.horizontalAlignment = 1; } catch (e) { } introTitleText.text = "WORDLY"; }
        introTitleObj.enabled = false;
        introBodyObj = copyUnder(script.orthoCamera, script.templateMsgObj, "IntroBody");
        setPos(introBodyObj, 0, 0.08);
        setAnchorSize(introBodyObj, 1.15, 0.30);
        introBodyText = getTextComp(introBodyObj);
        if (introBodyText) { setTextSize(introBodyText, 19); noBg(introBodyText); introBodyText.textFill.color = WHITE; try { introBodyText.horizontalAlignment = 1; } catch (e) { } introBodyText.text = "Guess the 6-letter word in 5 tries!\n\nNew word every 24 hours!"; }
        introBodyObj.enabled = false;
        if (script.templateBoxObj && script.enterPillTexture) {
            introPlayBg = copyUnder(script.orthoCamera, script.templateBoxObj, "IntroPlayBg");
            setPos(introPlayBg, 0, -0.18);
            setAnchorSize(introPlayBg, 0.55, 0.18);
            setIcon(getImageComp(introPlayBg), script.enterPillTexture);
            introPlayBg.enabled = false;
        }
        introPlayTextObj = copyUnder(script.orthoCamera, script.templateMsgObj, "IntroPlayText");
        setPos(introPlayTextObj, 0, -0.18);
        setAnchorSize(introPlayTextObj, 0.55, 0.14);
        introPlayText = getTextComp(introPlayTextObj);
        if (introPlayText) { setTextSize(introPlayText, 22); setBold(introPlayText, WHITE); noBg(introPlayText); introPlayText.textFill.color = WHITE; try { introPlayText.horizontalAlignment = 1; } catch (e) { } introPlayText.text = "PLAY"; }
        introPlayTextObj.enabled = false;
        // Tap PLAY (or the card) to dismiss and start playing.
        if (introPlayBg) { bindButton(introPlayBg, function () { setIntroVisible(false); }); }
        if (introPanelBg) { bindButton(introPanelBg, function () { setIntroVisible(false); }); }
        setIntroVisible(true); // v74: show on lens start
    }
    print("AutoBuild: built " + tiles.length + " tiles and " + keys.length + " keys. Boxes: " + tileBox.length + ", box colour: " + boxColorWorks);
    return true;
}

function pickWord() {
    var list = script.wordList;
    var clean = [];
    for (var i = 0; i < list.length; i++) {
        var w = list[i].toUpperCase();
        if (w.length === 6 && /^[A-Z]{6}$/.test(w)) { clean.push(w); }
    }
    if (clean.length === 0) { return "PLANET"; }
    // v66: DAILY word (from v24/v25) - one shared word per day,
    // flips at local midnight, cycles the 61-word list.
    // try/catch (v26 fix): if Date is missing the lens used to
    // die on load; now it falls back to a random word.
    try {
        var now = new Date();
        var dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var dayNumber = Math.floor(dayStart.getTime() / 86400000);
        return clean[dayNumber % clean.length];
    } catch (e) {
        return clean[Math.floor(Math.random() * clean.length)];
    }
}
// v66: time until the next daily word (local midnight), "HH:MM:SS".
function nextWordIn() {
    try {
        var now = new Date();
        var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        var ms = midnight.getTime() - now.getTime();
        if (ms < 0) { ms = 0; }
        var total = Math.floor(ms / 1000);
        var h = Math.floor(total / 3600);
        var m = Math.floor((total % 3600) / 60);
        var sec = total % 60;
        return (h < 10 ? "0" + h : "" + h) + ":" + (m < 10 ? "0" + m : "" + m) + ":" + (sec < 10 ? "0" + sec : "" + sec);
    } catch (e) { return "--:--:--"; }
}
function scoreGuess(guess, answer) {
    var result = [0, 0, 0, 0, 0, 0];
    var remaining = answer.split("");
    for (var i = 0; i < 6; i++) {
        if (guess[i] === answer[i]) { result[i] = 2; remaining[i] = null; }
    }
    for (var j = 0; j < 6; j++) {
        if (result[j] === 0) {
            var k = remaining.indexOf(guess[j]);
            if (k !== -1) { result[j] = 1; remaining[k] = null; }
        }
    }
    return result;
}
function drawBoard() {
    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
            var idx = r * COLS + c;
            var tile = tiles[idx];
            var box = tileBox[idx];
            if (!tile) { continue; }
            if (r < guesses.length) {
                var s = scoreGuess(guesses[r], target);
                tile.text = guesses[r][c];
                var bg = (s[c] === 2) ? BLUE : (s[c] === 1) ? YELLOW : GREY;
                // v18: box turns blue/yellow/grey. If box colour
                // cloning failed, the box stays white and the
                // LETTER takes the score colour instead.
                setTileBoxColor(box, bg); // v51: tall tile
                if (boxColorWorks) { tile.textFill.color = (s[c] === 1) ? BLACK : WHITE; }
                else { tile.textFill.color = bg; }
            } else if (r === guesses.length) {
                setTileBoxColor(box, TILE_GREY); // v51: tall tile (was setBoxColor)
                if (c < current.length) { tile.text = current[c]; tile.textFill.color = BLACK; }
                else { tile.text = ""; tile.textFill.color = HIDDEN; } // v33: no "." dot
            } else {
                setTileBoxColor(box, TILE_GREY); // v51: tall tile (was setBoxColor)
                tile.text = ""; // v33: no "." dot
                tile.textFill.color = HIDDEN;
            }
        }
    }
    // v28: colour the keyboard like Wordle - each key shows
    // the BEST result for that letter across all guesses
    // (blue > yellow > grey, so a key never downgrades).
    // Unplayed keys stay Wordle light grey.
    var keyStatus = {};
    for (var g = 0; g < guesses.length; g++) {
        var gs = scoreGuess(guesses[g], target);
        for (var c2 = 0; c2 < COLS; c2++) {
            var L = guesses[g][c2];
            if (keyStatus[L] === undefined || gs[c2] > keyStatus[L]) { keyStatus[L] = gs[c2]; }
        }
    }
    for (var k = 0; k < keys.length; k++) {
        var kl = KEY_LAYOUT[k][0];
        if (kl.length !== 1 || kl < "A" || kl > "Z") { continue; } // ENTER / DEL stay white
        var kt = keyTextComp[k];
        var st = keyStatus[kl];
        if (st === undefined) {
            setKeyBoxColor(k, KEY_GREY);
            if (kt) { kt.textFill.color = BLACK; }
        } else {
            var kbg = (st === 2) ? BLUE : (st === 1) ? YELLOW : GREY;
            if (boxColorWorks) {
                setKeyBoxColor(k, kbg);
                if (kt) { kt.textFill.color = (st === 1) ? BLACK : WHITE; }
            } else {
                if (kt) { kt.textFill.color = kbg; }
            }
        }
    }
}
// v53: updateDots() removed with the dots.
function setMessage(text) {
    if (messageText) { messageText.text = text; }
}
// v75: restore today's saved game (if any) and set up the
// screen for it, WITHOUT re-recording the win/loss.
// Returns true if a game for today was restored.
function restoreToday() {
    if (!loadGame()) { return false; }
    target = pickWord(); // same daily word
    setKeyboardVisible(!gameOver);
    if (gameOverTextObj) { gameOverTextObj.enabled = false; }
    if (countdownBgObj) { countdownBgObj.enabled = false; }
    if (countdownTextObj) { countdownTextObj.enabled = false; }
    closePanels();
    flipRow = -1; flipScores = null; flipGuess = ""; flipElapsed = 0;
    for (var i = 0; i < ROWS * COLS; i++) { setTileScale(i, 1); }
    drawBoard(); // re-colours the tiles AND the keyboard from guesses
    if (gameOver) {
        // Show the game-over screen, exactly like finishFlip,
        // but do NOT call recordWin/recordLoss again.
        if (gameOverText) { gameOverText.text = gameWon ? "You won!" : "Game over!"; }
        if (gameOverTextObj) { gameOverTextObj.enabled = true; }
        if (countdownBgObj) { countdownBgObj.enabled = true; }
        if (countdownTextObj) { countdownTextObj.enabled = true; }
        if (countdownText) { countdownText.text = "Next word in " + nextWordIn(); }
        panelOpen = "stats"; updateStatsRow(); setStatsPanelVisible(true);
    }
    setIntroVisible(false); // v75: no intro - the player already started today
    return true;
}
function newGame() {
    target = pickWord();
    guesses = [];
    current = "";
    gameOver = false;
    gameWon = false;
    setKeyboardVisible(true); // v68: keyboard back for the new game
    if (gameOverTextObj) { gameOverTextObj.enabled = false; }
    if (countdownBgObj) { countdownBgObj.enabled = false; }
    if (countdownTextObj) { countdownTextObj.enabled = false; }
    closePanels();
    flipRow = -1; flipScores = null; flipGuess = ""; flipElapsed = 0; // v56: stop any flip
    for (var i = 0; i < ROWS * COLS; i++) { setTileScale(i, 1); } // v56: reset all tile scales
    drawBoard();
    setMessage(""); // v35: removed the "Guess the 6-letter word!" line
}
function submitGuess() {
    if (gameOver) { return; } // v67: daily word - no new game until tomorrow (countdown pill already shows)
    if (current.length !== 6) { return; } // v67: message pill removed - no 'Type 6 letters' line
    if (flipRow >= 0) { return; } // v56: a flip is already playing - ignore
    guesses.push(current);
    var g = current;
    current = "";
    // v56: start the tile flip for this row instead of an
    // instant drawBoard(). Letters go in now (grey boxes);
    // each tile's colour swaps at its flip midpoint (see the
    // UpdateEvent below). Keyboard + win/loss wait for
    // finishFlip() so the reveal plays out first.
    flipRow = guesses.length - 1;
    flipScores = scoreGuess(g, target);
    flipGuess = g;
    flipColored = [false, false, false, false, false, false];
    flipElapsed = 0;
    for (var c = 0; c < COLS; c++) {
        var idx = flipRow * COLS + c;
        var tile = tiles[idx];
        if (tile) { tile.text = g[c]; tile.textFill.color = BLACK; }
        setTileBoxColor(tileBox[idx], TILE_GREY);
    }
}
function finishFlip() {
    // v56: called when the flip animation completes - now
    // update the keyboard colours and settle win/loss.
    drawBoard();
    if (guesses[guesses.length - 1] === target) {
        gameOver = true;
        gameWon = true;
        recordWin();
        setKeyboardVisible(false); // v68: whole keyboard disappears on game over
        if (gameOverText) { gameOverText.text = "You won!"; }
        if (gameOverTextObj) { gameOverTextObj.enabled = true; }
        if (countdownBgObj) { countdownBgObj.enabled = true; }
        if (countdownTextObj) { countdownTextObj.enabled = true; }
        if (countdownText) { countdownText.text = "Next word in " + nextWordIn(); }
        panelOpen = "stats"; updateStatsRow(); setStatsPanelVisible(true);
    } else if (guesses.length === 5) { // v32: 5 guesses, not 6
        gameOver = true;
        gameWon = false;
        recordLoss();
        setKeyboardVisible(false); // v68: whole keyboard disappears on game over
        if (gameOverText) { gameOverText.text = "Game over!"; }
        if (gameOverTextObj) { gameOverTextObj.enabled = true; }
        if (countdownBgObj) { countdownBgObj.enabled = true; }
        if (countdownTextObj) { countdownTextObj.enabled = true; }
        if (countdownText) { countdownText.text = "Next word in " + nextWordIn(); }
        panelOpen = "stats"; updateStatsRow(); setStatsPanelVisible(true);
    } else {
        // v67: message pill removed - nothing to clear.
    }
    saveGame(); // v75: persist after every guess (progress + win/loss)
}
function onKey(letter) {
    if (introOpen) { return; } // v74: intro popup is open - tap PLAY first
    if (panelOpen !== "") { return; } // v66: a panel is open - close it first (X or its button). No ENTER restart: daily word.
    if (flipRow >= 0) { return; } // v56: a flip is playing - ignore input until it finishes
    if (letter === "ENTER") { submitGuess(); }
    else if (letter === "BACK") {
        if (!gameOver && current.length > 0) {
            current = current.substring(0, current.length - 1);
            drawBoard();
        }
    } else if (letter.length === 1 && !gameOver && current.length < 6) {
        current += letter;
        drawBoard();
    }
}
function bindKeys() {
    for (var i = 0; i < keys.length; i++) {
        (function (keyObject, boxObject) {
            // v23: bind the BOX so the whole key square is
            // tappable. Fall back to the letter Text if the
            // box is missing.
            var target = boxObject || keyObject;
            var interaction = getOrMakeInteraction(target);
            // Fallback: if the box could not get an
            // interaction (createComponent missing), use
            // the letter's own Interaction Component.
            if (!interaction && boxObject) { interaction = getOrMakeInteraction(keyObject); }
            if (!interaction) {
                print("AutoBuild: no Interaction Component on " + keyObject.name);
                return;
            }
            var suffix = keyObject.name.substring(4);
            interaction.onTouchStart.add(function () { onKey(suffix); });
            // v53: ALSO bind the letter Text as a backup, so the
            // key still works if the box tap is blocked (ENTER's
            // pill box was untappable in v52). Only the topmost
            // one fires per tap, so no double-fire.
            if (boxObject) {
                var interaction2 = getOrMakeInteraction(keyObject);
                if (interaction2 && interaction2 !== interaction) {
                    interaction2.onTouchStart.add(function () { onKey(suffix); });
                }
            }
        })(keys[i], keyBoxes[i]);
    }
}

function onStart() {
    boxColorWorks = testBoxColor();
    print("AutoBuild: box colour cloning works = " + boxColorWorks);
    print("AutoBuild: v77 loaded (lens-sync test 2)");
    loadStats();
    if (buildBoard()) {
        bindKeys();
        // v75: if today's game was already played (or is in
        // progress), restore it instead of starting fresh.
        if (!restoreToday()) { newGame(); }
    }
}
// v56: flip driver - advances the tile flip every frame.
script.createEvent("UpdateEvent").bind(function (eventData) {
    // v67: live countdown in the black pill while the game is over.
    if (gameOver && countdownText) {
        countdownText.text = "Next word in " + nextWordIn();
    }
    if (flipRow < 0 || !flipScores) { return; }
    var dt = 0.016;
    try { dt = eventData.getDeltaTime(); } catch (e) { }
    if (!(dt > 0) || dt > 0.1) { dt = 0.016; }
    flipElapsed += dt;
    // Safety: force-finish a stuck flip after 2s.
    var forceDone = flipElapsed > 2;
    var allDone = true;
    for (var c = 0; c < COLS; c++) {
        var idx = flipRow * COLS + c;
        var p = (flipElapsed - c * FLIP_STAGGER) / FLIP_DUR;
        if (p < 0) { allDone = false; continue; }
        if (p >= 1 || forceDone) { p = 1; }
        var sx = Math.abs(1 - 2 * p); // 1 -> 0 -> 1
        setTileScale(idx, sx);
        if ((p >= 0.5 || forceDone) && !flipColored[c]) {
            flipColored[c] = true;
            var sc = flipScores[c];
            var bg = (sc === 2) ? BLUE : (sc === 1) ? YELLOW : GREY;
            setTileBoxColor(tileBox[idx], bg);
            var tile = tiles[idx];
            if (tile) {
                tile.text = flipGuess[c];
                if (boxColorWorks) { tile.textFill.color = (sc === 1) ? BLACK : WHITE; }
                else { tile.textFill.color = bg; }
            }
        }
        if (p < 1 && !forceDone) { allDone = false; }
    }
    if (allDone) {
        for (var c2 = 0; c2 < COLS; c2++) { setTileScale(flipRow * COLS + c2, 1); }
        flipRow = -1;
        flipScores = null;
        finishFlip();
    }
});
script.createEvent("OnStartEvent").bind(onStart);
