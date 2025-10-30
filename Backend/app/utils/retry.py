
import asyncio
import random
from typing import Callable, Any, Optional, Union
from functools import wraps
from tenacity import (
    retry, stop_after_attempt, wait_exponential, retry_if_exception_type,
    before_sleep_log, after_log
)
from loguru import logger

def async_retry(
    max_attempts: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    exceptions: tuple = (Exception,)
):
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            last_exception = None

            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e

                    if attempt == max_attempts - 1:
                        logger.error(f"Function {func.__name__} failed after {max_attempts} attempts: {e}")
                        raise e

                    delay = min(base_delay * (exponential_base ** attempt), max_delay)

                    if jitter:
                        delay *= (0.5 + random.random() * 0.5)

                    logger.warning(f"Function {func.__name__} failed (attempt {attempt + 1}/{max_attempts}): {e}. Retrying in {delay:.2f}s")
                    await asyncio.sleep(delay)

            raise last_exception

        return wrapper
    return decorator

def sync_retry(
    max_attempts: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    exceptions: tuple = (Exception,)
):
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_exception = None

            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e

                    if attempt == max_attempts - 1:
                        logger.error(f"Function {func.__name__} failed after {max_attempts} attempts: {e}")
                        raise e

                    delay = min(base_delay * (exponential_base ** attempt), max_delay)

                    if jitter:
                        delay *= (0.5 + random.random() * 0.5)

                    logger.warning(f"Function {func.__name__} failed (attempt {attempt + 1}/{max_attempts}): {e}. Retrying in {delay:.2f}s")
                    time.sleep(delay)

            raise last_exception

        return wrapper
    return decorator

def tenacity_retry(
    max_attempts: int = 3,
    wait_multiplier: float = 1.0,
    wait_min: float = 1.0,
    wait_max: float = 60.0,
    exceptions: tuple = (Exception,)
):
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(
            multiplier=wait_multiplier,
            min=wait_min,
            max=wait_max
        ),
        retry=retry_if_exception_type(exceptions),
        before_sleep=before_sleep_log(logger, "WARNING"),
        after=after_log(logger, "INFO")
    )

class RetryManager:

    def __init__(self):
        self.retry_counts: dict = defaultdict(int)
        self.max_retries_per_operation = 3

    async def execute_with_retry(
        self,
        operation: Callable,
        operation_name: str = "operation",
        max_attempts: int = 3,
        exceptions: tuple = (Exception,),
        *args,
        **kwargs
    ) -> Any:
        last_exception = None

        for attempt in range(max_attempts):
            try:
                if asyncio.iscoroutinefunction(operation):
                    result = await operation(*args, **kwargs)
                else:
                    result = operation(*args, **kwargs)

                self.retry_counts[operation_name] = 0
                return result

            except exceptions as e:
                last_exception = e
                self.retry_counts[operation_name] += 1

                if attempt == max_attempts - 1:
                    logger.error(f"{operation_name} failed after {max_attempts} attempts: {e}")
                    raise e

                delay = min(1.0 * (2 ** attempt), 60.0)

                logger.warning(f"{operation_name} failed (attempt {attempt + 1}/{max_attempts}): {e}. Retrying in {delay:.2f}s")
                await asyncio.sleep(delay)

        raise last_exception

    def get_retry_count(self, operation_name: str) -> int:
        return self.retry_counts[operation_name]

    def reset_retry_count(self, operation_name: str):
        self.retry_counts[operation_name] = 0

retry_manager = RetryManager()
