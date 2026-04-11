"""
Log Sanitization Filter
Removes sensitive data from logs to prevent leaks in Railway and other platforms.
"""

import logging
import re
import os
from typing import Any


class SensitiveDataSanitizer(logging.Filter):
    """Filter that sanitizes sensitive data from log records."""
    
    # Patterns for sensitive data
    SENSITIVE_PATTERNS = {
        # API Keys & Tokens
        'api_key': r'(?i)(api[_-]?key|apikey)\s*[:=]\s*[^\s,}";]\S+',
        'bearer_token': r'(?i)(bearer|token|authorization)\s*[:=]\s*[^\s,}";]\S+',
        'jwt_token': r'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',
        
        # Database URLs
        'db_url': r'(postgresql|mysql|sqlite)?://[^@]*@[^\s"\']+',
        
        # AWS/S3
        'aws_secret': r'(?i)(aws[_-]?secret[_-]?access[_-]?key|AKIA[0-9A-Z]{16})',
        
        # Email addresses (partial mask)
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        
        # OAuth secrets
        'oauth_secret': r'(?i)(client[_-]?secret|oauth[_-]?secret)\s*[:=]\s*[^\s,}";]\S+',
        
        # Encryption keys
        'encryption_key': r'(?i)(encryption[_-]?key|cipher[_-]?key|secret[_-]?key)\s*[:=]\s*[^\s,}";]\S+',
        
        # Credit card patterns
        'credit_card': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
        
        # IP addresses (partial mask internal ones)
        'internal_ip': r'\b(?:10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2[0-9]|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)\b',
    }
    
    # Environment variable names to redact
    SENSITIVE_ENV_VARS = {
        'JWT_SECRET',
        'ENCRYPTION_KEY',
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_CLIENT_ID',
        'MICROSOFT_CLIENT_SECRET',
        'MICROSOFT_CLIENT_ID',
        'OPENAI_API_KEY',
        'GEMINI_API_KEY',
        'HF_TOKEN',
        'BEDROCK_REGION_NAME',
        'DATABASE_URL',
        'REDIS_URL',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_ACCESS_KEY_ID',
        'CHROMA_API_KEY',
        'INTERNAL_SERVICE_TOKEN',
        'API_KEY',
        'SECRET_KEY',
        'TOKEN',
        'PASSWORD',
    }
    
    # Headers to redact from HTTP logs
    SENSITIVE_HEADERS = {
        'authorization',
        'x-api-key',
        'x-internal-service-token',
        'cookie',
        'x-auth-token',
        'x-access-token',
    }
    
    def __init__(self):
        """Initialize the sanitizer with compiled patterns."""
        super().__init__()
        self.compiled_patterns = {
            name: re.compile(pattern) 
            for name, pattern in self.SENSITIVE_PATTERNS.items()
        }
    
    def filter(self, record: logging.LogRecord) -> bool:
        """
        Sanitize the log record.
        
        Args:
            record: The log record to filter.
            
        Returns:
            True to allow the record to be logged.
        """
        # Sanitize the message
        if isinstance(record.msg, str):
            record.msg = self._sanitize_string(record.msg)
        
        # Sanitize message arguments
        if record.args:
            if isinstance(record.args, dict):
                record.args = {
                    k: self._sanitize_value(v) 
                    for k, v in record.args.items()
                }
            elif isinstance(record.args, (list, tuple)):
                record.args = tuple(
                    self._sanitize_value(arg) 
                    for arg in record.args
                )
        
        # Sanitize exception info
        if record.exc_text:
            record.exc_text = self._sanitize_string(record.exc_text)
        
        return True
    
    def _sanitize_string(self, text: str) -> str:
        """
        Sanitize a string by removing sensitive patterns.
        
        Args:
            text: The string to sanitize.
            
        Returns:
            The sanitized string.
        """
        if not isinstance(text, str):
            return text
        
        # Replace sensitive patterns
        for pattern_name, pattern in self.compiled_patterns.items():
            text = pattern.sub(self._mask_match, text)
        
        # Redact environment variable values
        for env_var in self.SENSITIVE_ENV_VARS:
            text = self._redact_env_var(text, env_var)
        
        # Redact common sensitive header patterns
        for header in self.SENSITIVE_HEADERS:
            text = self._redact_header(text, header)
        
        return text
    
    def _sanitize_value(self, value: Any) -> Any:
        """
        Sanitize a value recursively.
        
        Args:
            value: The value to sanitize.
            
        Returns:
            The sanitized value.
        """
        if isinstance(value, str):
            return self._sanitize_string(value)
        elif isinstance(value, dict):
            return {
                k: self._sanitize_value(v) 
                for k, v in value.items()
            }
        elif isinstance(value, (list, tuple)):
            return type(value)(
                self._sanitize_value(item) 
                for item in value
            )
        return value
    
    @staticmethod
    def _mask_match(match):
        """
        Create a masked version of a matched sensitive pattern.
        
        Args:
            match: The regex match object.
            
        Returns:
            A masked string.
        """
        matched_text = match.group(0)
        # Show first 5 and last 3 characters if long enough
        if len(matched_text) > 10:
            return f"{matched_text[:5]}{'*' * (len(matched_text) - 8)}{matched_text[-3:]}"
        else:
            return "*" * len(matched_text)
    
    @staticmethod
    def _redact_env_var(text: str, env_var: str) -> str:
        """
        Redact environment variable values from text.
        
        Args:
            text: The text to redact from.
            env_var: The environment variable name to redact.
            
        Returns:
            The redacted text.
        """
        # Match patterns like: ENV_VAR=value or ENV_VAR: value
        pattern = rf'(?i){env_var}\s*[:=]\s*[^\s,}}\]";]+' 
        return re.sub(pattern, f"{env_var}=***REDACTED***", text)
    
    @staticmethod
    def _redact_header(text: str, header: str) -> str:
        """
        Redact HTTP header values from text.
        
        Args:
            text: The text to redact from.
            header: The header name to redact.
            
        Returns:
            The redacted text.
        """
        # Match patterns like: header: value or "header": "value"
        pattern = rf'(?i)({header})\s*[:=]\s*[^\s,}}\]";]+'
        return re.sub(pattern, f"{header}: ***REDACTED***", text)


class StructuredFormatterWithSanitization(logging.Formatter):
    """Formatter that produces structured logs with sanitization."""
    
    def __init__(self):
        super().__init__()
        self.sanitizer = SensitiveDataSanitizer()
    
    def format(self, record: logging.LogRecord) -> str:
        """Format a log record with sanitization."""
        # Apply sanitization
        self.sanitizer.filter(record)
        
        # Format the message
        if record.args:
            try:
                formatted_msg = record.getMessage()
            except Exception:
                formatted_msg = str(record.msg)
        else:
            formatted_msg = str(record.msg)
        
        # Build the output
        return f"{record.levelname}|{record.name}|{formatted_msg}"


def setup_secure_logging(environment: str = "production", debug: bool = False):
    """
    Set up secure logging configuration for production.
    
    Args:
        environment: The environment (development, staging, production).
        debug: Whether debug logging is enabled.
    """
    # Determine log level
    if debug or environment.lower() in ("development", "dev"):
        log_level = logging.DEBUG
    elif environment.lower() in ("staging", "stage"):
        log_level = logging.INFO
    else:  # production
        log_level = logging.WARNING
    
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    
    # Add sanitizer filter to all handlers
    sanitizer = SensitiveDataSanitizer()
    console_handler.addFilter(sanitizer)
    
    # Set formatter
    formatter = logging.Formatter(
        fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(formatter)
    
    # Add handler to root logger
    root_logger.addHandler(console_handler)
    
    # Suppress verbose third-party loggers in production
    if environment.lower() == "production":
        logging.getLogger("urllib3").setLevel(logging.WARNING)
        logging.getLogger("botocore").setLevel(logging.WARNING)
        logging.getLogger("boto3").setLevel(logging.WARNING)
        logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
        logging.getLogger("chromadb").setLevel(logging.WARNING)
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
