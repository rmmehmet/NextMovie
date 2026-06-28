from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv

from embedding_service import build_text, embed_text
from milvus_service import connect, search_similar, get_vector_by_id, collection_count

load_dotenv()

app = FastAPI(title="NextMovie Recommendation Service", version="1.0.0")

# Başlangıçta Milvus'a bağlan
@app.on_event("startup")
def startup():
    connect()
    print(f"[Service] Hazır. Milvus'ta {collection_count()} film vektörü mevcut.")


# ── Request / Response modelleri ────────────────────────────

class SimilarRequest(BaseModel):
    movie_id: int
    top_k:    int = 10

class SimilarResponse(BaseModel):
    movie_id:    int
    similar_ids: List[int]

class SearchRequest(BaseModel):
    query: str      # Serbest metin (Modül 3 için)
    top_k: int = 10

class SearchResponse(BaseModel):
    query:       str
    similar_ids: List[int]


# ── Endpoints ───────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "vectors": collection_count()}


@app.post("/similar", response_model=SimilarResponse)
def get_similar(req: SimilarRequest):
    """
    Modül 1: Verilen film ID'sine en benzer top_k filmi döndürür.
    Film vektörü Milvus'tan çekilir, cosine similarity ile arama yapılır.
    """
    vector = get_vector_by_id(req.movie_id)
    if vector is None:
        raise HTTPException(status_code=404, detail=f"Film vektörü bulunamadı: {req.movie_id}")

    similar_ids = search_similar(
        query_vector = vector,
        top_k        = req.top_k,
        exclude_id   = req.movie_id,
    )
    return SimilarResponse(movie_id=req.movie_id, similar_ids=similar_ids)


@app.post("/search", response_model=SearchResponse)
def semantic_search(req: SearchRequest):
    """
    Modül 3: Serbest metin girişini embed eder, Milvus'ta arama yapar.
    Spring Boot bu endpoint'i doğal dil araması için kullanacak.
    """
    vector = embed_text(req.query)
    similar_ids = search_similar(query_vector=vector, top_k=req.top_k)
    return SearchResponse(query=req.query, similar_ids=similar_ids)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", "8001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)