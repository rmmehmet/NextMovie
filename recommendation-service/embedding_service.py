from sentence_transformers import SentenceTransformer
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = os.getenv("EMBEDDING_MODEL", "paraphrase-multilingual-MiniLM-L12-v2")

# Model bir kez yüklenir, servis boyunca bellekte kalır
_model = None

def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print(f"[EmbeddingService] Model yükleniyor: {MODEL_NAME}")
        _model = SentenceTransformer(MODEL_NAME)
        print("[EmbeddingService] Model hazır.")
    return _model


def build_text(title: str, overview: str, genres: str) -> str:
    """
    Filmin metin temsilini oluşturur.
    Genres ve title'ı önce yazarak modelin onlara daha fazla ağırlık vermesini sağlar.
    """
    parts = []
    if genres:
        parts.append(genres.replace(",", " "))
    if title:
        parts.append(title)
    if overview:
        parts.append(overview)
    return " ".join(parts)


def embed_text(text: str) -> List[float]:
    model = get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


def embed_batch(texts: List[str]) -> List[List[float]]:
    model = get_model()
    vectors = model.encode(texts, normalize_embeddings=True, batch_size=64, show_progress_bar=True)
    return vectors.tolist()