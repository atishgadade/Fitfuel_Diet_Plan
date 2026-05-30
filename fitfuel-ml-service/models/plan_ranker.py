import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict

def rank_plans(
    user_vector: np.ndarray,
    plan_vectors: List[np.ndarray],
    plan_ids: List[str]
) -> List[Dict]:
    """
    Computes deterministic Cosine Similarities (distances) evaluating target offsets bridging the cold-start problem.
    Re-maps evaluated comparisons against original arrays outputting isolated sorting components prior to Multi-Score fusion outputs.
    """
    if not plan_vectors:
        return []
    
    # Ensure vectors are 2D for sklearn (e.g., reshape(1, -1))
    u_vec = user_vector.reshape(1, -1)
    p_vecs = np.vstack(plan_vectors)
    
    # Calculate similarities (returns shape: [1, num_plans])
    similarities = cosine_similarity(u_vec, p_vecs)[0]
    
    ranked_results = []
    for idx, sim in enumerate(similarities):
        ranked_results.append({
            "plan_id": plan_ids[idx],
            "similarity_score": float(sim)
        })
        
    # Sort descending
    ranked_results.sort(key=lambda x: x["similarity_score"], reverse=True)
    return ranked_results
