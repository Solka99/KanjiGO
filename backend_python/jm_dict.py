from lxml import etree

def load_kanji_entries():
    tree = etree.parse("JMdict_e")
    root = tree.getroot()

    entries = []
    for entry in root.findall("entry"):
        kebs = entry.findall("k_ele/keb")
        rebs = entry.findall("r_ele/reb")
        glosses = entry.findall("sense/gloss")

        kanji = kebs[0].text if kebs else None
        reading = rebs[0].text if rebs else None
        meanings = [g.text for g in glosses]

        if kanji and meanings:
            entries.append({
                "kanji": kanji,
                "readings": reading,
                "meanings": meanings
            })

    return entries

# load_kanji_entries()