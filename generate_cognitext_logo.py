import math
from PIL import Image, ImageDraw, ImageFilter

def create_cognitext_logo():
    # 1. Write the crisp SVG
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff0056" />
      <stop offset="50%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#00d2ff" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff0056" />
      <stop offset="100%" stop-color="#00d2ff" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background squircle -->
  <rect x="24" y="24" width="464" height="464" rx="116" fill="url(#bgGrad)" stroke="rgba(255,255,255,0.14)" stroke-width="6" />

  <!-- Outer Neural Ring C -->
  <path d="M 360 160 C 330 110, 260 90, 200 110 C 130 135, 95 200, 95 256 C 95 312, 130 377, 200 402 C 260 422, 330 402, 360 352" 
        fill="none" 
        stroke="url(#brandGrad)" 
        stroke-width="36" 
        stroke-linecap="round" 
        filter="url(#glow)"/>

  <!-- Neural Synapse / Text Data Wave Lines -->
  <!-- Line 1 -->
  <line x1="200" y1="205" x2="340" y2="205" stroke="url(#textGrad)" stroke-width="22" stroke-linecap="round" />
  <circle cx="370" cy="205" r="10" fill="#00d2ff" />

  <!-- Line 2 -->
  <line x1="185" y1="256" x2="310" y2="256" stroke="#ffffff" stroke-width="20" stroke-linecap="round" opacity="0.95" />
  <circle cx="340" cy="256" r="10" fill="#a855f7" />

  <!-- Line 3 -->
  <line x1="200" y1="307" x2="280" y2="307" stroke="url(#textGrad)" stroke-width="22" stroke-linecap="round" />
  <circle cx="310" cy="307" r="10" fill="#ff0056" />

  <!-- Synaptic Spark Nodes -->
  <circle cx="360" cy="160" r="16" fill="#ff0056" />
  <circle cx="360" cy="352" r="16" fill="#00d2ff" />
</svg>'''

    with open('public/logo.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content)
    with open('public/favicon.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print("Created public/logo.svg and public/favicon.svg")

    # 2. Render pixel-perfect high-res PNG at 1024x1024 then downsample with Lanczos for super-crisp quality
    W, H = 1024, 1024
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw rounded squircle
    margin = 48
    radius = 232
    # Draw gradient-filled rounded rectangle
    for y in range(margin, H - margin):
        t = (y - margin) / float(H - 2 * margin)
        # Gradient from #0f172a (15, 23, 42) to #1e1b4b (30, 27, 75)
        r = int(15 + (30 - 15) * t)
        g = int(23 + (27 - 23) * t)
        b = int(42 + (75 - 42) * t)
        draw.line([(margin, y), (W - margin, y)], fill=(r, g, b, 255))

    # Create mask for rounded squircle
    mask = Image.new('L', (W, H), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([margin, margin, W - margin, H - margin], radius=radius, fill=255)
    
    # Apply mask
    bg_img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    bg_img.paste(img, (0, 0), mask)
    
    # Border
    draw_bg = ImageDraw.Draw(bg_img)
    draw_bg.rounded_rectangle([margin, margin, W - margin, H - margin], radius=radius, outline=(255, 255, 255, 45), width=12)

    # Draw "C" Neural Arc
    # Arc bounding box center: (512, 512)
    # Draw thick arc points
    cx, cy = 512, 512
    arc_pts = []
    # from angle 50 deg to 310 deg
    for deg in range(50, 311, 2):
        rad = math.radians(deg)
        # slightly elliptical
        rx = 270
        ry = 270
        px = cx - rx * math.cos(rad)
        py = cy - ry * math.sin(rad)
        arc_pts.append((px, py, deg))

    # Draw glow layer
    glow_img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    for i in range(len(arc_pts) - 1):
        p1 = arc_pts[i]
        p2 = arc_pts[i+1]
        t = (p1[2] - 50) / 260.0
        # Gradient #ff0056 (255, 0, 86) -> #a855f7 (168, 85, 247) -> #00d2ff (0, 210, 255)
        if t < 0.5:
            s = t * 2.0
            r = int(255 + (168 - 255) * s)
            g = int(0 + (85 - 0) * s)
            b = int(86 + (247 - 86) * s)
        else:
            s = (t - 0.5) * 2.0
            r = int(168 + (0 - 168) * s)
            g = int(85 + (210 - 85) * s)
            b = int(247 + (255 - 247) * s)
        glow_draw.line([(p1[0], p1[1]), (p2[0], p2[1])], fill=(r, g, b, 255), width=72)
    
    # Draw arc endpoints
    glow_draw.ellipse([arc_pts[0][0]-36, arc_pts[0][1]-36, arc_pts[0][0]+36, arc_pts[0][1]+36], fill=(255, 0, 86, 255))
    glow_draw.ellipse([arc_pts[-1][0]-36, arc_pts[-1][1]-36, arc_pts[-1][0]+36, arc_pts[-1][1]+36], fill=(0, 210, 255, 255))

    # Text / Synaptic Lines inside the "C"
    # Line 1: top
    glow_draw.rounded_rectangle([400, 410, 680, 454], radius=22, fill=(255, 0, 86, 255))
    glow_draw.ellipse([720, 410, 764, 454], fill=(0, 210, 255, 255))

    # Line 2: middle
    glow_draw.rounded_rectangle([370, 512 - 20, 620, 512 + 20], radius=20, fill=(240, 245, 255, 240))
    glow_draw.ellipse([660, 512 - 20, 700, 512 + 20], fill=(168, 85, 247, 255))

    # Line 3: bottom
    glow_draw.rounded_rectangle([400, 570, 560, 614], radius=22, fill=(0, 210, 255, 255))
    glow_draw.ellipse([600, 570, 644, 614], fill=(255, 0, 86, 255))

    # Composite glow and background
    final_img = Image.alpha_composite(bg_img, glow_img)

    # Save 512x512
    img512 = final_img.resize((512, 512), Image.Resampling.LANCZOS)
    img512.save('public/logo512.png', 'PNG')
    img512.save('public/logo.png', 'PNG')

    # Save 192x192
    img192 = final_img.resize((192, 192), Image.Resampling.LANCZOS)
    img192.save('public/logo192.png', 'PNG')

    # Save multi-size favicon.ico (16, 24, 32, 48, 64)
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64)]
    final_img.save('public/favicon.ico', format='ICO', sizes=ico_sizes)

    print("Successfully generated logo.png, logo192.png, logo512.png, and favicon.ico!")

if __name__ == '__main__':
    create_cognitext_logo()
