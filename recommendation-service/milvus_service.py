from pymilvus import connections, db, Collection, CollectionSchema, FieldSchema, DataType, utility
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

MILVUS_HOST   = os.getenv("MILVUS_HOST", "localhost")
MILVUS_PORT   = os.getenv("MILVUS_PORT", "19530")
MILVUS_DB     = os.getenv("MILVUS_DB", "nextmovie")
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "384"))
COLLECTION    = "movie_vectors"


def connect():
    connections.connect(host=MILVUS_HOST, port=MILVUS_PORT)
    # Veritabanı yoksa oluştur
    existing_dbs = db.list_database()
    if MILVUS_DB not in existing_dbs:
        db.create_database(MILVUS_DB)
        print(f"[Milvus] '{MILVUS_DB}' veritabanı oluşturuldu.")
    db.using_database(MILVUS_DB)
    print(f"[Milvus] Bağlantı kuruldu → {MILVUS_HOST}:{MILVUS_PORT} / db: {MILVUS_DB}")


def get_or_create_collection() -> Collection:
    if utility.has_collection(COLLECTION):
        col = Collection(COLLECTION)
        col.load()
        return col

    fields = [
        FieldSchema(name="movie_id",  dtype=DataType.INT64,        is_primary=True, auto_id=False),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM),
    ]
    schema = CollectionSchema(fields=fields, description="NextMovie film vektörleri")
    col    = Collection(name=COLLECTION, schema=schema)

    # IVF_FLAT index — cosine similarity
    index_params = {
        "metric_type": "COSINE",
        "index_type":  "IVF_FLAT",
        "params":      {"nlist": 128},
    }
    col.create_index(field_name="embedding", index_params=index_params)
    col.load()
    print(f"[Milvus] '{COLLECTION}' collection oluşturuldu ve index kuruldu.")
    return col


def insert_vectors(movie_ids: List[int], embeddings: List[List[float]]):
    col = get_or_create_collection()
    col.insert([movie_ids, embeddings])
    col.flush()
    print(f"[Milvus] {len(movie_ids)} vektör eklendi.")


def search_similar(query_vector: List[float], top_k: int = 10, exclude_id: int = None) -> List[int]:
    col = get_or_create_collection()

    search_params = {"metric_type": "COSINE", "params": {"nprobe": 16}}
    expr = f"movie_id != {exclude_id}" if exclude_id else None

    results = col.search(
        data          = [query_vector],
        anns_field    = "embedding",
        param         = search_params,
        limit         = top_k + 1,   # +1 çünkü filmin kendisi çıkabilir
        expr          = expr,
        output_fields = ["movie_id"],
    )

    similar_ids = []
    for hit in results[0]:
        mid = hit.entity.get("movie_id")
        if mid != exclude_id:
            similar_ids.append(mid)
        if len(similar_ids) >= top_k:
            break

    return similar_ids


def get_vector_by_id(movie_id: int) -> List[float]:
    col = get_or_create_collection()
    results = col.query(
        expr          = f"movie_id == {movie_id}",
        output_fields = ["embedding"],
    )
    if not results:
        return None
    return results[0]["embedding"]


def collection_count() -> int:
    col = get_or_create_collection()
    return col.num_entities


def drop_collection():
    if utility.has_collection(COLLECTION):
        Collection(COLLECTION).drop()
        print(f"[Milvus] '{COLLECTION}' silindi.")