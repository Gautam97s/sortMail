#!/usr/bin/env python3
"""
Log Sanitization Test Suite
Verify that sensitive data is properly redacted from logs.
"""

import sys
import os
# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.logging.sanitizer import SensitiveDataSanitizer, setup_secure_logging
import logging

def test_sanitization():
    """Run comprehensive sanitization tests."""
    
    sanitizer = SensitiveDataSanitizer()
    
    test_cases = [
        {
            "name": "Database URL",
            "input": "Connected to postgresql://user:mysecretpassword@localhost:5432/sortmail",
            "should_not_contain": "mysecretpassword",
        },
        {
            "name": "JWT Token",
            "input": "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
            "should_not_contain": "eyJhbGciOiJIUzI1NiIs",
        },
        {
            "name": "API Key",
            "input": "Calling external API with api_key=sk-1234567890abcdefghij",
            "should_not_contain": "1234567890abcdef",
        },
        {
            "name": "OAuth Secret",
            "input": "OAuth client_secret: 0123456789abcdefghijklmnopqrstuvwxyz",
            "should_not_contain": "0123456789abcdef",
        },
        {
            "name": "Email Address Masking",
            "input": "User logged in: user@example.com",
            "should_not_contain": "user@example",
        },
        {
            "name": "Internal IP Masking",
            "input": "Connected to internal service at 192.168.1.1",
            "should_not_contain": "192.168.1",
        },
    ]
    
    passed = 0
    failed = 0
    
    print("🧪 Running Log Sanitization Tests...\n")
    
    for test in test_cases:
        sanitized = sanitizer._sanitize_string(test["input"])
        
        passed_test = True
        errors = []
        
        # Check if should_not_contain is NOT in result
        if test["should_not_contain"] in sanitized:
            errors.append(f"Found sensitive data '{test['should_not_contain']}' in result")
            passed_test = False
        
        if passed_test:
            print(f"✅ {test['name']}")
            print(f"   Input:  {test['input'][:70]}...")
            print(f"   Output: {sanitized[:70]}...")
            passed += 1
        else:
            print(f"❌ {test['name']}")
            for error in errors:
                print(f"   ERROR: {error}")
            print(f"   Input:  {test['input']}")
            print(f"   Output: {sanitized}")
            failed += 1
        
        print()
    
    print(f"\n📊 Results: {passed} passed, {failed} failed")
    
    return failed == 0

def test_logging_levels():
    """Test logging level configuration for different environments."""
    
    print("\n🔧 Testing Logging Configuration...\n")
    
    environments = [
        ("development", logging.DEBUG),
        ("staging", logging.INFO),
        ("production", logging.WARNING),
    ]
    
    for env, expected_level in environments:
        setup_secure_logging(environment=env, debug=False)
        logger = logging.getLogger("test")
        
        actual_level = logger.getEffectiveLevel()
        level_name = logging.getLevelName(expected_level)
        
        if actual_level == expected_level:
            print(f"✅ {env:15s} → {level_name}")
        else:
            print(f"❌ {env:15s} → Expected {level_name}, got {logging.getLevelName(actual_level)}")

def main():
    """Run all tests."""
    
    print("=" * 60)
    print("SortMail Log Sanitization Test Suite")
    print("=" * 60)
    print()
    
    success = test_sanitization()
    test_logging_levels()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ All tests passed! Logs are properly sanitized.")
        return 0
    else:
        print("❌ Some tests failed. Check output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
