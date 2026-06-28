"""
indexer.py — PostgreSQL'deki filmleri okur, embedding üretir, Milvus'a yazar.
Sadece bir kez çalıştırılır. Yeni film eklendiğinde tekrar çalıştırılabilir
(zaten Milvus'ta olan filmler atlanır).

Kullanım:
    python indexer.py
    python indexer.py --reset   # Milvus'taki tüm vektörleri sil, yeniden yaz
"""

import argparse
import os
import psycopg2
from dotenv import load_dotenv
from embedding_service import build_text, embed_batch
from milvus_service import connect, get_or_create_collection, insert_vectors, \
    drop_collection, collection_count

load_dotenv()

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "port":     os.getenv("DB_PORT", "5432"),
    "dbname":   os.getenv("DB_NAME", "nextmovie"),
    "user":     os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
}

BATCH_SIZE = 256


def fetch_movies():
    conn = psycopg2.connect(**DB_CONFIG)
    cur  = conn.cursor()
    cur.execute("""
        SELECT id, title, overview, genres
        FROM movies
        ORDER BY id
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    print(f"[Indexer] PostgreSQL'den {len(rows)} film çekildi.")
    return rows


def fetch_existing_ids():
    from milvus_service import get_or_create_collection
    col = get_or_create_collection()
    if col.num_entities == 0:
        return set()
    results = col.query(expr="movie_id >= 0", output_fields=["movie_id"], limit=100000)
    return {r["movie_id"] for r in results}


def run(reset: bool = False):
    connect()

    if reset:
        drop_collection()
        print("[Indexer] Collection sıfırlandı.")

    movies = fetch_movies()

    if not reset:
        existing = fetch_existing_ids()
        before   = len(movies)
        movies   = [m for m in movies if m[0] not in existing]
        print(f"[Indexer] {before - len(movies)} film zaten Milvus'ta, {len(movies)} yeni film işlenecek.")

    if not movies:
        print("[Indexer] Eklenecek yeni film yok.")
        return

    # Batch halinde embed et ve yaz
    total   = len(movies)
    written = 0

    for i in range(0, total, BATCH_SIZE):
        batch = movies[i : i + BATCH_SIZE]

        ids   = [row[0] for row in batch]
        texts = [
            build_text(
                title    = row[1] or "",
                overview = row[2] or "",
                genres   = row[3] or "",
            )
            for row in batch
        ]

        vectors = embed_batch(texts)
        insert_vectors(ids, vectors)
        written += len(batch)
        print(f"[Indexer] İlerleme: {written}/{total}")

    print(f"[Indexer] Tamamlandı. Milvus'ta toplam: {collection_count()} film.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Milvus'u sıfırla ve yeniden yaz")
    args = parser.parse_args()
    run(reset=args.reset)