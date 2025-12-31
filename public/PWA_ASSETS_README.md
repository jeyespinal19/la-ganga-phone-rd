# PWA Assets Setup

## Quick Start

Since we don't have image processing libraries installed, you can generate PWA icons using online tools or manually.

### Option 1: Use Online Tool (Recommended)

1. **Go to**: https://realfavicongenerator.net/
2. **Upload**: The generated logo image from the artifacts folder
3. **Configure**: 
   - iOS: Use the logo with padding
   - Android: Use the logo without padding
   - Background color: `#050b14`
4. **Download** the generated package
5. **Extract** all files to `public/` folder

### Option 2: Manual Creation

Use the AI-generated logo image and resize it to these dimensions:

**Required Files:**
- `pwa-192x192.png` - 192x192 pixels
- `pwa-512x512.png` - 512x512 pixels  
- `apple-touch-icon.png` - 180x180 pixels
- `favicon.ico` - 32x32 pixels (can use https://favicon.io/favicon-converter/)

**Tools:**
- Photoshop, GIMP, or online tools
- https://www.iloveimg.com/resize-image
- https://favicon.io/

### Option 3: Use the SVG Logo

The `logo.svg` file in the `public/` folder can be used directly in some contexts. For better browser support, convert it to PNG using:
- https://svgtopng.com/
- Or any vector graphics editor (Inkscape, Illustrator)

## Verification

After adding the icons, verify they work:

1. **Start dev server**: `npm run dev`
2. **Open DevTools** → Application → Manifest
3. **Check** that all icons are listed and loading
4. **Test install** on mobile device

## Current Status

✅ Logo SVG created
✅ Masked icon SVG created
⏳ PNG icons need to be generated (use one of the options above)

## Files Needed

Place these in `public/` folder:
```
public/
├── logo.svg ✅
├── masked-icon.svg ✅
├── pwa-192x192.png ⏳
├── pwa-512x512.png ⏳
├── apple-touch-icon.png ⏳
└── favicon.ico ⏳
```
