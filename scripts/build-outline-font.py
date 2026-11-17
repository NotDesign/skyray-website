"""Create the tiny E/D/S outline face from the bundled Lexend source.

Rebuild in an isolated Python environment with fonttools and skia-pathops.
The contour union must happen before subsetting: CSS strokes otherwise expose
overlapping source paths, and text-shadow can leave seams along curved edges.
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.ttLib.removeOverlaps import removeOverlaps

root = Path(__file__).resolve().parents[1]
font = TTFont(root / "public/fonts/lexend-semibold.ttf")
glyphs = [font.getBestCmap()[ord(char)] for char in "EDS"]
removeOverlaps(font, glyphs)

options = subset.Options()
options.name_IDs = ["*"]
subsetter = subset.Subsetter(options=options)
subsetter.populate(text="EDS")
subsetter.subset(font)

# Give the derivative its own family name; preserve the source attribution.
names = {1: "Skyray Outline", 2: "SemiBold", 3: "SkyrayOutline-SemiBold-1",
         4: "Skyray Outline SemiBold", 6: "SkyrayOutline-SemiBold",
         16: "Skyray Outline", 17: "SemiBold"}
for name in font["name"].names:
    if name.nameID in names:
        name.string = names[name.nameID].encode(name.getEncoding())
font.save(root / "public/fonts/skyray-outline-semibold.ttf")
