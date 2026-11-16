HOMEMADE BADGE - WEBSITE AND PUBLIC PROJECT SNAPSHOT
Captured from https://homemadebadge.com/ on 2026-11-16.

START
Extract the ZIP first. Do not open index.html directly with file://.
Windows (Python required): double-click START-WINDOWS.bat.
Other systems: python3 -m http.server 8000 --bind 127.0.0.1
Then open http://localhost:8000/

GITHUB PAGES
Upload the extracted contents, including index.html, _next/, emulator/ and
.nojekyll, to your Pages publishing folder. No npm install or build is needed.
Keep .nojekyll: it allows the _next directory to be served by GitHub Pages.
The asset paths support both a domain root and a repository subdirectory.
All original project names, contract address, social links and credits remain.

WHAT IS INCLUDED
- The original homepage with Home, Token, Play and Inside sections.
- All discovered local JS chunks, CSS, fonts, icons and social preview images.
- The procedural 3D badge implementation and its rendering dependencies.
- The real compiled emulator: solana-os.js, solana-os.wasm and apps/pump.txt.
- The complete publicly linked project repository, without Git history,
  under published-source/; its original license and README are retained.
- The author's independent emulator harness under emulator/harness/.
  This auxiliary page was included from the public repository and adapted
  to the downloaded assets; it is not a separate live website page.
  Open /emulator/harness/?install=pump. After installation, type
  "lua run pump" in its console to open the Pump app.

PAGE COVERAGE
The live site's navigation links to /#top, /#token, /#play and /#inside.
These are sections of one page, not separate HTML routes.
No independent same-domain content pages were discovered in those links or
the downloaded application chunks. /robots.txt and /sitemap.xml returned 404.
The /emulator/ directory contains assets; its directory URL returned 404.
External GitHub, X and pump.fun pages remain external links.

PORTABILITY CHANGES
Only index.html and two JS chunks have asset-path adjustments for subfolders.
Their unchanged downloaded versions are retained under original-files/.
The harness only has relative file-path adjustments.
The main website design, wording, behavior and firmware are not rewritten.

LIMITS
This is the deployed browser frontend plus the separately published project
source. The private website authoring project, server code, credentials and
private APIs cannot be recovered from public web pages. No such files are
claimed to be included. The published firmware repository uses an upstream
Solana OS checkout when rebuilt; see its original README and setup.sh.
Local menus, rendering and firmware use the included assets. Network-backed
features still depend on their original external services (Solana RPC,
IPFS/Filebase, badge services and other app endpoints), their availability,
CORS policy, and any user-supplied credentials or funds.

VERIFICATION
All 28 referenced local resources are present and JavaScript syntax checks pass.
The standalone emulator booted, installed Pump and displayed its DEVNET form.
Boot and app installation also passed in a repository-style subdirectory.
See verification.json for details.
The available test browser disables WebGL, which also breaks the live
original page. The 3D scene files are included, but its visual rendering
could not be verified in this environment. A WebGL-capable browser is needed.
No transaction was signed or broadcast during verification.

PUBLIC SOURCE
https://github.com/BerKai97/homemade-solana-badge
Commit: db54e34f879ea30900afcf1bb529f71af2598aab
Preserve original attribution and applicable licenses when reusing files.
