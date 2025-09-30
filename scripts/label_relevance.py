"""Label news articles into Directly Relevant / Indirectly Useful / Not Relevant.

Usage:
  python3 scripts/label_relevance.py \
    --csv exports/the_mastercard_foundation_news_articles_20250929_141231.csv \
    --objective "We provide mobile wallet services and want to partner with companies that support digital payments adoption in Africa." \
    [--output exports/labeled.csv]

Requirements:
  - sentence-transformers
  - pandas, numpy
"""

import argparse
from pathlib import Path
from typing import List

import numpy as np
import pandas as pd

try:
    from sentence_transformers import SentenceTransformer, util
except Exception as exc:  # pragma: no cover
    raise SystemExit(f"Failed to import sentence-transformers: {exc}")


LABEL_DIRECT = "Directly Relevant"
LABEL_INDIRECT = "Indirectly Useful"
LABEL_NONE = "Not Relevant"


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Label article relevance using semantic similarity")
    parser.add_argument("--csv", required=True, help="Path to input CSV with columns: title, content, ...")
    parser.add_argument("--objective", required=True, help="SME objective text used as reference")
    parser.add_argument("--output", default=None, help="Optional output CSV path; defaults to <input>_labeled.csv")
    parser.add_argument("--model", default="all-MiniLM-L6-v2", help="SentenceTransformer model name")
    parser.add_argument("--direct_threshold", type=float, default=0.55, help="Similarity threshold for Directly Relevant")
    parser.add_argument("--indirect_threshold", type=float, default=0.35, help="Similarity threshold for Indirectly Useful")
    return parser


def classify_similarity(similarity: float, direct_th: float, indirect_th: float) -> str:
    if similarity >= direct_th:
        return LABEL_DIRECT
    if similarity >= indirect_th:
        return LABEL_INDIRECT
    return LABEL_NONE


def apply_keyword_boost(texts: List[str], base_scores: np.ndarray) -> np.ndarray:
    """Light keyword boosts to help obvious matches without dominating semantics."""
    keywords_direct = {
        "mobile wallet", "mobile-money", "mobile money", "wallet", "payments", "digital payments",
        "pos", "card", "cards", "tap to pay", "qr", "interchange", "acquiring", "issuing",
        "merchant", "fintech", "mpesa", "m-pesa"
    }
    keywords_africa = {
        "africa", "nigeria", "kenya", "ghana", "rwanda", "ethiopia", "uganda", "tanzania",
        "south africa", "cote d'ivoire", "ivory coast", "senegal"
    }

    boosted = base_scores.copy()
    for i, text in enumerate(texts):
        t = text.lower()
        boost = 0.0
        if any(k in t for k in keywords_direct):
            boost += 0.05
        if any(k in t for k in keywords_africa):
            boost += 0.03
        # Cap boost so it remains a nudge only
        boosted[i] = min(1.0, boosted[i] + boost)
    return boosted


def main() -> None:
    args = build_argument_parser().parse_args()

    input_path = Path(args.csv)
    if not input_path.exists():
        raise SystemExit(f"Input CSV not found: {input_path}")

    df = pd.read_csv(input_path)
    for col in ("title", "content"):
        if col not in df.columns:
            raise SystemExit(f"Missing required column: {col}")

    # Prepare texts
    titles = df["title"].fillna("").astype(str).tolist()
    contents = df["content"].fillna("").astype(str).tolist()
    texts = [f"{ti} {co}".strip() for ti, co in zip(titles, contents)]

    # Load model and compute embeddings
    model = SentenceTransformer(args.model)
    reference_text = args.objective.strip()
    ref_emb = model.encode(reference_text, normalize_embeddings=True)

    # Batch encode to handle large files efficiently
    batch_size = 256
    sims: List[float] = []
    for start in range(0, len(texts), batch_size):
        batch = texts[start:start + batch_size]
        batch_emb = model.encode(batch, normalize_embeddings=True)
        # cosine similarities between each row and reference
        cos = util.cos_sim(batch_emb, ref_emb).cpu().numpy().reshape(-1)
        sims.extend(cos.tolist())

    scores = np.array(sims, dtype=float)
    scores = apply_keyword_boost(texts, scores)

    labels = [
        classify_similarity(s, args.direct_threshold, args.indirect_threshold)
        for s in scores
    ]

    df_out = df.copy()
    df_out["label"] = labels
    df_out["semantic_score"] = scores

    # Determine output path
    if args.output:
        out_path = Path(args.output)
    else:
        out_path = input_path.with_name(input_path.stem + "_labeled" + input_path.suffix)

    df_out.to_csv(out_path, index=False)
    print(f"Labeled CSV saved: {out_path}")
    # Quick summary
    counts = df_out["label"].value_counts().to_dict()
    print({"counts": counts})


if __name__ == "__main__":
    main()


