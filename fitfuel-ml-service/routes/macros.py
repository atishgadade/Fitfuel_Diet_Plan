from fastapi import APIRouter
from schemas.user_input import MacroExtractionRequest
from nlp.macro_extractor import extract_plan_macros
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/extract-macros")
async def extract_macros(req: MacroExtractionRequest):
    """
    Independent endpoint identifying explicit macros per plan without triggering similarities.
    Used for frontend explicit 'analyze plan' requests if Gateway triggers it individually.
    """
    logger.info(f"Extracting macros for plan: {req.plan.get('plan_name', 'Unknown')}")
    try:
        macros = extract_plan_macros(req.plan)
        return {"success": True, "macros": macros}
    except Exception as e:
        logger.error(f"Macro extraction failed: {str(e)}")
        return {"success": False, "error": str(e)}
