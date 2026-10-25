import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_nlp_architecture_diagram():
    # 2400 x 1350 for crisp 16:9 4K presentation slide
    W, H = 2400, 1350
    base_img = Image.new('RGBA', (W, H), (255, 255, 255, 255))
    draw = ImageDraw.Draw(base_img)

    # Subtle modern grid background
    grid_spacing = 60
    for x in range(0, W, grid_spacing):
        draw.line([(x, 0), (x, H)], fill=(244, 246, 250, 255), width=1)
    for y in range(0, H, grid_spacing):
        draw.line([(0, y), (W, y)], fill=(244, 246, 250, 255), width=1)

    # Top & Bottom soft radial glow
    glow_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    # Magenta glow top-left
    glow_draw.ellipse([-200, -200, 800, 800], fill=(255, 0, 86, 12))
    # Indigo glow bottom-right
    glow_draw.ellipse([W - 800, H - 800, W + 200, H + 200], fill=(99, 102, 241, 14))
    base_img = Image.alpha_composite(base_img, glow_layer)
    draw = ImageDraw.Draw(base_img)

    # Fonts
    font_dir = "C:/Windows/Fonts"
    font_bold = os.path.join(font_dir, "segoeuib.ttf")
    font_reg = os.path.join(font_dir, "segoeui.ttf")
    font_semi = os.path.join(font_dir, "segoeuisb.ttf") if os.path.exists(os.path.join(font_dir, "segoeuisb.ttf")) else font_bold

    title_font = ImageFont.truetype(font_bold, 54)
    subtitle_font = ImageFont.truetype(font_reg, 26)
    stage_num_font = ImageFont.truetype(font_bold, 18)
    card_title_font = ImageFont.truetype(font_bold, 28)
    bullet_font = ImageFont.truetype(font_reg, 21)
    bullet_bold_font = ImageFont.truetype(font_bold, 21)
    badge_font = ImageFont.truetype(font_bold, 18)
    footer_font = ImageFont.truetype(font_bold, 20)

    # 1. Header Section
    # Title
    title_text = "CogniText - Natural Language Processing (NLP) Pipeline Architecture"
    draw.text((100, 75), title_text, fill=(15, 23, 42, 255), font=title_font)

    # Subtitle
    sub_text = "Multi-Stage Unsupervised Semantic Summarization, Graph Centrality & Sentiment Scoring"
    draw.text((100, 145), sub_text, fill=(100, 116, 139, 255), font=subtitle_font)

    # Top right category badge
    badge_text = "CORE NLP SPECIFICATION"
    badge_w = 260
    badge_h = 44
    badge_x = W - 100 - badge_w
    badge_y = 90
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=22, fill=(15, 23, 42, 255))
    draw.text((badge_x + 36, badge_y + 11), badge_text, fill=(255, 255, 255, 255), font=badge_font)
    draw.ellipse([badge_x + 18, badge_y + 18, badge_x + 26, badge_y + 26], fill=(0, 229, 255, 255))

    # Divider line
    draw.line([(100, 195), (W - 100, 195)], fill=(226, 232, 240, 255), width=2)

    # 2. Pipeline Stages Definition
    stages = [
        {
            "num": "STAGE 01",
            "title": "Raw Input Ingestion",
            "accent": (239, 68, 68),      # Red/Coral
            "accent_bg": (254, 242, 242),
            "items": [
                ("YouTube Transcripts", "Timestamped caption segments from video ID"),
                ("Zoom Audio Logs", "Multi-speaker meeting transcripts & VTT"),
                ("Legal Documents", "NDAs, service contracts, policy text"),
                ("Format Normalization", "Unifying inputs into clean text streams")
            ],
            "badge": "INPUT DATA"
        },
        {
            "num": "STAGE 02",
            "title": "Text Preprocessing",
            "accent": (59, 130, 246),     # Blue
            "accent_bg": (239, 246, 255),
            "items": [
                ("Sentence Tokenization", "Splitting streams into discrete clauses"),
                ("Word Tokenization", "Regex whitespace & punctuation cleanup"),
                ("Stopword Filtering", "Removing high-frequency syntax noise"),
                ("WordNet Lemmatization", "Mapping inflections to root lexemes")
            ],
            "badge": "NLTK + PYTHON"
        },
        {
            "num": "STAGE 03",
            "title": "TextRank Graph",
            "accent": (255, 0, 86),       # Brand Magenta
            "accent_bg": (255, 241, 242),
            "items": [
                ("Similarity Matrix", "Pairwise sentence cosine overlap"),
                ("Weighted Graph Nodes", "Connecting sentences by lexical affinity"),
                ("PageRank Convergence", "Iterative score propagation across graph"),
                ("Centrality Ranking", "Identifying top informative sentences")
            ],
            "badge": "ALGORITHM"
        },
        {
            "num": "STAGE 04",
            "title": "Semantic Analysis",
            "accent": (16, 185, 129),     # Emerald
            "accent_bg": (236, 253, 245),
            "items": [
                ("VADER Sentiment", "Compound, pos, neu, neg valence scoring"),
                ("Emotional Trajectory", "Mapping sentiment shifts over time"),
                ("Flesch Reading Ease", "Syllable & sentence length scoring"),
                ("Grade-Level Index", "Flesch-Kincaid complexity assessment")
            ],
            "badge": "SCORING ENGINE"
        },
        {
            "num": "STAGE 05",
            "title": "Structured Outputs",
            "accent": (139, 92, 246),     # Purple
            "accent_bg": (245, 243, 255),
            "items": [
                ("Extractive Summaries", "Top-ranked non-redundant takeaways"),
                ("Concept Flashcards", "Automated study items & questions"),
                ("Legal Risk Matrix", "Clause liability & compliance flags"),
                ("Export Formats", "Structured Markdown & Text reports")
            ],
            "badge": "DELIVERABLES"
        }
    ]

    # Layout dimensions
    start_x = 100
    total_w = W - 200
    num_stages = len(stages)
    arrow_w = 48
    total_arrow_space = (num_stages - 1) * arrow_w
    card_w = int((total_w - total_arrow_space) / num_stages)
    card_y = 240
    card_h = 920

    # Draw Shadows and Cards
    for i, s in enumerate(stages):
        cx = start_x + i * (card_w + arrow_w)
        cy = card_y

        # Soft drop shadow
        shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shadow)
        s_draw.rounded_rectangle([cx + 6, cy + 14, cx + card_w + 6, cy + card_h + 14], radius=24, fill=(15, 23, 42, 16))
        shadow = shadow.filter(ImageFilter.GaussianBlur(12))
        base_img = Image.alpha_composite(base_img, shadow)

    draw = ImageDraw.Draw(base_img)

    for i, s in enumerate(stages):
        cx = start_x + i * (card_w + arrow_w)
        cy = card_y

        # Card Background
        draw.rounded_rectangle([cx, cy, cx + card_w, cy + card_h], radius=24, fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=2)

        # Top Accent Ribbon
        draw.rounded_rectangle([cx + 30, cy, cx + card_w - 30, cy + 6], radius=3, fill=s["accent"])

        # Stage Number Pill
        pill_w = 110
        pill_h = 32
        draw.rounded_rectangle([cx + 28, cy + 32, cx + 28 + pill_w, cy + 32 + pill_h], radius=16, fill=s["accent_bg"])
        draw.text((cx + 42, cy + 37), s["num"], fill=s["accent"], font=stage_num_font)

        # Card Title
        draw.text((cx + 28, cy + 80), s["title"], fill=(15, 23, 42, 255), font=card_title_font)

        # Subtle divider
        draw.line([(cx + 28, cy + 130), (cx + card_w - 28, cy + 130)], fill=(241, 245, 249, 255), width=2)

        # Items list
        item_y = cy + 155
        item_spacing = 150

        for title, desc in s["items"]:
            # Bullet card container
            box_h = 126
            draw.rounded_rectangle([cx + 20, item_y, cx + card_w - 20, item_y + box_h], radius=14, fill=(248, 250, 252, 255), outline=(238, 242, 246, 255), width=1)
            
            # Left accent bar on item box
            draw.rounded_rectangle([cx + 20, item_y + 12, cx + 24, item_y + box_h - 12], radius=2, fill=s["accent"])

            # Item title
            draw.text((cx + 36, item_y + 16), title, fill=(15, 23, 42, 255), font=bullet_bold_font)

            # Item description (wrapped)
            desc_lines = []
            words = desc.split()
            current_line = []
            for w in words:
                test_line = " ".join(current_line + [w])
                if len(test_line) > 28:
                    desc_lines.append(" ".join(current_line))
                    current_line = [w]
                else:
                    current_line.append(w)
            if current_line:
                desc_lines.append(" ".join(current_line))

            for l_idx, line in enumerate(desc_lines[:3]):
                draw.text((cx + 36, item_y + 50 + l_idx * 26), line, fill=(100, 116, 139, 255), font=bullet_font)

            item_y += item_spacing

        # Bottom badge
        b_box_y = cy + card_h - 70
        b_w = card_w - 56
        draw.rounded_rectangle([cx + 28, b_box_y, cx + 28 + b_w, b_box_y + 44], radius=12, fill=s["accent_bg"], outline=s["accent"], width=1)
        
        # Center badge text
        draw.text((cx + card_w // 2 - len(s["badge"]) * 5.5, b_box_y + 12), s["badge"], fill=s["accent"], font=badge_font)

        # 3. Clean, Straight, Perfectly Centered Arrow to the next stage
        if i < num_stages - 1:
            arrow_start_x = cx + card_w + 6
            arrow_end_x = cx + card_w + arrow_w - 6
            arrow_mid_y = cy + card_h // 2

            # Arrow Shaft (Clean horizontal line)
            draw.line([(arrow_start_x, arrow_mid_y), (arrow_end_x - 12, arrow_mid_y)], fill=(15, 23, 42, 255), width=5)

            # Arrow Head (Sharp, perfectly symmetric triangle)
            head_pts = [
                (arrow_end_x, arrow_mid_y),
                (arrow_end_x - 16, arrow_mid_y - 12),
                (arrow_end_x - 16, arrow_mid_y + 12)
            ]
            draw.polygon(head_pts, fill=(15, 23, 42, 255))

            # Small circle at arrow origin
            draw.ellipse([arrow_start_x - 4, arrow_mid_y - 4, arrow_start_x + 4, arrow_mid_y + 4], fill=(15, 23, 42, 255))

    # 4. Footer Section
    foot_y = H - 85
    draw.line([(100, foot_y - 25), (W - 100, foot_y - 25)], fill=(226, 232, 240, 255), width=1)
    draw.text((100, foot_y), "CogniText Technical Architecture • Pure Natural Language Processing Pipeline", fill=(71, 85, 105, 255), font=footer_font)
    right_foot = "STAGES: INGESTION -> PREPROCESSING -> TEXTRANK -> ANALYSIS -> OUTPUT"
    draw.text((W - 100 - 820, foot_y), right_foot, fill=(15, 23, 42, 255), font=footer_font)

    # Save to public and repo
    out_png = 'public/cognitext_nlp_architecture.png'
    out_jpg = 'public/cognitext_nlp_architecture.jpg'
    base_img.save(out_png, 'PNG', quality=100)
    base_img.convert('RGB').save(out_jpg, 'JPEG', quality=95)
    
    # Also overwrite the main diagram
    base_img.save('public/cognitext_architecture_diagram.png', 'PNG', quality=100)
    base_img.convert('RGB').save('public/cognitext_architecture_diagram.jpg', 'JPEG', quality=95)

    print("Successfully generated pixel-perfect NLP Architecture Diagram!")

if __name__ == '__main__':
    create_nlp_architecture_diagram()
