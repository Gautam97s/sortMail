import asyncio
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from core.storage.database import async_session as AsyncSessionLocal
from models.thread import Thread
from core.intelligence.pipeline import process_thread_intelligence
from core.storage.vector_store import vector_store

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_intelligence():
    """Test AI intelligence generation"""
    
    # Initialize ChromaDB FIRST
    try:
        await vector_store.initialize()
        logger.info("✅ ChromaDB initialized")
    except Exception as e:
        logger.error(f"❌ ChromaDB init failed: {e}")
    
    # Use async context and eager loading for all DB operations
    async with AsyncSessionLocal() as db:
        # We need selectinload to prevent detached lazily loaded exceptions on Thread ORM props
        # We removed selectinload(Thread.messages) since it's not a defined relationship
        stmt = select(Thread).order_by(Thread.last_email_at.desc()).limit(5)
        
        result = await db.execute(stmt)
        threads = result.scalars().all()
        
        if not threads:
            logger.warning("No threads found")
            return
        
        logger.info(f"Found {len(threads)} threads\n")
        
        # Process and log INSIDE async context sequentially
        for idx, thread in enumerate(threads, 1):
            logger.info(f"[{idx}/{len(threads)}] Processing: {thread.id}")
            logger.info(f"  Subject: {thread.subject[:80]}...")
            
            try:
                # Force re-process
                thread.intel_generated_at = None
                await db.commit()
                
                intel = await process_thread_intelligence(thread.id, thread.user_id, db)
                if intel:
                    logger.info(f"Success!")
                    logger.info(f"  Intent  : {intel.get('intent')}")
                    logger.info(f"  Urgency : {intel.get('urgency_score')}")
                    logger.info(f"  Summary : {intel.get('summary')[:100]}...\n")
                else:
                    logger.warning(f"Pipeline returned None for thread {thread.id}\n")
            except Exception as e:
                logger.error(f"Failed: {e}\n")
                
            # Throttle to respect free-tier Gemini API Limits (15 RPM = ~4s per request)
            logger.info("Sleeping 4s to respect API rate limits...\n")
            await asyncio.sleep(4)

if __name__ == "__main__":
    asyncio.run(test_intelligence())
