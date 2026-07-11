"""
Simple shared-secret authentication: the .NET backend must send a header
'X-Internal-Api-Key' matching this service's configured key. This prevents
the AI microservice (which holds the OpenAI key) from being called directly
by the public internet — it should only ever be reached through the backend.
"""
from fastapi import Header, HTTPException, status

from app.core.config import get_settings

settings = get_settings()


async def verify_internal_api_key(x_internal_api_key: str = Header(default="")) -> None:
    if x_internal_api_key != settings.internal_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal API key.",
        )
