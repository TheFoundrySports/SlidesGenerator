#!/usr/bin/env python3
"""Generate catechism deck HTML: cleaned image as background + text overlay
positioned using OCR bounding boxes scaled to 1920×1080 canvas."""
from pathlib import Path
import json
import re

OCR_DIR  = Path("slides/ocr")
BBOX_DIR = Path("slides/bbox")
OUT_HTML = Path("catechism-deck-dios-padre-creador.html")

CANVAS_W, CANVAS_H = 1920, 1080

# ── slide-by-slide plan: (id, label, kind, raw_ocr_groups) ───────────
# Each "group" is a logical block of text. We choose structure manually
# based on inspection of the OCR txt + bbox geometry per slide.

# Slide 01 — Title (centered, large + subtitle)
# Slide 02 — Title top, body in 2 columns (categories + paragraph)
# Slide 03 — Title + paragraph + 3 bullets
# Slide 04 — Title + 2 boxes ("Es Misterio", "Es Verdad y Amor") with content
# Slide 06 — Title + 3 boxes short (Universal / 3 frases)
# Slide 07 — Title + 3 boxes (La Nada / Obra Trinitaria / El Cosmos)
# Slide 08 — Title + body + 2 boxes + quote (San Ireneo)
# Slide 09 — Title + 2 boxes (Lo que NO es / Lo que SÍ es)
# Slide 10 — Title + 2 quote blocks
# Slide 11 — Title + body + path diagram (A → B)
# Slide 12 — Title + 3 stacked blocks
# Slide 13 — Title + 2 body paragraphs
# Slide 14 — Title + 2 boxes (Causa Primera / Causas Segundas)
# Slide 15 — Title + intro + 2 numbered points
# Slide 16 — Title + 3 paragraphs (left / center / right)
# Slide 17 — Title + 6 hex labels arranged in a wheel
# Slide 18 — Title + body + "Amén."

# We'll generate HTML per slide with structure encoded manually. Each
# text block has (text, x%, y%, w%, align, size-tier, italic, weight).
# Positions are % of canvas.

def esc(s):
    return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

def block(text, x, y, w, *, size=28, weight=400, italic=False, align="left",
          family="body", color="fg", kicker=None, leading=1.4, max_w=None,
          margin_top=0):
    font = {"display": "var(--font-display)", "body": "var(--font-body)",
            "mono":   "var(--font-mono)"}[family]
    style = (
        f"position:absolute;"
        f"left:{x:.2f}%;top:{y:.2f}%;width:{w:.2f}%;"
        f"font-family:{font};font-size:{size}px;font-weight:{weight};"
        f"{'font-style:italic;' if italic else ''}"
        f"line-height:{leading};text-align:{align};color:var(--{color});"
        f"margin-top:{margin_top}px;"
    )
    if max_w:
        style += f"max-width:{max_w}px;"
    inner = ""
    if kicker:
        inner += f'<p class="kicker" style="font-family:var(--font-mono);font-size:14px;font-weight:500;letter-spacing:0.30em;text-transform:uppercase;color:var(--muted);margin:0 0 28px;">{esc(kicker)}</p>'
    for i, line in enumerate(text):
        if i > 0:
            inner += "<br>"
        inner += esc(line)
    return f'<div class="t-block" style="{style}">{inner}</div>'

# ─── Per-slide structure (manually authored from OCR) ──────────────
SLIDES = []

# 01 — Title: DIOS PADRE + subtitle
SLIDES.append({
  "id": "01", "label": "Dios Padre",
  "img": "slides/img/cleaned/slide-01.png",
  "blocks": [
    block(["DIOS PADRE"], 16, 38, 68, size=160, weight=500, align="center",
          family="display", leading=1.0),
    block(["El Misterio, la Creación y la Providencia"], 16, 60, 68,
          size=44, italic=True, align="center", family="display",
          color="muted", leading=1.3),
  ],
})

# 02 — Title + 3 small labels (Sacramentos/Mandamientos/Moral Cristiana) + body
SLIDES.append({
  "id": "02", "label": "Creo en Dios",
  "img": "slides/img/cleaned/slide-02.png",
  "blocks": [
    block(["Creo en Dios"],  8, 11, 84, size=78, weight=500, align="center",
          family="display"),
    block(["Sacramentos"],  20, 28, 20, size=26, italic=True, align="center",
          family="display", color="muted"),
    block(["Mandamientos"], 40, 28, 20, size=26, italic=True, align="center",
          family="display", color="muted"),
    block(["Moral Cristiana"], 60, 28, 20, size=26, italic=True, align="center",
          family="display", color="muted"),
    block(["Es la afirmación más importante. La fuente de todas las demás "
           "verdades sobre el hombre y sobre el mundo y de toda la vida del "
           "que cree en Dios. Profesamos un solo Dios porque él se ha "
           "revelado al pueblo de Israel como el único."],
          16, 48, 68, size=30, family="body", leading=1.55, align="center"),
  ],
})

# 03 — El Symbolon (title + intro paragraph + 3 bullets)
SLIDES.append({
  "id": "03", "label": "El Symbolon: Nuestro Lenguaje Común",
  "img": "slides/img/cleaned/slide-03.png",
  "blocks": [
    block(["El «Symbolon»"], 8, 9, 84, size=68, weight=500, align="center",
          family="display"),
    block(["Nuestro Lenguaje Común"], 8, 18, 84, size=42, italic=True,
          align="center", family="display", color="muted"),
    block(["La palabra griega symbolon significaba la mitad de un objeto "
           "partido (como un sello) que se presentaba como una señal para "
           "darse a conocer. Las partes rotas se ponían juntas para "
           "verificar una identidad."],
          16, 34, 68, size=26, family="body", leading=1.55, align="center",
          italic=True, color="muted"),
    block(["• El Credo es nuestro signo de identificación.",
           "• Resume la fe apostólica y sus verdades principales.",
           "• Nos une y ensambla en una sola comunión."],
          28, 60, 44, size=28, family="body", leading=1.65),
  ],
})

# 04 — El nombre de Dios (title + 2 columns)
SLIDES.append({
  "id": "04", "label": "El nombre de Dios: «Yo soy el que soy»",
  "img": "slides/img/cleaned/slide-04.png",
  "blocks": [
    block(["El nombre de Dios:"], 8, 7, 84, size=58, weight=500, align="center",
          family="display"),
    block(["«Yo soy el que soy»"], 8, 14, 84, size=42, italic=True,
          align="center", family="display", color="muted"),
    block(["Es Misterio"], 6, 30, 42, size=34, weight=500, align="center",
          family="display", color="gold"),
    block(["«El que es», sin origen y sin fin, desde siempre y por siempre. "
           "Él transciende el mundo y la historia. Dios es misterio, "
           "infinitamente por encima de todo lo que podemos comprender o "
           "decir.", "YHWH"],
          6, 36, 42, size=22, family="body", leading=1.5, align="center"),
    block(["Es Verdad y Amor"], 52, 30, 42, size=34, weight=500, align="center",
          family="display", color="gold"),
    block(["Dios es la Verdad misma, ni se engaña ni puede engañar.",
           "«Dios es Luz, en él no hay tiniebla alguna» (1 Jn 1, 5).",
           "«Dios es amor» (1 Jn 4, 8.16).",
           "«Él es rico en amor y fidelidad» (Ex 34, 6)."],
          52, 36, 42, size=22, family="body", leading=1.55, align="center"),
  ],
})

# 05 — blank
SLIDES.append({
  "id": "05", "label": "(slide omitida)",
  "img": None,
  "blank_caption": "Slide omitida en el PowerPoint original.",
})

# 06 — La Omnipotencia (title + 3 boxes)
SLIDES.append({
  "id": "06", "label": "La Omnipotencia de Dios",
  "img": "slides/img/cleaned/slide-06.png",
  "blocks": [
    block(["La Omnipotencia de Dios"], 8, 9, 84, size=68, weight=500,
          align="center", family="display"),
    block(["Universal"], 8, 22, 84, size=42, italic=True, align="center",
          family="display", color="gold"),
    block(["Dios creó todo,", "rige todo,", "lo puede todo."],
          8, 40, 84, size=52, family="display", align="center",
          leading=1.25, weight=500),
  ],
})

# 07 — Dios Creador Ex Nihilo (title + 3 boxes)
SLIDES.append({
  "id": "07", "label": "Dios Creador Ex Nihilo",
  "img": "slides/img/cleaned/slide-07.png",
  "blocks": [
    block(["Dios Creador"], 8, 7, 84, size=64, weight=500, align="center",
          family="display"),
    block(["Ex Nihilo"], 8, 14, 84, size=42, italic=True, align="center",
          family="display", color="gold"),
    block(["La Nada"],  6, 30, 28, size=30, weight=500, align="center",
          family="display", color="gold"),
    block(["De la nada. Dios crea a partir de la nada absoluta. "
           "No requiere materia preexistente."],
          6, 36, 28, size=20, family="body", leading=1.45, align="center"),
    block(["Obra Trinitaria"], 36, 30, 28, size=30, weight=500, align="center",
          family="display", color="gold"),
    block(["La creación es obra conjunta del Padre (por su Palabra, el "
           "Hijo) en el Espíritu (Dador de vida)."],
          36, 36, 28, size=20, family="body", leading=1.45, align="center"),
    block(["El Cosmos"], 66, 30, 28, size=30, weight=500, align="center",
          family="display", color="gold"),
    block(["Libre Voluntad. Dios no creó por necesidad ni por soledad. La "
           "Trinidad ya era perfectamente feliz. Crea por pura sabiduría y "
           "amor desbordante."],
          66, 36, 28, size=20, family="body", leading=1.45, align="center"),
  ],
})

# 08 — La Creación: Trinidad (title + body + 2 boxes + quote)
SLIDES.append({
  "id": "08", "label": "La Creación: Obra Común de la Trinidad",
  "img": "slides/img/cleaned/slide-08.png",
  "blocks": [
    block(["La Creación:"], 8, 8, 84, size=58, weight=500, align="center",
          family="display"),
    block(["Obra Común de la Trinidad"], 8, 15, 84, size=38, italic=True,
          align="center", family="display", color="muted"),
    block(["Aunque atribuimos la creación al Padre, es el principio único "
           "e indivisible de las tres Personas."],
          14, 28, 72, size=22, italic=True, family="body", align="center",
          color="muted", leading=1.45),
    block(["El Padre", "Crea por medio de"], 6, 42, 28, size=24, weight=500,
          align="center", family="display", leading=1.4),
    block(["El Verbo (Hijo)", "crea por medio de"], 36, 42, 28, size=24,
          weight=500, align="center", family="display", leading=1.4),
    block(["El Aliento (Espíritu Santo)", "vivifica por"], 66, 42, 28,
          size=24, weight=500, align="center", family="display", leading=1.4),
    block(["La Creación"], 8, 70, 84, size=44, weight=500, align="center",
          family="display", color="gold"),
    block(["«El Hijo y el Espíritu son como las manos del Padre»."],
          14, 80, 72, size=28, italic=True, family="display", align="center",
          color="muted"),
    block(["— San Ireneo"], 14, 87, 72, size=20, family="body", align="center",
          color="muted"),
  ],
})

# 09 — ¿Por qué y cómo creó Dios? (2 boxes)
SLIDES.append({
  "id": "09", "label": "¿Por qué y cómo creó Dios?",
  "img": "slides/img/cleaned/slide-09.png",
  "blocks": [
    block(["¿Por qué y cómo creó Dios?"], 8, 9, 84, size=58, weight=500,
          align="center", family="display"),
    block(["La Creación"], 8, 19, 84, size=34, italic=True, align="center",
          family="display", color="muted"),
    block(["Lo que NO es"], 8, 32, 40, size=34, weight=500, align="center",
          family="display", color="gold"),
    block(["Fruto del azar, de un destino ciego, o de una necesidad. Dios "
           "no necesitaba crear para ser plenamente feliz."],
          8, 40, 40, size=22, family="body", leading=1.5, align="center"),
    block(["Lo que SÍ es"], 52, 32, 40, size=34, weight=500, align="center",
          family="display", color="gold"),
    block(["Creado libremente por sabiduría y puro amor.",
           "Creado Ex Nihilo, de la absoluta nada, sin materia preexistente."],
          52, 40, 40, size=22, family="body", leading=1.55, align="center"),
  ],
})

# 10 — El propósito de la Creación (2 quotes)
SLIDES.append({
  "id": "10", "label": "El Propósito de la Creación",
  "img": "slides/img/cleaned/slide-10.png",
  "blocks": [
    block(["El Propósito de la Creación"], 8, 9, 84, size=64, weight=500,
          align="center", family="display"),
    block(["«El mundo ha sido creado para la gloria de Dios… no para "
           "aumentarla, sino para manifestarla y comunicarla.»"],
          10, 32, 80, size=36, italic=True, family="display", align="center",
          leading=1.3, color="fg"),
    block(["— San Buenaventura"], 10, 52, 80, size=20, family="body",
          align="center", color="muted"),
    block(["«La gloria de Dios es que el hombre viva, y la vida del hombre "
           "es la visión de Dios.»"],
          10, 64, 80, size=36, italic=True, family="display", align="center",
          leading=1.3, color="fg"),
    block(["— San Ireneo"], 10, 84, 80, size=20, family="body",
          align="center", color="muted"),
  ],
})

# 11 — La Divina Providencia y el Estado de Vía
SLIDES.append({
  "id": "11", "label": "La Divina Providencia y el Estado de Vía",
  "img": "slides/img/cleaned/slide-11.png",
  "blocks": [
    block(["La Divina Providencia"], 8, 8, 84, size=58, weight=500,
          align="center", family="display"),
    block(["y el Estado de Vía"], 8, 15, 84, size=36, italic=True,
          align="center", family="display", color="muted"),
    block(["Punto B · Perfección Última"], 8, 28, 84, size=28, weight=500,
          align="center", family="display", color="gold"),
    block(["El destino final en Dios (la Gloria)."], 8, 35, 84, size=22,
          italic=True, family="body", align="center", color="muted"),
    block(["Estado de Vía"], 8, 48, 84, size=28, weight=500, align="center",
          family="display", color="gold"),
    block(["La creación está en camino, guiada por la Divina Providencia: "
           "las disposiciones por las que Dios conduce su obra."],
          12, 55, 76, size=22, family="body", align="center", leading=1.5),
    block(["Punto A · Creación Original"], 8, 72, 84, size=28, weight=500,
          align="center", family="display", color="gold"),
    block(["El mundo salió de las manos de Dios bueno, pero no perfectamente "
           "acabado."], 12, 79, 76, size=22, italic=True, family="body",
          align="center", color="muted"),
  ],
})

# 12 — Una Creación en Camino (3 stacked blocks)
SLIDES.append({
  "id": "12", "label": "Una Creación en Camino",
  "img": "slides/img/cleaned/slide-12.png",
  "blocks": [
    block(["Una Creación en Camino"], 8, 9, 84, size=64, weight=500,
          align="center", family="display"),
    block(["Perfección Última"], 8, 22, 84, size=32, weight=500, align="center",
          family="display", color="gold"),
    block(["El destino final hacia el que Dios guía y destina a toda la "
           "obra creada."], 16, 29, 68, size=22, italic=True, family="body",
          align="center", color="muted", leading=1.5),
    block(["Estado de Vía"], 8, 46, 84, size=32, weight=500, align="center",
          family="display", color="gold"),
    block(["La creación se encuentra en camino, en un estado de progresión "
           "temporal."], 16, 53, 68, size=22, italic=True, family="body",
          align="center", color="muted", leading=1.5),
    block(["Creación Buena (pero no terminada)"], 8, 70, 84, size=32,
          weight=500, align="center", family="display", color="gold"),
    block(["El mundo es maravillosamente bueno, pero no salió plenamente "
           "acabado de las manos de Dios."], 16, 77, 68, size=22,
          italic=True, family="body", align="center", color="muted",
          leading=1.5),
  ],
})

# 13 — La Divina Providencia (single body)
SLIDES.append({
  "id": "13", "label": "La Divina Providencia",
  "img": "slides/img/cleaned/slide-13.png",
  "blocks": [
    block(["La Divina Providencia"], 8, 10, 84, size=68, weight=500,
          align="center", family="display"),
    block(["Llamamos providencia a las disposiciones por las que Dios "
           "conduce con sabiduría y amor la obra de su creación hacia su "
           "perfección última."], 16, 32, 68, size=30, family="body",
          align="center", leading=1.55),
    block(["Dios no solo da la existencia; Él mantiene y sostiene a sus "
           "criaturas a cada instante por medio de su Verbo."],
          16, 60, 68, size=30, family="body", align="center", leading=1.55),
  ],
})

# 14 — La Dignidad de Nuestra Libertad (2 boxes)
SLIDES.append({
  "id": "14", "label": "La Dignidad de Nuestra Libertad",
  "img": "slides/img/cleaned/slide-14.png",
  "blocks": [
    block(["La Dignidad de Nuestra Libertad"], 8, 9, 84, size=58,
          weight=500, align="center", family="display"),
    block(["Causa Primera: Dios"], 8, 24, 40, size=32, weight=500,
          align="center", family="display", color="gold"),
    block(["El origen absoluto y mantenedor de todo lo que existe.",
           "Dios no crea todo directamente de una sola vez; delega la acción "
           "a sus criaturas."], 8, 32, 40, size=22, family="body",
          align="center", leading=1.5),
    block(["Causas Segundas: Nosotros"], 52, 24, 40, size=32, weight=500,
          align="center", family="display", color="gold"),
    block(["Criaturas inteligentes y libres. Dios nos otorga la inmensa "
           "dignidad de actuar por nosotros mismos — procrear, hacer el "
           "bien, evangelizar — para completar libremente la obra de la "
           "creación."], 52, 32, 40, size=22, family="body", align="center",
          leading=1.5),
  ],
})

# 15 — El Escándalo del Mal (intro + 2 numbered points)
SLIDES.append({
  "id": "15", "label": "El Escándalo del Mal",
  "img": "slides/img/cleaned/slide-15.png",
  "blocks": [
    block(["El Escándalo del Mal"], 8, 9, 84, size=68, weight=500,
          align="center", family="display"),
    block(["Si Dios es Todopoderoso y Bueno, ¿por qué existe el mal?"],
          10, 21, 80, size=34, italic=True, align="center", family="display",
          color="muted", leading=1.3),
    block(["I."], 10, 36, 80, size=30, weight=500, family="display",
          color="gold", align="left"),
    block(["Dios no creó un mundo estático y perfectamente cerrado; lo "
           "creó en estado de vía."], 14, 36, 76, size=24, family="body",
          leading=1.55, margin_top=42),
    block(["II."], 10, 60, 80, size=30, weight=500, family="display",
          color="gold", align="left"),
    block(["Al darnos el don de la libertad real (ser causas segundas), "
           "existe inherentemente la posibilidad de desviarse, y por tanto, "
           "la posibilidad del mal."], 14, 60, 76, size=24, family="body",
          leading=1.55, margin_top=42),
  ],
})

# 16 — La Sabiduría Infinita de Dios (left + right columns)
SLIDES.append({
  "id": "16", "label": "La Sabiduría Infinita de Dios",
  "img": "slides/img/cleaned/slide-16.png",
  "blocks": [
    block(["La Sabiduría Infinita de Dios"], 8, 9, 84, size=58, weight=500,
          align="center", family="display"),
    block(["En su poder infinito,", "Dios podría haber", "creado un mundo "
           "sin mal.", "Pero en su bondad", "prefirió un mundo", "libre en "
           "vías de perfección."],
          6, 28, 44, size=28, family="display", align="center",
          leading=1.4, weight=500),
    block(["San Agustín enseña que Dios nunca permitiría el mal si no fuera "
           "lo suficientemente omnipotente y bueno para sacar de ese mismo "
           "mal un bien mayor."], 52, 28, 42, size=26, italic=True,
          family="body", align="center", leading=1.55, color="muted"),
  ],
})

# 17 — El Gran Designio (wheel of 6 hex labels)
SLIDES.append({
  "id": "17", "label": "El Gran Designio: Síntesis del Plan del Padre",
  "img": "slides/img/cleaned/slide-17.png",
  "blocks": [
    block(["El Gran Designio"], 8, 8, 84, size=58, weight=500, align="center",
          family="display"),
    block(["Síntesis del Plan del Padre"], 8, 16, 84, size=34, italic=True,
          align="center", family="display", color="muted"),
    block(["El Credo", "(Nuestra Fe Común)"], 8, 32, 28, size=22,
          weight=500, align="center", family="display", leading=1.3),
    block(["La Trinidad", "(El Dios Amor)"], 36, 32, 28, size=22,
          weight=500, align="center", family="display", leading=1.3),
    block(["La Gloria Eterna", "(Nuestro Destino)"], 64, 32, 28, size=22,
          weight=500, align="center", family="display", leading=1.3),
    block(["Providencia", "(El Guía en el Camino)"], 8, 60, 28, size=22,
          weight=500, align="center", family="display", leading=1.3,
          color="gold"),
    block(["Creación Ex Nihilo", "(El Origen)"], 36, 60, 28, size=22,
          weight=500, align="center", family="display", leading=1.3,
          color="gold"),
    block(["Causas Segundas", "(Nuestra Libertad)"], 64, 60, 28, size=22,
          weight=500, align="center", family="display", leading=1.3,
          color="gold"),
  ],
})

# 18 — Creer en Dios Padre (closing)
SLIDES.append({
  "id": "18", "label": "Creer en Dios Padre",
  "img": "slides/img/cleaned/slide-18.png",
  "blocks": [
    block(["Creer en Dios Padre"], 8, 12, 84, size=68, weight=500,
          align="center", family="display"),
    block(["Es confiar profundamente en que nuestra existencia no es "
           "producto del azar, sino un diseño amoroso sostenido por una "
           "Providencia que, paso a paso, nos guía a casa."],
          16, 38, 68, size=34, italic=True, family="display", align="center",
          leading=1.4),
    block(["Amén."], 8, 76, 84, size=96, weight=500, align="center",
          family="display", color="fg"),
  ],
})

# ── Emit HTML ──────────────────────────────────────────────────────
HTML = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dios Padre Creador · Curso de Catequesis</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --bg: oklch(94% 0.022 80);
  --surface: oklch(96% 0.018 80);
  --fg: oklch(28% 0.085 25);
  --muted: oklch(48% 0.045 35);
  --border: oklch(82% 0.035 75);
  --accent: oklch(34% 0.095 25);
  --gold: oklch(60% 0.062 75);
  --font-display: "Cormorant Garamond", "EB Garamond", "Iowan Old Style", Georgia, serif;
  --font-body: "EB Garamond", "Iowan Old Style", Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, "IBM Plex Mono", Menlo, monospace;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
html { background: var(--bg); }
body {
  width: 100vw; height: 100vh; overflow: hidden;
  display: grid; place-items: center;
  background: var(--bg); color: var(--fg);
  font-family: var(--font-body); font-size: 22px; line-height: 1.5;
}
.stage {
  width: 1920px; height: 1080px;
  transform: scale(var(--scale, 1));
  transform-origin: center center;
  position: relative;
  background: var(--bg);
  flex-shrink: 0;
  overflow: hidden;
}
.slide {
  position: absolute; inset: 0; display: none;
  background-size: cover; background-position: center;
}
.slide.is-active { display: block; }
.slide-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  -webkit-user-drag: none; user-select: none;
  z-index: 0;
}
.slide-content {
  position: absolute; inset: 0;
  z-index: 1;
  pointer-events: none;
}
.slide--blank.is-active {
  display: flex; align-items: center; justify-content: center;
  text-align: center; background: var(--bg);
}
.slide--blank .blank-mark {
  font-family: var(--font-display); font-weight: 500;
  font-size: 96px; color: var(--muted); letter-spacing: 0.04em;
}
.slide--blank .blank-caption {
  font-family: var(--font-display); font-style: italic;
  font-size: 28px; color: var(--muted);
  margin-top: 24px; max-width: 720px; line-height: 1.4;
}
.counter {
  position: absolute; bottom: 32px; left: 48px;
  font-family: var(--font-mono); font-size: 13px;
  letter-spacing: 0.18em; color: var(--muted);
  z-index: 100;
  background: color-mix(in oklab, var(--bg), transparent 25%);
  padding: 6px 14px; border-radius: 4px;
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
}
.counter-sep { opacity: 0.4; padding: 0 6px; }
.help {
  position: absolute; bottom: 32px; right: 48px;
  font-family: var(--font-mono); font-size: 12px;
  letter-spacing: 0.10em; color: var(--muted);
  z-index: 100;
  background: color-mix(in oklab, var(--bg), transparent 25%);
  padding: 6px 14px; border-radius: 4px;
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
}
.help kbd {
  display: inline-block; font-family: var(--font-mono); font-size: 11px;
  padding: 1px 6px; border: 1px solid var(--border); border-radius: 3px;
  background: var(--surface); color: var(--muted); margin: 0 1px;
}
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
</style>
</head>
<body>
<div class="stage" id="stage">
__SECTIONS__
</div>
<div class="counter" aria-live="polite">
  <span id="cNow">01</span><span class="counter-sep">/</span><span id="cTotal">__TOTAL__</span>
</div>
<div class="help" aria-hidden="true">
  <kbd>←</kbd> <kbd>→</kbd> navegar · <kbd>Inicio</kbd> <kbd>Fin</kbd> extremos
</div>
<script>
(function() {
  'use strict';
  const STORAGE_KEY = 'catechism-deck-pos-v2';
  const stage = document.getElementById('stage');
  const slides = Array.from(stage.querySelectorAll('.slide'));
  const total = slides.length;
  const cNow = document.getElementById('cNow');
  const cTotal = document.getElementById('cTotal');
  cTotal.textContent = String(total).padStart(2, '0');

  function fit() {
    const vw = window.innerWidth, vh = window.innerHeight;
    stage.style.setProperty('--scale', Math.min(vw/1920, vh/1080));
  }
  fit();
  window.addEventListener('resize', fit);

  function show(idx) {
    if (idx < 0) idx = 0;
    if (idx >= total) idx = total - 1;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    cNow.textContent = String(idx + 1).padStart(2, '0');
    try { sessionStorage.setItem(STORAGE_KEY, String(idx)); } catch (e) {}
  }

  let pos = 0;
  try { pos = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0', 10) || 0; } catch (e) {}
  show(pos);

  document.addEventListener('keydown', function(e) {
    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        show(pos + 1); e.preventDefault(); break;
      case 'ArrowLeft':
      case 'PageUp':
        show(pos - 1); e.preventDefault(); break;
      case 'Home':
        show(0); e.preventDefault(); break;
      case 'End':
        show(total - 1); e.preventDefault(); break;
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9': {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= total) show(n - 1);
        e.preventDefault();
        break;
      }
    }
  });
})();
</script>
</body>
</html>
"""

sections = []
for s in SLIDES:
    active_cls = " is-active" if s["id"] == "01" else ""
    if s.get("img") is None:
        sections.append(f'''  <section class="slide slide--blank{active_cls}" data-screen-label="{s["id"]} · {esc(s["label"])}">
    <div>
      <div class="blank-mark">·</div>
      <p class="blank-caption">{esc(s["blank_caption"])}</p>
    </div>
  </section>''')
    else:
        blocks_html = "\n      ".join(s["blocks"])
        sections.append(f'''  <section class="slide{active_cls}" data-screen-label="{s["id"]} · {esc(s["label"])}">
    <img class="slide-img" src="{s["img"]}" alt="" loading="lazy" decoding="async">
    <div class="slide-content">
      {blocks_html}
    </div>
  </section>''')

final = (HTML
  .replace("__SECTIONS__", "\n".join(sections))
  .replace("__TOTAL__", str(len(SLIDES)).zfill(2)))

OUT_HTML.write_text(final, encoding="utf-8")
print(f"wrote {OUT_HTML}: {len(final):,} bytes, {len(SLIDES)} slides")
