import pandas as pd
import re 
from fastapi import APIRouter

router = APIRouter()

@router.get("/example_sentences/{kanji}")
async def get_kanji_data(kanji: str):
    sentences_df=filter_sentences_with_kanji(kanji)
    return sentences_df

@router.get("/example_sentences_singular/{kanji}")
async def get_singular_kanji_data(kanji: str):
    sentences_df=filter_sentences_with_singular_kanji(kanji)
    return sentences_df



def create_df_from_file():
    file_path = "api/tatoeba_corpus/Sentence_pairs.tsv"

    df = pd.read_csv(file_path, sep='\t', header=None, encoding='utf-8')

    df.columns = ['jpn_id', 'japanese', 'eng_id', 'english']

    df['japanese'] = df['japanese'].astype(str)
    return df

def filter_sentences_with_kanji(target_kanji: str):

    df=create_df_from_file()


    filtered = df[df['japanese'].str.contains(target_kanji, na=False)]


    # filtered[['japanese', 'english']].to_csv("kanji_filtered_sentences.csv", index=False)
    return filtered[['japanese', 'english']]


def filter_sentences_with_singular_kanji(target_kanji: str):
    """
    Finds all sentences where `target_kanji` appears in a word with only hiragana around it (and no other kanji).
    Example match: お愛し, 愛してる
    Example non-match: 愛情, 可愛い, 愛国心
    """
    print(f"type(target_kanji): {type(target_kanji)}")
    print(f"target_kanji: {target_kanji}")
    df=create_df_from_file()

    
    escaped_kanji = re.escape(target_kanji)

    regex_pattern_1 = r'(^|[^一-龯])([ぁ-ん]*'
    regex_pattern_2 = r'[ぁ-ん]*)([^一-龯]|$)'

    regex_pattern_whole = regex_pattern_1 + escaped_kanji + regex_pattern_2

    pattern = re.compile(regex_pattern_whole)


    filtered = df[df['japanese'].apply(lambda s: bool(pattern.search(s)))]

    # filtered[['japanese', 'english']].to_csv("sentences_with_愛_plus_hiragana.csv", index=False)
    return filtered[['japanese', 'english']]