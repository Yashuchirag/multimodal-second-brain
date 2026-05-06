import uuid
from ..core.database import supabase

BUCKET_NAME = "documents"


async def upload_file(file_bytes: bytes, filename: str, content_type: str) -> str:
    """
    Upload a file to Supabase Storage and return its public URL.

    Files are namespaced under a UUID prefix to avoid collisions:
      documents/<uuid>/<original-filename>
    """
    file_path = f"{uuid.uuid4()}/{filename}"

    supabase.storage.from_(BUCKET_NAME).upload(
        path=file_path,
        file=file_bytes,
        file_options={"content-type": content_type},
    )

    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_path)
    return public_url


async def delete_file(file_url: str) -> None:
    """
    Delete a file from Supabase Storage given its public URL.
    Extracts the path by stripping the bucket prefix from the URL.
    """
    # Extract path portion after the bucket name
    marker = f"/object/public/{BUCKET_NAME}/"
    if marker in file_url:
        file_path = file_url.split(marker)[-1]
        supabase.storage.from_(BUCKET_NAME).remove([file_path])
