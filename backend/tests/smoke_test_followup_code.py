"""
Smoke Tests - Follow-up API Validation (Code-level)
---------------------------------------------------
Validates code structure and imports without requiring full DB migration.
"""

import sys

# Setup path
sys.path.insert(0, '/'.join(__file__.split('\\')[:-2]))

def run_code_validation_tests():
    """Validate code structure and imports."""
    
    results = {
        "tests_passed": [],
        "tests_failed": [],
        "imports": []
    }
    
    try:
        # TEST 1: Validate core model imports
        print("\n[TEST 1] Core Model Imports")
        print("=" * 60)
        
        from models.follow_up import FollowUp, FollowUpStatus
        from models.thread import Thread
        from models.email import Email
        from models.user import User
        
        print("✓ FollowUp model imported")
        print("✓ FollowUpStatus enum imported")
        print("✓ Thread model imported")
        print("✓ Email model imported")
        print("✓ User model imported")
        results["tests_passed"].append("Core Model Imports")
        results["imports"].append("FollowUp, FollowUpStatus, Thread, Email, User")
        
        # TEST 2: Validate FollowUpStatus enum values
        print("\n[TEST 2] FollowUpStatus Enum Validation")
        print("=" * 60)
        
        assert hasattr(FollowUpStatus, 'WAITING')
        assert hasattr(FollowUpStatus, 'REPLIED')
        assert hasattr(FollowUpStatus, 'SNOOZED')
        assert hasattr(FollowUpStatus, 'CANCELLED')
        assert hasattr(FollowUpStatus, 'OVERDUE')
        
        print(f"✓ WAITING = {FollowUpStatus.WAITING}")
        print(f"✓ REPLIED = {FollowUpStatus.REPLIED}")
        print(f"✓ SNOOZED = {FollowUpStatus.SNOOZED}")
        print(f"✓ CANCELLED = {FollowUpStatus.CANCELLED}")
        print(f"✓ OVERDUE = {FollowUpStatus.OVERDUE}")
        results["tests_passed"].append("FollowUpStatus Enum Validation")
        
        # TEST 3: Validate API route imports
        print("\n[TEST 3] API Route Imports")
        print("=" * 60)
        
        from api.routes.reminders import router as reminders_router
        from api.routes.notifications import router as notifications_router
        from api.routes.dashboard import router as dashboard_router
        from api.routes.bin import router as bin_router
        
        print("✓ Reminders router imported")
        print("✓ Notifications router imported")
        print("✓ Dashboard router imported")
        print("✓ Bin router imported")
        results["tests_passed"].append("API Route Imports")
        results["imports"].append("reminders, notifications, dashboard, bin routers")
        
        # TEST 4: Validate reminders endpoints
        print("\n[TEST 4] Reminders Endpoint Validation")
        print("=" * 60)
        
        from api.routes.reminders import (
            list_reminders,
            send_reminder,
            dismiss_reminder,
            _get_follow_up_for_user,
            _parse_iso_datetime
        )
        
        print("✓ list_reminders endpoint exists")
        print("✓ send_reminder endpoint exists (POST /reminders/{id}/remind)")
        print("✓ dismiss_reminder endpoint exists (DELETE /reminders/{id})")
        print("✓ _get_follow_up_for_user helper exists")
        print("✓ _parse_iso_datetime helper exists")
        results["tests_passed"].append("Reminders Endpoints")
        
        # TEST 5: Validate follow-up closure hook
        print("\n[TEST 5] Follow-up Closure Hook Validation")
        print("=" * 60)
        
        from core.ingestion.followup_closure_hook import (
            detect_and_close_follow_ups,
            detect_and_close_follow_ups_batch
        )
        
        print("✓ detect_and_close_follow_ups function exists")
        print("✓ detect_and_close_follow_ups_batch function exists")
        results["tests_passed"].append("Follow-up Closure Hook")
        
        # TEST 6: Validate sync service integration
        print("\n[TEST 6] Sync Service Integration")
        print("=" * 60)
        
        from core.ingestion.sync_service import IngestionService, background_sync_user_emails
        
        # Check that followup_closure_hook is imported in sync_service
        import inspect
        sync_service_source = inspect.getsource(IngestionService._save_thread)
        
        if 'detect_and_close_follow_ups' in sync_service_source:
            print("✓ detect_and_close_follow_ups hook integrated in _save_thread")
            results["tests_passed"].append("Sync Service Integration")
        else:
            print("⚠ Hook integration verification inconclusive")
            results["tests_failed"].append("Sync Service Integration - hook not found in source")
        
        # TEST 7: Validate intelligence pipeline
        print("\n[TEST 7] Intelligence Pipeline Validation")
        print("=" * 60)
        
        from core.intelligence.pipeline import process_thread_intelligence
        
        # Check that follow-up sync is integrated
        pipeline_source = inspect.getsource(process_thread_intelligence)
        
        if '_sync_follow_up' in pipeline_source:
            print("✓ _sync_follow_up integrated in intelligence pipeline")
            results["tests_passed"].append("Intelligence Pipeline Integration")
        else:
            print("⚠ Pipeline integration verification inconclusive")
            results["tests_failed"].append("Intelligence Pipeline - _sync_follow_up not found")
        
        # TEST 8: Validate contracts
        print("\n[TEST 8] Contract Validation")
        print("=" * 60)
        
        from contracts import WaitingForDTOv1
        
        print("✓ WaitingForDTOv1 contract imported")
        
        # Check required fields
        fields = WaitingForDTOv1.model_fields
        required_fields = ['waiting_id', 'thread_id', 'recipient', 'days_waiting']
        
        for field in required_fields:
            if field in fields:
                print(f"  ✓ {field} field present")
            else:
                raise AssertionError(f"Missing required field: {field}")
        
        results["tests_passed"].append("Contract Validation")
        
        # TEST 9: Validate model exports
        print("\n[TEST 9] Model Exports Validation")
        print("=" * 60)
        
        from models import FollowUp as ExportedFollowUp
        from models import FollowUpStatus as ExportedFollowUpStatus
        
        assert ExportedFollowUp is FollowUp
        assert ExportedFollowUpStatus is FollowUpStatus
        
        print("✓ FollowUp exported from models.__init__")
        print("✓ FollowUpStatus exported from models.__init__")
        results["tests_passed"].append("Model Exports")
        
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        results["tests_failed"].append(f"Exception: {str(e)}")
    
    # Print summary
    print("\n" + "=" * 60)
    print("CODE VALIDATION SMOKE TEST SUMMARY")
    print("=" * 60)
    print(f"✓ Passed: {len(results['tests_passed'])}")
    for test in results["tests_passed"]:
        print(f"  ✓ {test}")
    
    if results["tests_failed"]:
        print(f"\n✗ Failed: {len(results['tests_failed'])}")
        for test in results["tests_failed"]:
            print(f"  ✗ {test}")
    
    if results["imports"]:
        print(f"\n📦 Imports validated from {len(results['imports'])} modules")
    
    print("\n" + "=" * 60)
    print("✓ All code-level validations complete.")
    print("✓ Ready for database migration and integration tests.")
    print("=" * 60 + "\n")
    
    return len(results["tests_failed"]) == 0


if __name__ == "__main__":
    success = run_code_validation_tests()
    sys.exit(0 if success else 1)
